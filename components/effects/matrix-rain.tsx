"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface Drop {
  id: number
  x: number
  y: number
}

// Scaffold: drop type + reduced-motion hook. Grid, speed, glyphs land in #148-#150.
export function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    if (reducedMotion) return
    return () => {}
  }, [reducedMotion])

  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none" />
}
