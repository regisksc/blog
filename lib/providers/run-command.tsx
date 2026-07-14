"use client"

import { createContext, useContext, type ReactNode } from "react"

type RunCommand = (command: string) => void

const noopRunCommand: RunCommand = () => {}

const RunCommandContext = createContext<RunCommand | null>(null)

export function RunCommandProvider({ children }: { children: ReactNode }) {
  return <RunCommandContext.Provider value={noopRunCommand}>{children}</RunCommandContext.Provider>
}

export function useRunCommand(): RunCommand {
  const ctx = useContext(RunCommandContext)
  if (!ctx) throw new Error("useRunCommand must be used inside <RunCommandProvider>")
  return ctx
}
