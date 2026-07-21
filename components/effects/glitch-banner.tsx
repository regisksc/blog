"use client"

import { useEffect, useState } from "react"

interface GlitchBannerProps {
  active: boolean
  text: string
}

// Layered text: three offset copies (cyan, magenta, primary) for RGB-shift glitch.
export function GlitchBanner({ active, text }: GlitchBannerProps) {
  const [visible, setVisible] = useState(active)
  useEffect(() => { setVisible(active) }, [active])
  if (!visible) return null
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-1/4 z-30 text-center font-mono text-3xl select-none">
      <span className="absolute inset-x-0 -translate-x-1 text-cyan-400/70">{text}</span>
      <span className="absolute inset-x-0 translate-x-1 text-pink-400/70">{text}</span>
      <span className="relative text-primary">{text}</span>
    </div>
  )
}
