"use client"

import { useState, useEffect } from "react"

interface DvdOverlayProps {
  active: boolean
}

// Scaffold — position/bounce/edge-clamp land in #173-#175/#179.
export function DvdOverlay({ active }: DvdOverlayProps) {
  const [visible, setVisible] = useState(active)
  useEffect(() => { setVisible(active) }, [active])
  if (!visible) return null
  return <div aria-hidden="true" className="fixed inset-0 z-50 pointer-events-none" />
}
