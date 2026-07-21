"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface FragmentState {
  active: boolean
  startedAt: number
  generation: number
}

type Listener = (state: FragmentState) => void

const listeners = new Set<Listener>()
let generation = 0
let lastStartedAt = 0

// Scaffold — protocol + rng seed arrive in #181/#182.
export function useFragmentExplosion() {
  const [state, setState] = useState<FragmentState>({ active: false, startedAt: 0, generation: 0 })
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const l: Listener = (next) => setState(next)
    listeners.add(l)
    return () => { listeners.delete(l) }
  }, [])

  const trigger = useCallback(() => {
    const now = Date.now()
    if (now - lastStartedAt < 250) return false
    lastStartedAt = now
    generation += 1
    const next: FragmentState = { active: true, startedAt: now, generation }
    listeners.forEach((l) => l(next))
    return true
  }, [])

  return { state, trigger }
}
