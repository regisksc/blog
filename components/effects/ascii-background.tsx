"use client"

import { useEffect, useRef } from "react"
import { resolveCssVar } from "@/lib/canvas-utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

// Ramp with more drawable glyphs so the palette-cycle motion reads clearly.
const CHAR_RAMP = " .·:-=+*≈▒"
const RAMP_LEN = CHAR_RAMP.length
const BASE_CELL = 14
const LARGE_CELL = 18
const LARGE_AREA_THRESHOLD = 2_500_000 // px² — bump cell size above this
const FRAME_INTERVAL = 1000 / 13 // ~13fps
const MAX_DPR = 2
const CYCLE_SPEED = 1.1 // ramp offsets per second (palette rotation)
const DRIFT_SPEED = 0.9 // cells/sec the noise field scrolls ("circling")
const DRIFT_AMP = 4.5 // cells — swirl amplitude of the field drift
const RIP_RADIUS = 16 // cells — invisible pointer "event horizon" radius
const RIP_PULL = 14 // cells — how far nearby dots are drawn toward the cursor
const RECOLOR_SPEED = 0.18 // how fast the random recolor mask evolves over time
const RECOLOR_FRACTION = 0.14 // ~14% of cells wear the alternate tint at a time

/**
 * Full-viewport animated ASCII field, color-cycling style.
 *
 * A STATIC domain-warped value-noise field is computed once per resize
 * (the "waves seen from above, circling randomly" base). Motion comes not
 * from recomputing the field but from cycling the character-intensity ramp
 * offset through the field over time — the classic palette-rotation look,
 * rendered as ASCII.
 *
 * The pointer carries an invisible radius that "rips" the field: cells near
 * the cursor get their value displaced with a distance falloff, tearing a
 * wake/hole through the noise. Cheap, dependency-free; respects
 * reduced-motion and tab visibility.
 */
