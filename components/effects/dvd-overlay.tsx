"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { HIRE_ME_BANNER } from "@/lib/hire-me-art"
import { GlitchBanner } from "@/components/effects/glitch-banner"
import { THEMES, type Theme } from "@/lib/types"

const VELOCITY = 6.5 // px per RAF tick (~390 px/s at 60Hz)
const BANNER_WIDTH = 360
const BANNER_HEIGHT = 80
const PADDING = 12

const pickTheme = (current: Theme): Theme => {
  const pool = THEMES.filter((t) => t !== current)
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Bouncing-glitch overlay with a "hire me" banner. Plays for ~12s, ricochets
 * around the viewport with DVD-screensaver physics, and shifts theme color
 * on each wall hit.
 *
 * Renders the same <GlitchBanner> the whoami hero uses, with idle re-scramble
 * on a tight [1500, 3000]ms cadence so the banner is constantly decoding
 * throughout the bounce — matching the hero's animation language.
 */
export function DvdOverlay() {
  const [pos, setPos] = useState({ x: 80, y: 80 })
  const [theme, setTheme] = useState<Theme>("green")
  const velRef = useRef({ vx: VELOCITY, vy: VELOCITY * 0.7 })
  const rafRef = useRef<number | null>(null)

  const step = useCallback(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    const maxX = Math.max(0, w - BANNER_WIDTH - PADDING)
    const maxY = Math.max(0, h - BANNER_HEIGHT - PADDING)
    const v = velRef.current

    setPos((p) => {
      let nx = p.x + v.vx
      let ny = p.y + v.vy
      let bounced = false
      if (maxX <= PADDING) {
        nx = 0
      } else if (nx <= PADDING || nx >= maxX) {
        v.vx = -v.vx
        nx = Math.min(Math.max(nx, PADDING), maxX)
        bounced = true
      }
      if (maxY <= PADDING) {
        ny = 0
      } else if (ny <= PADDING || ny >= maxY) {
        v.vy = -v.vy
        ny = Math.min(Math.max(ny, PADDING), maxY)
        bounced = true
      }
      if (bounced) {
        setTheme((t) => pickTheme(t))
      }
      return { x: nx, y: ny }
    })

    rafRef.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [step])

  return (
    <div
      aria-hidden="true"
      aria-label="Dismiss DVD overlay" tabIndex={0} data-testid="dvd-overlay" className="dvd-overlay fixed z-50 pointer-events-none opacity-100"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${BANNER_WIDTH}px`,
      }}
      data-theme={theme}
    >
      <GlitchBanner
        lines={HIRE_ME_BANNER}
        label="hire me"
        idle
        idleRangeMs={[1500, 3000]}
        durationMs={500}
        perLineMs={70}
        className="text-[7px] min-[440px]:text-[9px] sm:text-xs"
      />
    </div>
  )
}