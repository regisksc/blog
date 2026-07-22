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
const DEFAULT_ATTRACTOR = { x: COLS / 2, y: ROWS / 2 }

function spawnParticle(at: { x: number; y: number } = DEFAULT_ATTRACTOR): Particle {
  const angle = Math.random() * Math.PI * 2
  const radius = 6 + Math.random() * (Math.min(COLS, ROWS) * 0.35)
  return {
    x: at.x + Math.cos(angle) * radius,
    y: at.y + Math.sin(angle) * radius,
    vx: 0,
    vy: 0,
  }
}

export function GravityWell() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, spawnParticle)
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
