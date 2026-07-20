"use client"

import { useEffect, useRef } from "react"

const GLYPH_RAMP = " .·:-=+*≈▒"
const RAMP_LEN = GLYPH_RAMP.length
const CELL = 14

function glyphFor(value: number): string {
  const idx = Math.floor(value * RAMP_LEN) % RAMP_LEN
  return GLYPH_RAMP[idx < 0 ? idx + RAMP_LEN : idx]
}

export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w
    canvas.height = h
    ctx.font = `${CELL}px var(--font-mono, monospace)`
    ctx.textBaseline = "top"
    ctx.fillStyle = "rgba(120,140,160,0.18)"
    const cols = Math.ceil(w / CELL)
    const rows = Math.ceil(h / CELL)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = (Math.sin(x * 0.3) * Math.cos(y * 0.3) + 1) / 2
        const ch = glyphFor(v)
        if (ch !== " ") ctx.fillText(ch, x * CELL, y * CELL)
      }
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none" />
}