export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let cellSize = BASE_CELL
    let cols = 0
    let rows = 0
    let cssW = 0
    let cssH = 0
    let dpr = 1

    // Static noise field, normalized to [0,1], one entry per cell.
    let field = new Float32Array(0)

    // Pointer position in CELL coordinates (-1 = off-field / not yet moved).
    let pointerCol = -1
    let pointerRow = -1

    // Resolved primary color (re-read on theme change).
    let color: [number, number, number] = resolveCssVar("--primary")
    let isLight = document.documentElement.classList.contains("light")

    const refreshTheme = () => {
      color = resolveCssVar("--primary")
      isLight = document.documentElement.classList.contains("light")
    }

    // Decorrelated 2D integer hash (bit-mixing). The old single-sine hash
    // (sin(ix*a + iy*b)) correlated x and y along lines of constant a*x+b*y,
    // so the interpolated field collapsed into diagonal/horizontal ridges.
    // This mixes each coordinate independently → no directional structure.
    const hash = (ix: number, iy: number) => {
      let h = (ix | 0) * 374761393 + (iy | 0) * 668265263
      h = (h ^ (h >>> 13)) * 1274126177
      h = h ^ (h >>> 16)
      return ((h >>> 0) % 100000) / 100000 // [0,1)
    }
    const smooth = (t: number) => t * t * (3 - 2 * t)
    const valueNoise = (px: number, py: number) => {
      const x0 = Math.floor(px)
      const y0 = Math.floor(py)
      const fx = smooth(px - x0)
      const fy = smooth(py - y0)
      const n00 = hash(x0, y0)
      const n10 = hash(x0 + 1, y0)
      const n01 = hash(x0, y0 + 1)
      const n11 = hash(x0 + 1, y0 + 1)
      const nx0 = n00 + (n10 - n00) * fx
      const nx1 = n01 + (n11 - n01) * fx
      return nx0 + (nx1 - nx0) * fy // [0,1)
    }
    // Fractal Brownian motion: several octaves at rotated frames so the field
    // has coherent large forms with no dominant axis.
    const fbm = (px: number, py: number) => {
      let sum = 0
      let amp = 0.5
      let freq = 1
      // Rotation per octave breaks axis-aligned alignment between octaves.
      const ca = 0.8, sa = 0.6 // cos/sin of a fixed ~37° rotation
      let x = px
      let y = py
      for (let o = 0; o < 4; o++) {
        sum += valueNoise(x * freq, y * freq) * amp
        // rotate coords for the next octave
        const nx = ca * x - sa * y
        const ny = sa * x + ca * y
        x = nx
        y = ny
        freq *= 2.0
        amp *= 0.5
      }
      return sum // ~[0,1)
    }

    // Build the static base field with domain-warped fBm so it reads as
    // coherent curved forms (no axis-aligned banding). Motion at draw time
    // comes from the drift offset applied when sampling this field.
    const buildField = () => {
      field = new Float32Array(cols * rows)
      const scale = 0.08 // base form size
      const warpScale = 0.06
      const warpAmp = 5.0 // strong warp → forms bend and swirl
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Domain warp: offset the sample by another fBm pass so the forms
          // curve rather than run straight.
          const wx = fbm(x * warpScale + 19.7, y * warpScale + 4.2) * warpAmp
          const wy = fbm(x * warpScale - 8.1, y * warpScale + 27.5) * warpAmp
          const v = fbm((x + wx) * scale, (y + wy) * scale)
          field[y * cols + x] = v < 0 ? 0 : v > 1 ? 1 : v
        }
      }
    }

    // Bilinear sample of the static field at fractional cell coords (clamped),
    // so the rip can read a displaced position and make the waves part.
    const sampleField = (fx: number, fy: number) => {
      if (cols === 0 || rows === 0) return 0
      const cx = fx < 0 ? 0 : fx > cols - 1 ? cols - 1 : fx
      const cy = fy < 0 ? 0 : fy > rows - 1 ? rows - 1 : fy
      const x0 = Math.floor(cx)
      const y0 = Math.floor(cy)
      const x1 = Math.min(cols - 1, x0 + 1)
      const y1 = Math.min(rows - 1, y0 + 1)
      const tx = cx - x0
      const ty = cy - y0
      const a = field[y0 * cols + x0]
      const b = field[y0 * cols + x1]
      const c = field[y1 * cols + x0]
      const d = field[y1 * cols + x1]
      const top = a + (b - a) * tx
      const bot = c + (d - c) * tx
      return top + (bot - top) * ty
    }

    const resize = () => {
      cssW = window.innerWidth
      cssH = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      // On very large viewports, use bigger cells to cut fillText calls.
      cellSize = cssW * cssH > LARGE_AREA_THRESHOLD ? LARGE_CELL : BASE_CELL
      cols = Math.ceil(cssW / cellSize)
      rows = Math.ceil(cssH / cellSize)
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${cellSize}px var(--font-mono, monospace)`
      ctx.textBaseline = "top"
      buildField()
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, cssW, cssH)
      const [r, g, b] = color
      // Color recipe — flips with theme.
      // Dark mode: bias toward bright green so the noise reads as a green
      // haze against the dark background.
      // Light mode: use the resolved primary at full strength so the noise
      // reads as dark marks against the white background.
      let gr: number, gg: number, gb: number
      let tr: number, tg: number, tb: number
      if (isLight) {
        gr = Math.round(r * 0.85)
        gg = Math.round(g * 0.85)
        gb = Math.round(b * 0.85)
        // Amber-on-paper alternate tint — slightly redder, so the recolor
        // subset reads as a different hue rather than a brighter amber.
        tr = Math.round(160 + 40 * Math.sin(t * 0.25))
        tg = Math.round(100 + 30 * Math.sin(t * 0.25 + 2))
        tb = Math.round(40 + 20 * Math.sin(t * 0.25 + 4))
      } else {
        gr = Math.round(r * 0.55)
        gg = Math.min(255, Math.round(g * 0.7 + 90))
        gb = Math.round(b * 0.55)
        // Cyan-teal alternate tint for the recolor subset.
        const tintPhase = t * 0.25
        tr = Math.round(40 + 40 * Math.sin(tintPhase))
        tg = Math.min(255, Math.round(150 + 60 * Math.sin(tintPhase + 2)))
        tb = Math.min(255, Math.round(150 + 80 * Math.sin(tintPhase + 4)))
      }
      // Palette rotation: a fractional ramp offset that advances over time.
      const cycle = t * CYCLE_SPEED
      // Slow overall glide plus a per-cell time-varying warp (below) so the
      // forms bend, swell and reform instead of sliding as a rigid block.
      // The glide ORBITS (bounded) rather than ramping linearly — an
      // unbounded linear glide progressively samples the field along one
      // axis and stretches the forms horizontal over time.
      const glideR = DRIFT_AMP * 2.5
      const glideX = Math.cos(t * DRIFT_SPEED * 0.35) * glideR
      const glideY = Math.sin(t * DRIFT_SPEED * 0.35) * glideR
      const wt = t * 0.5 // warp time
      const hasPointer = pointerCol >= 0
      const ripR2 = RIP_RADIUS * RIP_RADIUS

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Per-cell warp: low-frequency sines in x/y and time. Neighbors get
          // nearly the same offset (spatial coherence), but the offset varies
          // across the field and over time, so forms locally evolve.
          // Every term mixes BOTH x and y so none is uniform along a row or
          // column (which would create horizontal/vertical streaks).
          const warpX =
            Math.sin(x * 0.05 + y * 0.037 + wt) * DRIFT_AMP +
            Math.cos(x * 0.028 - y * 0.045 - wt * 0.7) * (DRIFT_AMP * 0.6)
          const warpY =
            Math.cos(x * 0.041 - y * 0.052 + wt * 0.9) * DRIFT_AMP +
            Math.sin(x * 0.033 + y * 0.047 + wt * 0.6) * (DRIFT_AMP * 0.6)
          let sx = x + glideX + warpX
          let sy = y + glideY + warpY
          let ripT = 0 // 0 outside rip → 1 at the pointer; drives the wake
          if (hasPointer) {
            const dx = x - pointerCol
            const dy = y - pointerRow
            const d2 = dx * dx + dy * dy
            if (d2 < ripR2 && d2 > 0.0001) {
              const dist = Math.sqrt(d2)
              const falloff = 1 - dist / RIP_RADIUS // 1 at center → 0 at edge
              ripT = falloff
              // Black hole: pull the sample position TOWARD the cursor so
              // nearby dots are drawn inward (stronger closer to the core).
              const pull = falloff * falloff * RIP_PULL
              sx += (dx / dist) * pull
              sy += (dy / dist) * pull
            }
          }

          const n = sampleField(sx, sy)

          // Cycle the ramp index through the (static) field value.
          const idxF = n * RAMP_LEN + cycle
          let idx = Math.floor(idxF) % RAMP_LEN
          if (idx < 0) idx += RAMP_LEN
          const ch = CHAR_RAMP[idx]
          if (ch === " ") continue

          const vis = n < 0 ? 0 : n > 1 ? 1 : n
          // Visible green haze on dark, dark ink on light.
          let alpha = isLight
            ? 0.20 + vis * 0.28 // 0.20–0.48 — needs to read on white
            : 0.14 + vis * 0.20 // 0.14–0.34

          // Event horizon: hollow the core right under the cursor.
          if (ripT > 0.72) continue // black-hole core

          // Random recolor: a per-cell hash that drifts with time crosses a
          // threshold for ~RECOLOR_FRACTION of cells at any moment, so a
          // shifting, random subset wears the alternate tint.
          const rc = hash(x * 1.7 + 3, y * 1.3 + Math.floor(t * RECOLOR_SPEED) * 7.3)
          if (rc < RECOLOR_FRACTION) {
            ctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${alpha.toFixed(3)})`
          } else {
            ctx.fillStyle = `rgba(${gr}, ${gg}, ${gb}, ${alpha.toFixed(3)})`
          }
          ctx.fillText(ch, x * cellSize, y * cellSize)
        }
      }
    }

    resize()

    // Reduced motion or SSR: draw one static frame and stop.
    if (reducedMotion) {
      draw(0)
      return
    }

    let rafId = 0
    let lastFrame = 0
    let startTime = performance.now()
    let paused = false

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop)
      if (paused) return
      if (now - lastFrame < FRAME_INTERVAL) return
      lastFrame = now
      draw((now - startTime) / 1000)
    }
    rafId = requestAnimationFrame(loop)

    // Canvas is pointer-events-none, so track the pointer on the window and
    // translate viewport coords → grid cells.
    const onPointerMove = (e: PointerEvent) => {
      pointerCol = e.clientX / cellSize
      pointerRow = e.clientY / cellSize
    }
    const onPointerLeave = () => {
      pointerCol = -1
      pointerRow = -1
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    document.addEventListener("pointerleave", onPointerLeave)

    const onVisibility = () => {
      paused = document.hidden
      if (!paused) {
        // Resync the clock so the pattern doesn't jump after unpausing.
        startTime = performance.now() - lastFrame
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    // Debounced resize.
    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 120)
    }
    window.addEventListener("resize", onResize)

    // Re-resolve color when the theme class on <html> changes.
    const observer = new MutationObserver(refreshTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerleave", onPointerLeave)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", onResize)
      if (resizeTimer) clearTimeout(resizeTimer)
      observer.disconnect()
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  )
}
