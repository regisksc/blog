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
    return () => {}
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
