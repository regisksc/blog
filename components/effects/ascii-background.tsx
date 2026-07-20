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

function glyphFor(value: number, cycle: number): string {
  const idx = Math.floor(value * RAMP_LEN + cycle) % RAMP_LEN
  return GLYPH_RAMP[idx < 0 ? idx + RAMP_LEN : idx]
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
      ctx.fillStyle = "rgba(120,140,160,0.18)"
      const cols = Math.ceil(w / cellSize)
      const rows = Math.ceil(h / cellSize)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = (Math.sin(x * 0.3 + cycle * 0.1) * Math.cos(y * 0.3 - cycle * 0.1) + 1) / 2
          const ch = glyphFor(v, cycle)
          if (ch !== " ") ctx.fillText(ch, x * cellSize, y * cellSize)
        }
      }
    }

    if (reducedMotion) { draw(0); return }
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < FRAME_INTERVAL) return
      last = now
      draw(now)
    }
    raf = requestAnimationFrame(loop)
    const onResize = () => { start = performance.now(); last = 0 }
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none" />
}
