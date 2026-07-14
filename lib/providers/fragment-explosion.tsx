"use client"

import { createContext, useContext, useRef, type ReactNode } from "react"

const noopSignal = { current: false }

const FragmentExplosionContext = createContext<typeof noopSignal | null>(null)

export function FragmentExplosionProvider({ children }: { children: ReactNode }) {
  return <FragmentExplosionContext.Provider value={noopSignal}>{children}</FragmentExplosionContext.Provider>
}

export function useFragmentingSignal() {
  return useContext(FragmentExplosionContext)
}
