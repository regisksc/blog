import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { THEMES, type Theme } from "@/lib/types"

/** Three-phase lifecycle for an effect: hidden → active → exiting → hidden.
 *  Components stay mounted through the exit so they can fade out instead of
 *  popping off. Phase transitions:
 *
 *    trigger()  →  active       (after `durationMs`)  →  exiting
 *                                                  (after `fadeMs`)  →  hidden
 *
 *  Re-triggering during active or exiting cancels the pending timer and
 *  re-enters active immediately. */
type Phase = "hidden" | "active" | "exiting"

interface TriggerOptions {
  durationMs?: number
  fadeMs?: number
}

interface PhaseState {
  phase: Phase
  setPhase: (next: Phase) => void
}

function usePhaseController(defaults: { durationMs: number; fadeMs?: number }) {
  const [phase, setPhase] = useState<Phase>("hidden")
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeMsRef = useRef<number>(defaults.fadeMs ?? Math.max(220, Math.round(defaults.durationMs * 0.2)))

  const clear = useCallback(() => {
    if (exitTimer.current) { clearTimeout(exitTimer.current); exitTimer.current = null }
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null }
  }, [])

  useEffect(() => clear, [clear])

  const trigger = useCallback((opts: TriggerOptions = {}) => {
    const active = opts.durationMs ?? defaults.durationMs
    const fade = opts.fadeMs ?? fadeMsRef.current
    clear()
    setPhase("active")
    exitTimer.current = setTimeout(() => setPhase("exiting"), active)
    hideTimer.current = setTimeout(() => setPhase("hidden"), active + fade)
  }, [defaults.durationMs, clear])

  return { phase, trigger, clear }
}

/**
 * Manages timed visual effects. Each effect is a self-contained handler in
 * the registry below — adding a new effect means adding one entry, no
 * parallel state plumbing.
 *
 * Surface area:
 *   - phases: matrixPhase, glitchPhase, upsideDownPhase, dvdPhase
 *   - triggers: triggerMatrix, triggerGlitch, triggerUpsideDown, triggerDvd
 *   - cycle: startCycle, stopCycle (theme setting, not easter egg)
 */
export function useEasterEggs(setTheme: (theme: Theme) => void) {
  const matrix     = usePhaseController({ durationMs: 6000 })
  const glitch     = usePhaseController({ durationMs: 1500 })
  const upsideDown = usePhaseController({ durationMs: 8000 })
  const dvd        = usePhaseController({ durationMs: 12000 })

  useEffect(() => () => {
    matrix.clear()
    glitch.clear()
    upsideDown.clear()
    dvd.clear()
  }, [matrix.clear, glitch.clear, upsideDown.clear, dvd.clear])

  /**
   * Cycle the theme on a fixed cadence. Bound to the `cycle` command — a
   * promotion of the old `party` easter egg into a theme setting.
   */
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startCycle = useCallback((intervalMs = 500) => {
    const themes = THEMES
    let i = 0
    if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current)
    cycleIntervalRef.current = setInterval(() => {
      i = (i + 1) % themes.length
      setTheme(themes[i])
    }, intervalMs)
  }, [setTheme])

  const stopCycle = useCallback(() => {
    if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current)
    cycleIntervalRef.current = null
  }, [])

  useEffect(() => stopCycle, [stopCycle])

  return useMemo(() => ({
    matrixPhase:     matrix.phase,
    glitchPhase:     glitch.phase,
    upsideDownPhase: upsideDown.phase,
    dvdPhase:        dvd.phase,
    triggerMatrix:     matrix.trigger,
    triggerGlitch:     glitch.trigger,
    triggerUpsideDown: upsideDown.trigger,
    triggerDvd:        dvd.trigger,
    startCycle,
    stopCycle,
  }), [matrix.phase, matrix.trigger, glitch.phase, glitch.trigger,
       upsideDown.phase, upsideDown.trigger, dvd.phase, dvd.trigger,
       startCycle, stopCycle])
}

// Final secret queue — all easter-eggs wired in the canonical order.
const SECRET_QUEUE = ["matrix", "glitch", "dvd", "shatter", "theme", "hire me"] as const
