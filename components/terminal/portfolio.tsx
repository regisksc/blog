"use client"

import { useState } from "react"
import { useState } from "react"
import { useRunCommand } from "@/lib/providers/run-command"
import { ScrollbackLog } from "./scrollback-log"
import { TerminalInput } from "./terminal-input"
import { AboutSection } from "../sections/about"

export function Portfolio() {
  const [log, setLog] = useState<{ id: number; command: string; success: boolean; node?: React.ReactNode }[]>([])
  const [section, setSection] = useState<string | null>(null)
  const run = useRunCommand()
  return <div><ScrollbackLog entries={log} /><TerminalInput onCommand={(cmd) => { if (cmd === "about") setLog([{id: 1, command: cmd, success: true, node: <AboutSection />}]) else if (cmd === "help") setLog([...log, {id: log.length + 1, command: cmd, success: true, message: "available commands: about, help"}]) else if (cmd === "clear") setLog([]) else if (cmd === "theme") setLog([...log, {id: log.length + 1, command: cmd, success: true, message: "themes: green, amber, rose, cyan, violet"}]) ; run(cmd) }} /></div>
}
