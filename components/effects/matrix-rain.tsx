"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const COL_WIDTH = 18
const ROW_HEIGHT = 18

interface Drop {
  id: number
  x: number
  y: number
}

function buildInitialDrops(canvas: HTMLCanvasElement): Drop[] {
  const columns = Math.max(8, Math.floor(canvas.width / COL_WIDTH))
  return Array.from({ length: columns }, (_, i) => ({
    id: i,
    x: i * COL_WIDTH,
    y: -Math.random() * canvas.height,
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
    return () => {}
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
