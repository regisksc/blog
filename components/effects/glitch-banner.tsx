"use client"

import { useEffect, useRef, useState, type ElementType } from "react"
import { SCRAMBLE_CHARS } from "@/lib/ascii-art"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const randChar = () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]

export interface GlitchBannerProps {
  /** Figlet art as an array of equal-intent rows, rendered in a <pre>. */
  lines: string[]
  /** Accessible name for the art (sr-only + small-screen fallback). */
  label: string
  /** Total scramble→settle duration per pass, in ms. */
  durationMs?: number
  /** Stagger between each line's reveal, in ms. */
  perLineMs?: number
  /** Delay before the first scramble pass runs, in ms. */
  startDelayMs?: number
  /** When true, re-scramble periodically while idle. */
  idle?: boolean
  /** Idle re-scramble delay window [min, max] in ms. */
  idleRangeMs?: [number, number]
  /** Extra classes for the <pre>. */
  className?: string
  /** Extra classes for the small-screen text fallback. */
  fallbackClassName?: string
  /** Tag for the small-screen fallback (e.g. "h1" for a page title). Default "span". */
  fallbackAs?: ElementType
}

const PRE_BASE =
  "hidden min-[380px]:block font-mono text-primary leading-none whitespace-pre overflow-hidden"
const FALLBACK_BASE =
  "min-[380px]:hidden text-3xl font-medium tracking-tight text-primary font-mono"

/**
 * Multi-line figlet art with a per-line scramble→settle reveal.
 * Hydration-safe: first render is the settled art; scrambling starts in an effect.
 * Reusable across the site — pass any figlet `lines` + accessible `label`.
 */
export function GlitchBanner({
  lines,
  label,
  durationMs = 700,
  perLineMs = 90,
  startDelayMs = 250,
  idle = true,
  idleRangeMs = [6000, 14000],
  className,
  fallbackClassName,
  fallbackAs: Fallback = "span",
}: GlitchBannerProps) {
  const [display, setDisplay] = useState(lines)
  const reducedMotion = useReducedMotion()
  const frameRef = useRef<number | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [idleMin, idleMax] = idleRangeMs

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(lines)
      return
    }

    const randDelay = () => idleMin + Math.random() * (idleMax - idleMin)

    const runScramble = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const elapsed = now - start
        let allDone = true
        const next = lines.map((line, li) => {
          const lineStart = li * perLineMs
          const progress = Math.min(1, Math.max(0, (elapsed - lineStart) / durationMs))
          if (progress < 1) allDone = false
          const revealed = Math.floor(progress * line.length)
          let out = ""
          for (let i = 0; i < line.length; i++) {
            const ch = line[i]
            if (ch === " " || i < revealed) out += ch
            else out += Math.random() > 0.5 ? randChar() : ch
          }
          return out
        })
        setDisplay(next)
        if (!allDone) {
          frameRef.current = requestAnimationFrame(tick)
        } else {
          setDisplay(lines)
          if (idle) idleTimerRef.current = setTimeout(runScramble, randDelay())
        }
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    setDisplay(lines)
    const startTimer = setTimeout(runScramble, startDelayMs)

    return () => {
      clearTimeout(startTimer)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [lines, durationMs, perLineMs, startDelayMs, idle, idleMin, idleMax, reducedMotion])

  return (
    <div>
      <span className="sr-only">{label}</span>
      <pre aria-hidden="true" className={className ? `${PRE_BASE} ${className}` : PRE_BASE}>
        {display.join("\n")}
      </pre>
      <Fallback
        aria-hidden="true"
        className={fallbackClassName ? `${FALLBACK_BASE} ${fallbackClassName}` : FALLBACK_BASE}
      >
        {label}
      </Fallback>
    </div>
  )
}
