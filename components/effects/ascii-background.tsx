"use client"

import { useRef } from "react"

export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none" />
}
