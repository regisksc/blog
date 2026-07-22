"use client"

import { useEffect, useRef } from "react"

const W = 80
const H = 30

// Scaffold — raymarch loop + accretion disk + doppler + camera drag land in #208-#212.
export function BlackHole() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let rafId = 0
    const step = () => {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
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
