"use client"

import { useEffect, useState } from "react"

interface GlitchBannerProps {
  active: boolean
  text: string
}

// Scaffold — full layered-text + keyframes land in #167 + #168.
export function GlitchBanner({ active, text }: GlitchBannerProps) {
  const [visible, setVisible] = useState(active)
  useEffect(() => { setVisible(active) }, [active])
  if (!visible) return null
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-1/4 z-30 text-center font-mono text-3xl text-primary">
      {text}
    </div>
  )
}
