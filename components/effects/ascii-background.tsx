"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const GLYPH_RAMP = " .·:-=+*≈▒"
const RAMP_LEN = GLYPH_RAMP.length
const BASE_CELL = 14
const LARGE_CELL = 18
const LARGE_AREA_THRESHOLD = 2_500_000
const FRAME_INTERVAL = 1000 / 13
const CYCLE_SPEED = 1.1
const CULL_THRESHOLD = 0.06 // skip cells below this value (perf)
const RIP_RADIUS = 16
const RIP_PULL = 14

function glyphFor(value: number, cycle: number): string {
  const idx = Math.floor(value * RAMP_LEN + cycle) % RAMP_LEN
  return GLYPH_RAMP[idx < 0 ? idx + RAMP_LEN : idx]
}

function alphaFor(value: number): number {
  return 0.10 + value * 0.22
}

export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let raf = 0
    let last = 0
    let start = performance.now()
    let pointerCol = -1
    let pointerRow = -1

    const draw = (t: number) => {
      const w = window.innerWidth
      const h = window.innerHeight
      const cellSize = w * h > LARGE_AREA_THRESHOLD ? LARGE_CELL : BASE_CELL
      canvas.width = w
      canvas.height = h
      ctx.font = `${cellSize}px var(--font-mono, monospace)`
      ctx.textBaseline = "top"
      ctx.clearRect(0, 0, w, h)
      const cycle = ((t - start) / 1000) * CYCLE_SPEED
      const cols = Math.ceil(w / cellSize)
      const rows = Math.ceil(h / cellSize)
      const ripR2 = RIP_RADIUS * RIP_RADIUS
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let sx = x
          let sy = y
          if (pointerCol >= 0) {
            const dx = x - pointerCol
            const dy = y - pointerRow
            const d2 = dx * dx + dy * dy
            if (d2 < ripR2 && d2 > 0.0001) {
              const dist = Math.sqrt(d2)
              const falloff = 1 - dist / RIP_RADIUS
              const pull = falloff * falloff * RIP_PULL
              sx += (dx / dist) * pull
              sy += (dy / dist) * pull
            }
          }
          const v = (Math.sin(sx * 0.3 + cycle * 0.1) * Math.cos(sy * 0.3 - cycle * 0.1) + 1) / 2
          const ch = glyphFor(v, cycle)
          if (v < CULL_THRESHOLD) continue
          if (ch !== " ") {
            ctx.fillStyle = `rgba(120,140,160,${alphaFor(v).toFixed(3)})`
            ctx.fillText(ch, x * cellSize, y * cellSize)
          }
        }
      }
    }

    if (reducedMotion) { draw(0); return }
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (paused) return
      if (now - last < FRAME_INTERVAL) return
      last = now
      draw(now)
    }
    raf = requestAnimationFrame(loop)
    const onPointerMove = (e: PointerEvent) => {
      pointerCol = e.clientX / BASE_CELL
      pointerRow = e.clientY / BASE_CELL
    }
    let paused = false
    const onVisibility = () => { paused = document.hidden }
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pointermove", onPointerMove)
    document.addEventListener("pointerleave", onPointerLeave)
    const onResize = () => { start = performance.now(); last = 0 }
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerleave", onPointerLeave)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none" />
}
