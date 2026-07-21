"use client"

import { useState, useEffect, useRef } from "react"

interface DvdOverlayProps {
  active: boolean
}

const SIZE = 80
const SPEED = 2.5
const HUE_COLORS = ["bg-primary", "bg-rose-500", "bg-amber-500", "bg-emerald-500"]

// Bounce physics — velocity-based x/y, flips on edge hit.
export function DvdOverlay({ active }: DvdOverlayProps) {
  const [visible, setVisible] = useState(active)
  const state = useRef({ x: 40, y: 40, vx: SPEED, vy: SPEED, colorIdx: 0 })
  const [, force] = useState(0)
  useEffect(() => { setVisible(active) }, [active])
  useEffect(() => {
    if (!visible) return
    let raf = 0
    const loop = () => {
      const s = state.current
      s.x += s.vx
      s.y += s.vy
      let hit = false
      if (s.x <= 0 || s.x + SIZE >= window.innerWidth) { s.vx = -s.vx; hit = true }
      if (s.y <= 0 || s.y + 32 >= window.innerHeight) { s.vy = -s.vy; hit = true }
      if (hit) s.colorIdx = (s.colorIdx + 1) % HUE_COLORS.length
      force((n) => n + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [visible])
  if (!visible) return null
  return (
    <div
      aria-hidden="true"
      className="fixed z-50 pointer-events-none bg-primary/80 text-background px-4 py-2 font-mono text-sm rounded"
      style={{ left: state.current.x, top: state.current.y, width: SIZE }}
    >
      DVD
    </div>
  )
}
