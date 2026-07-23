"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const W = 80
const ACCRETION_RADIUS = 18
const RAYMARCH_STEPS = 24
const EARLY_EXIT_DIST = 80
const DISK_THICKNESS = 8
const BLACK_HOLE_PALETTE = " .:-=+*#%@
const H = 30

// Scaffold — raymarch loop + accretion disk + doppler + camera drag land in #208-#212.
export function BlackHole() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraThetaRef = useRef(0)
  const reducedMotion = useReducedMotion()
  const zoomRef = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let rafId = 0
    const onDrag = (e: PointerEvent) => { cameraThetaRef.current = (e.clientX / canvas.width) * Math.PI * 2 }
    const onWheel = (e: WheelEvent) => { e.preventDefault(); zoomRef.current = Math.max(0.5, Math.min(3, zoomRef.current - e.deltaY * 0.001)) }
    canvas.addEventListener("wheel", onWheel)
    canvas.addEventListener("pointermove", onDrag)
    if (reducedMotion) {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }
    const step = () => {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      let steps = 0
      for (let y = 0; y < canvas.height; y += 8) {
        steps += 1
        if (steps > RAYMARCH_STEPS) break
        for (let x = 0; x < canvas.width; x += 6) {
          const dx = (x - cx) / 6
          const dy = (y - cy) / 8
          const r = Math.sqrt(dx * dx + dy * dy)
          if (r > EARLY_EXIT_DIST) continue
          if (r > ACCRETION_RADIUS && r < ACCRETION_RADIUS + DISK_THICKNESS) {
            const doppler = Math.cos(Math.atan2(dy, dx)) * 0.5 + 0.5
            ctx.fillStyle = `hsl(${30 + doppler * 180}, 80%, ${50 - r}%)`
            ctx.fillText(BLACK_HOLE_PALETTE[Math.floor(doppler * (BLACK_HOLE_PALETTE.length - 1))], x, y)
          }
        }
      }
      rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    canvas.removeEventListener("pointermove", onDrag)
    canvas.removeEventListener("wheel", onWheel)
    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={W * 6}
      height={H * 8}
      className="rounded border border-border bg-background cursor-grab"
      aria-label="ASCII 3D black hole with accretion disk"
    />
  )
}
