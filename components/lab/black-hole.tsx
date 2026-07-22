"use client"

import { useEffect, useRef } from "react"

const W = 80
const ACCRETION_RADIUS = 18
const DISK_THICKNESS = 8
const H = 30

// Scaffold — raymarch loop + accretion disk + doppler + camera drag land in #208-#212.
export function BlackHole() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraThetaRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let rafId = 0
    const onDrag = (e: PointerEvent) => { cameraThetaRef.current = (e.clientX / canvas.width) * Math.PI * 2 }
    canvas.addEventListener("pointermove", onDrag)
    const step = () => {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      for (let y = 0; y < canvas.height; y += 8) {
        for (let x = 0; x < canvas.width; x += 6) {
          const dx = (x - cx) / 6
          const dy = (y - cy) / 8
          const r = Math.sqrt(dx * dx + dy * dy)
          if (r > ACCRETION_RADIUS && r < ACCRETION_RADIUS + DISK_THICKNESS) {
            const doppler = Math.cos(Math.atan2(dy, dx)) * 0.5 + 0.5
            ctx.fillStyle = `hsl(${30 + doppler * 180}, 80%, ${50 - r}%)`
            ctx.fillText(".", x, y)
          }
        }
      }
      rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    canvas.removeEventListener("pointermove", onDrag)
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
