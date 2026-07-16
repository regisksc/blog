"use client"

import { useState } from "react"
"use client"

import { useRunCommand } from "@/lib/providers/run-command"
import { ScrollbackLog } from "./scrollback-log"
import { TerminalInput } from "./terminal-input"

export function Portfolio() {
  const [log, setLog] = useState<any[]>([])
  const run = useRunCommand()
  return <div><ScrollbackLog entries={log} /><TerminalInput onCommand={run} /></div>
}
