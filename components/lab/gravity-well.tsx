"use client"

import { useEffect, useRef } from "react"
import { resolveCssVar } from "@/lib/canvas-utils"

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
const CANVAS_W = COLS * CELL_W
const CANVAS_H = ROWS * CELL_H
const PARTICLE_COUNT = 110
const DEFAULT_ATTRACTOR = { x: COLS / 2, y: ROWS / 2 }
const SOFTENING = 6
const MAX_ACCEL = 0.1 // cap on per-frame pull near the core — higher = sharper snap-in
const GRAVITY = 6 // gravitational constant — lower = slower, calmer attraction at distance
const SNAP_KNEE = SOFTENING * 1.5 // radius below which the close-in amplification kicks in
const DAMPING = 0.992 // velocity retention — higher = orbits persist longer
const MAX_SPEED = 1.6 // cap so outermost orbits don't fly off the canvas
const HOVER_ACCEL_MULT = 5 // boost on max accel while the cursor is over the canvas
const HOVER_SPEED_MULT = 2 // boost on max speed while the cursor is over the canvas
const TRAIL_FADE = 0.92
const BURST_COUNT = 24

function spawnParticle(at: { x: number; y: number } = DEFAULT_ATTRACTOR): Particle {
  const angle = Math.random() * Math.PI * 2
  const radius = 6 + Math.random() * (Math.min(COLS, ROWS) * 0.35)
  // Keplerian tangential velocity: v = sqrt(G·M / r) for a closed orbit, where
  // the effective G·M is the constant used by the SDF (GRAVITY). We add a
  // small radial jitter so orbits aren't perfectly circular — gives the
  // electron-orbit precession look without making them collapse or escape.
  const orbitalV = Math.sqrt(GRAVITY / Math.max(1, radius))
  // Tangent direction: rotate the radial unit vector 90°.
  const tx = -Math.sin(angle)
  const ty = Math.cos(angle)
  // Random spin direction per particle (half CW, half CCW).
  const spin = Math.random() < 0.5 ? -1 : 1
  return {
    x: at.x + Math.cos(angle) * radius,
    y: at.y + Math.sin(angle) * radius,
    vx: tx * orbitalV * spin + (Math.random() - 0.5) * 0.04,
    vy: ty * orbitalV * spin + (Math.random() - 0.5) * 0.04,
  }
}

function pickChar(speed: number): string {
  if (speed < 0.08) return "."
  if (speed < 0.25) return ":"
  if (speed < 0.55) return "+"
  if (speed < 0.95) return "*"
  return "#"
}

export function GravityWell() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number | null>(null)
  const frameRef = useRef(0)
  const attractorRef = useRef<{ x: number; y: number }>({ ...DEFAULT_ATTRACTOR })
  const isHoveringRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const [br, bg, bb] = resolveCssVar("--background")
    const [fr, fg, fb] = resolveCssVar("--primary")
    const trailColor = `rgba(${br}, ${bg}, ${bb}, ${TRAIL_FADE})`
    const fgColor = `rgb(${fr}, ${fg}, ${fb})`

    ctx.font = `${CELL_H}px ui-monospace, SFMono-Regular, Menlo, monospace`
    ctx.textBaseline = "top"

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, spawnParticle)

    const toCell = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: ((e.clientX - rect.left) / rect.width) * COLS,
        y: ((e.clientY - rect.top) / rect.height) * ROWS,
      }
    }

    const onMove = (e: PointerEvent) => {
      attractorRef.current = toCell(e)
    }

    const onEnter = (e: PointerEvent) => {
      isHoveringRef.current = true
      attractorRef.current = toCell(e)
    }

    const onLeave = () => {
      isHoveringRef.current = false
      // Smooth return to center once the cursor leaves.
      attractorRef.current = { ...DEFAULT_ATTRACTOR }
    }

    const onClick = (e: MouseEvent) => {
      const p = toCell(e as unknown as PointerEvent)
      // Spawn a burst at the click point.
      for (let i = 0; i < BURST_COUNT; i++) {
        particlesRef.current.push(spawnParticle(p))
      }
      // Cap the total population so perf stays steady.
      while (particlesRef.current.length > PARTICLE_COUNT + BURST_COUNT * 2) {
        particlesRef.current.shift()
      }
    }

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      // Right-click resets the simulation back to the default ring.
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => spawnParticle())
    }

    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerenter", onEnter)
    canvas.addEventListener("pointerleave", onLeave)
    canvas.addEventListener("click", onClick)
    canvas.addEventListener("contextmenu", onContextMenu)

    const step = () => {
      const particles = particlesRef.current
      const at = attractorRef.current
      const hoverBoost = isHoveringRef.current ? HOVER_ACCEL_MULT : 1
      const speedCap = isHoveringRef.current ? MAX_SPEED * HOVER_SPEED_MULT : MAX_SPEED

      ctx.fillStyle = trailColor
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.fillStyle = fgColor

      for (const p of particles) {
        const dx = at.x - p.x
        const dy = at.y - p.y
        const dist2 = dx * dx + dy * dy + SOFTENING * SOFTENING
        const dist = Math.sqrt(dist2)
        // Inverse-square pull (stable orbits at distance) shaped by a
        // close-in amplification: distant particles drift slowly, particles
        // inside SNAP_KNEE snap toward the core. The MAX_ACCEL cap keeps the
        // snap from going infinite, but it kicks in only inside ~r=10.
        const pull = GRAVITY / dist2
        const closeBoost = SNAP_KNEE / (dist + 0.5)
        const accel = Math.min(MAX_ACCEL * hoverBoost, pull * closeBoost * hoverBoost)
        p.vx += (dx / dist) * accel
        p.vy += (dy / dist) * accel
        p.vx *= DAMPING
        p.vy *= DAMPING
        // Hard speed clamp so particles glide instead of whipping toward the core.
        const sp = Math.hypot(p.vx, p.vy)
        if (sp > speedCap) {
          const k = speedCap / sp
          p.vx *= k
          p.vy *= k
        }
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x >= COLS || p.y < 0 || p.y >= ROWS) {
          Object.assign(p, spawnParticle(at))
        }

        const speed = Math.hypot(p.vx, p.vy)
        const char = pickChar(speed)
        const cx = Math.floor(p.x) * CELL_W
        const cy = Math.floor(p.y) * CELL_H
        ctx.fillText(char, cx, cy)
      }

      frameRef.current += 1
      if (frameRef.current % 240 === 0) {
        for (let i = 0; i < particles.length; i++) {
          if (Math.random() < 0.15) Object.assign(particles[i], spawnParticle(at))
        }
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerenter", onEnter)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("click", onClick)
      canvas.removeEventListener("contextmenu", onContextMenu)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="rounded border border-border bg-background cursor-crosshair"
      aria-label="ASCII particle gravity well — move pointer to drag the attractor, click to spawn a burst, right-click to reset"
    />
  )
}

export const GRAVITY_WELL_PARTICLES = PARTICLE_COUNT
export const GRAVITY_WELL_GRID = `${COLS}×${ROWS}`