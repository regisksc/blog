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
const SOFTENING = 6
const GRAVITY = 6
const SNAP_KNEE = SOFTENING * 1.5
const MAX_ACCEL = 0.1
const BURST_COUNT = 24
const DEFAULT_ATTRACTOR = { x: COLS / 2, y: ROWS / 2 }
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
    const attractor = { x: DEFAULT_ATTRACTOR.x, y: DEFAULT_ATTRACTOR.y }
    const onMove = (e: PointerEvent) => { attractor.x = e.clientX / CELL_W; attractor.y = e.clientY / CELL_H }
    const onClick = (e: MouseEvent) => {
      const at = { x: e.clientX / CELL_W, y: e.clientY / CELL_H }
      for (let i = 0; i < BURST_COUNT; i++) particlesRef.current.push(spawnParticle(at))
      while (particlesRef.current.length > PARTICLE_COUNT + BURST_COUNT * 2) particlesRef.current.shift()
    }
    let rafId = 0
    const step = () => {
      for (const p of particlesRef.current) {
        const dx = attractor.x - p.x
        const dy = attractor.y - p.y
        const dist2 = dx * dx + dy * dy + SOFTENING * SOFTENING
        const dist = Math.sqrt(dist2)
        const pull = GRAVITY / dist2
        const closeBoost = SNAP_KNEE / (dist + 0.5)
        const accel = Math.min(MAX_ACCEL, pull * closeBoost)
        p.vx += (dx / dist) * accel
        p.vy += (dy / dist) * pull
        p.x += p.vx
        p.y += p.vy
      }
      rafId = requestAnimationFrame(step)
    }
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("click", onClick)
    const onContextMenu = (e: MouseEvent) => { e.preventDefault(); particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => spawnParticle()) }
    canvas.addEventListener("contextmenu", onContextMenu)
    rafId = requestAnimationFrame(step)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("click", onClick)
      canvas.removeEventListener("contextmenu", onContextMenu)
    }
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
