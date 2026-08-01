"use client"

import { useEffect, useRef } from "react"
import { resolveCssVar } from "@/lib/canvas-utils"

// Render grid — small enough that ray-marching 60×22 cells per frame is cheap.
const COLS = 60
const ROWS = 22
const CELL_W = 7
const CELL_H = 11
const CANVAS_W = COLS * CELL_W
const CANVAS_H = ROWS * CELL_H

export function BlackHole() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef(0)
  const isVisibleRef = useRef(true)
  const yawRef = useRef(0.4)
  const pitchRef = useRef(-0.35)
  const zoomRef = useRef(1)
  const draggingRef = useRef(false)
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null)

  const TARGET_INTERVAL_MS = 1000 / 30 // 30 fps cap

  // Black-hole scene params.
  const HORIZON_R = 0.5 // event horizon radius
  const DISK_INNER = 1.4
  const DISK_OUTER = 4.5
  const DISK_THICKNESS = 0.18
  const DISK_Y = 0 // disk lies on the XZ plane
  const LENS_STRENGTH = 1.1 // how strongly rays bend near the horizon
  const DISK_PEAK_R = 1.8 // brightest radius of the disk
  const FAR = 16
  const DISK_STEPS = 48
  const BH_Y = 0 // black hole center sits at origin

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const [br, bg, bb] = resolveCssVar("--background")
    const [fr, fg, fb] = resolveCssVar("--primary")
    const fgColor = `rgb(${fr}, ${fg}, ${fb})`

    ctx.font = `${CELL_H}px ui-monospace, SFMono-Regular, Menlo, monospace`
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) isVisibleRef.current = entry.isIntersecting
      },
      { threshold: 0.05 },
    )
    io.observe(canvas)

    // 2D value noise for the disk swirl pattern. No external deps.
    const noise2 = (x: number, y: number) => {
      const ix = Math.floor(x), iy = Math.floor(y)
      const fx = x - ix, fy = y - iy
      const u = fx * fx * (3 - 2 * fx)
      const v = fy * fy * (3 - 2 * fy)
      const h = (a: number, b: number) => {
        const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453
        return s - Math.floor(s)
      }
      const x0 = h(ix, iy) * (1 - u) + h(ix + 1, iy) * u
      const x1 = h(ix, iy + 1) * (1 - u) + h(ix + 1, iy + 1) * u
      return x0 * (1 - v) + x1 * v
    }

    /**
     * Disk density at world point (px, py, pz). Reads as a thin luminous ring
     * centered on DISK_Y, peaking at DISK_PEAK_R. Animated by `phase` so the
     * disk appears to orbit. Returns 0 outside the disk band.
     * Caller applies doppler modulation separately.
     */
    const diskDensity = (px: number, py: number, pz: number, phase: number) => {
      const yOff = Math.abs(py - DISK_Y)
      if (yOff > DISK_THICKNESS * 2.5) return 0
      const r = Math.sqrt(px * px + pz * pz)
      if (r < DISK_INNER * 0.85 || r > DISK_OUTER) return 0
      const yFall = Math.exp(-(yOff * yOff) / (DISK_THICKNESS * DISK_THICKNESS * 0.5))
      const radial = r < DISK_PEAK_R
        ? Math.pow((r - DISK_INNER) / (DISK_PEAK_R - DISK_INNER), 1.2)
        : Math.exp(-((r - DISK_PEAK_R) / 1.3) * ((r - DISK_PEAK_R) / 1.3))
      const angle = Math.atan2(pz, px)
      const swirl = noise2(Math.cos(angle) * 3.0 + phase, Math.sin(angle) * 3.0 + phase * 0.7)
      return yFall * radial * (0.55 + 0.45 * swirl)
    }

    // Lambert shading + 5-tier ASCII char palette by intensity.
    const chars = [" ", ".", ":", "+", "*", "#", "@"]

    const onPointerDown = (e: PointerEvent) => {
      draggingRef.current = true
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        yaw: yawRef.current,
        pitch: pitchRef.current,
      }
      canvas.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current || !dragStartRef.current) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      yawRef.current = dragStartRef.current.yaw + dx * 0.012
      pitchRef.current = Math.max(-1.45, Math.min(1.45, dragStartRef.current.pitch - dy * 0.012))
    }

    const onPointerUp = (e: PointerEvent) => {
      draggingRef.current = false
      dragStartRef.current = null
      try { canvas.releasePointerCapture(e.pointerId) } catch {}
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomRef.current = Math.max(0.6, Math.min(2.2, zoomRef.current * (1 - e.deltaY * 0.0015)))
    }

    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("pointercancel", onPointerUp)
    canvas.addEventListener("wheel", onWheel, { passive: false })

    const step = (now: number) => {
      if (!isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(step)
        return
      }
      const elapsed = now - lastFrameRef.current
      if (elapsed < TARGET_INTERVAL_MS) {
        rafRef.current = requestAnimationFrame(step)
        return
      }
      lastFrameRef.current = now - (elapsed % TARGET_INTERVAL_MS)

      // Slow auto-orbit when not dragging so the sphere reads as alive.
      if (!draggingRef.current) yawRef.current += 0.006

      // Clear canvas with background.
      ctx.fillStyle = `rgb(${br}, ${bg}, ${bb})`
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      const yaw = yawRef.current
      const pitch = pitchRef.current
      const cy = Math.cos(yaw), sy = Math.sin(yaw)
      const cp = Math.cos(pitch), sp = Math.sin(pitch)

      // Camera position — orbit around the black hole at origin.
      const camDist = 4.0 / zoomRef.current
      const camX = sy * cp * camDist
      const camY = -sp * camDist + BH_Y
      const camZ = cy * cp * camDist

      // Build camera basis vectors: forward (toward target), right, up.
      const targetX = 0, targetY = BH_Y, targetZ = 0
      let fwdX = targetX - camX, fwdY = targetY - camY, fwdZ = targetZ - camZ
      const fwdLen = Math.sqrt(fwdX * fwdX + fwdY * fwdY + fwdZ * fwdZ) + 1e-5
      fwdX /= fwdLen; fwdY /= fwdLen; fwdZ /= fwdLen

      // World up = +Y. Right = normalize(cross(fwd, up)).
      let rgtX = fwdZ, rgtY = 0, rgtZ = -fwdX
      const rgtLen = Math.sqrt(rgtX * rgtX + rgtZ * rgtZ) + 1e-5
      rgtX /= rgtLen; rgtZ /= rgtLen

      // Up = cross(rgt, fwd).
      const upX = rgtY * fwdZ - rgtZ * fwdY
      const upY = rgtZ * fwdX - rgtX * fwdZ
      const upZ = rgtX * fwdY - rgtY * fwdX

      // Fixed key light from upper-right (in world space).
      const lx = 0.7
      const ly = 0.65
      const lz = 0.3

      // For each output cell, cast a ray and shade.
      ctx.fillStyle = fgColor
      const aspectX = CANVAS_W / CANVAS_H
      const focal = 1.0
      const phase = lastFrameRef.current * 0.0006

      // Camera direction in the XZ plane (used for the doppler term).
      const camAZLen = Math.sqrt(camX * camX + camZ * camZ) + 1e-5
      const camNx = camX / camAZLen
      const camNz = camZ / camAZLen

      for (let r = 0; r < ROWS; r++) {
        const v = (r + 0.5) / ROWS * 2 - 1
        for (let c = 0; c < COLS; c++) {
          const u = ((c + 0.5) / COLS * 2 - 1) * aspectX

          // Initial ray direction in world space.
          let dx = fwdX + u * focal * rgtX + v * focal * upX
          let dy = fwdY + u * focal * rgtY + v * focal * upY
          let dz = fwdZ + u * focal * rgtZ + v * focal * upZ
          const dlen = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-5
          dx /= dlen; dy /= dlen; dz /= dlen

          // 1) Event horizon — sphere-trace against a fixed sphere.
          let t = 0
          let horizonHit = false
          for (let i = 0; i < 32; i++) {
            const px = camX + dx * t
            const py = camY + dy * t
            const pz = camZ + dz * t
            const r2 = px * px + py * py + pz * pz
            if (r2 < HORIZON_R * HORIZON_R) { horizonHit = true; break }
            const rr = Math.sqrt(r2)
            t += Math.max(0.02, rr - HORIZON_R)
            if (t > FAR) break
          }

          if (horizonHit) {
            // Render the void — a low-alpha glyph reads as the shadow.
            ctx.globalAlpha = 0.35
            ctx.fillText("·", c * CELL_W + CELL_W / 2, r * CELL_H + CELL_H / 2)
            continue
          }

          // 2) Gravitational lensing — deflect rays passing close to origin.
          // Closest approach of the line to origin: t* = -dot(ro, rd).
          const tClosest = -(camX * dx + camY * dy + camZ * dz)
          const cxC = camX + tClosest * dx
          const cyC = camY + tClosest * dy
          const czC = camZ + tClosest * dz
          const b2 = cxC * cxC + cyC * cyC + czC * czC
          const b = Math.sqrt(b2)
          if (b < 3.0) {
            // Inverse-square-ish deflection. Bend Y toward the disk plane so
            // the back of the disk arcs over the silhouette.
            const deflect = (LENS_STRENGTH * HORIZON_R) / Math.max(0.25, b2)
            const sign = dy >= 0 ? 1 : -1
            dy -= sign * deflect * 0.55
            const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-5
            dx /= dl; dy /= dl; dz /= dl
          }

          // 3) March through the disk plane and accumulate brightness.
          let brightness = 0
          const startT = Math.max(0, tClosest)
          const stepLen = (FAR - startT) / DISK_STEPS
          let px = camX + dx * startT
          let py = camY + dy * startT
          let pz = camZ + dz * startT
          for (let i = 0; i < DISK_STEPS; i++) {
            const d = diskDensity(px, py, pz, phase)
            if (d > 0) {
              const rr = Math.sqrt(px * px + pz * pz) + 1e-5
              const angle = Math.atan2(pz, px)
              const ovx = -Math.sin(angle)
              const ovz = Math.cos(angle)
              const dop = ovx * camNx + ovz * camNz
              const doppler = Math.max(0.25, 0.55 + 0.45 * dop)
              brightness += d * doppler
            }
            px += dx * stepLen
            py += dy * stepLen
            pz += dz * stepLen
          }

          if (brightness < 0.04) continue

          const I = Math.max(0, Math.min(1, brightness * 0.85))
          const ci = Math.min(chars.length - 1, Math.floor(I * chars.length))
          const ch = chars[ci]
          if (ch === " ") continue
          ctx.globalAlpha = 0.45 + 0.55 * I
          ctx.fillText(ch, c * CELL_W + CELL_W / 2, r * CELL_H + CELL_H / 2)
        }
      }
      ctx.globalAlpha = 1

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      io.disconnect()
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("pointercancel", onPointerUp)
      canvas.removeEventListener("wheel", onWheel)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="rounded border border-border bg-background cursor-grab active:cursor-grabbing"
      aria-label="3D ASCII black hole — accretion disk with gravitational lensing around an event horizon; drag to orbit the camera, scroll to zoom"
    />
  )
}

export const BLACK_HOLE_GRID = `${COLS}×${ROWS}`