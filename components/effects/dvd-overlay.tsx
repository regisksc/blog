"use client"

import { useState, useEffect, useRef } from "react"

interface DvdOverlayProps {
  active: boolean
}

const SIZE = 80

// Position state — x/y in CSS pixels, persisted across re-renders via ref.
export function DvdOverlay({ active }: DvdOverlayProps) {
  const [visible, setVisible] = useState(active)
  const pos = useRef({ x: 40, y: 40 })
  const [tick, setTick] = useState(0)
  useEffect(() => { setVisible(active) }, [active])
  if (!visible) return null
  return (
    <div
      aria-hidden="true"
      className="fixed z-50 pointer-events-none bg-primary/80 text-background px-4 py-2 font-mono text-sm rounded"
      style={{ left: pos.current.x, top: pos.current.y, width: SIZE }}
      data-tick={tick}
    >
      DVD
    </div>
  )
}
