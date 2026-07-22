"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
}

const CELL_W = 5
const CELL_H = 7
const COLS = 96
const ROWS = 24
const PARTICLE_COUNT = 110

export function GravityWell() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    particlesRef.current = []
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={COLS * CELL_W}
      height={ROWS * CELL_H}
      className="rounded border border-border bg-background cursor-crosshair"
      aria-label="ASCII particle gravity well"
    />
  )
}
