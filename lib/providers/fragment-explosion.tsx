"use client"

import { createContext, useContext, useRef, type RefObject, type ReactNode } from "react"

/**
 * Shared signal for the "fragment explosion" effect.
 *
 * The hook that triggers the explosion writes `activeRef.current = true` while
 * the page is being torn apart and back to `false` when the dust settles.
 * Anything that needs to pause work during the effect (typing animations,
 * loopers, autoplay) reads from the ref without subscribing to React state.
 */
export type FragmentingSignal = RefObject<boolean>

const FragmentExplosionContext = createContext<FragmentingSignal | null>(null)

export function FragmentExplosionProvider({ children }: { children: ReactNode }) {
  const signal = useRef<boolean>(false)
  return (
    <FragmentExplosionContext.Provider value={signal}>
      {children}
    </FragmentExplosionContext.Provider>
  )
}

export function useFragmentingSignal(): FragmentingSignal {
  const ctx = useContext(FragmentExplosionContext)
  if (!ctx) {
    throw new Error("useFragmentingSignal must be used inside <FragmentExplosionProvider>")
  }
  return ctx
}
