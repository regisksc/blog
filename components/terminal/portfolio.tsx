"use client"

import { useState } from "react"
"use client"

import { useRunCommand } from "@/lib/providers/run-command"
import { ScrollbackLog } from "./scrollback-log"

export function Portfolio() {
  const [log, setLog] = useState<any[]>([])
  const run = useRunCommand()
  return <div><ScrollbackLog entries={log} /></div>
}
