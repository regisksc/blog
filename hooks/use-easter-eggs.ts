"use client"

import { useState, useCallback } from "react"
import type { Theme } from "@/lib/types"

type Phase = "hidden" | "active" | "exiting"

export interface EasterEggs {
  matrixPhase: Phase
  glitchPhase: Phase
  upsideDownPhase: Phase
  dvdPhase: Phase
  triggerMatrix: () => void
  triggerGlitch: () => void
  triggerUpsideDown: () => void
  triggerDvd: () => void
  startCycle: (intervalMs?: number) => void
  stopCycle: () => void
}

export function useEasterEggs(_setTheme: (t: Theme) => void): EasterEggs {
  const [matrixPhase] = useState<Phase>("hidden")
  const [glitchPhase] = useState<Phase>("hidden")
  const [upsideDownPhase] = useState<Phase>("hidden")
  const [dvdPhase] = useState<Phase>("hidden")
  const noop = useCallback(() => {}, [])
  return {
    matrixPhase, glitchPhase, upsideDownPhase, dvdPhase,
    triggerMatrix: noop, triggerGlitch: noop, triggerUpsideDown: noop, triggerDvd: noop,
    startCycle: noop, stopCycle: noop,
  }
}
