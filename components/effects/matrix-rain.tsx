"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const COL_WIDTH = 18
const ROW_HEIGHT = 18
const SPEED_MIN = 1.4
const SPEED_MAX = 3.6
const FRAME_INTERVAL = 1000 / 60

interface Drop {
  id: number
  x: number
  y: number
  speed: number
  glyphs: string[]
}

function buildInitialDrops(canvas: HTMLCanvasElement): Drop[] {
  const columns = Math.max(8, Math.floor(canvas.width / COL_WIDTH))
  return Array.from({ length: columns }, (_, i) => ({
    id: i,
    x: i * COL_WIDTH,
    y: -Math.random() * canvas.height,
    speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
    glyphs: [],
  }))
}

export function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const [drops, setDrops] = useState<Drop[]>([])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    setDrops(buildInitialDrops(canvas))
    if (reducedMotion) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = now - last
      if (dt < FRAME_INTERVAL) {
        raf = requestAnimationFrame(tick)
        return
      }
      last = now
      setDrops((prev) => prev.map((d) => ({ ...d, y: d.y + d.speed * (dt / 16) })))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion])

  return (
    <div aria-hidden="true" className="fixed inset-0 z-40 overflow-hidden pointer-events-none bg-background/80">
      {drops.map((d) => (
        <div key={d.id} className="absolute top-0 font-mono text-sm text-primary leading-none" style={{ left: d.x, transform: `translate3d(0, ${d.y}px, 0)`, willChange: "transform" }}>
          <div className="h-[18px]">0</div>
        </div>
      ))}
    </div>
  )
}
