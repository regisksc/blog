"use client"

import { useRunCommand } from "@/lib/providers/run-command"

export function Portfolio() {
  const run = useRunCommand()
  return <div onClick={() => run("about")}>portfolio</div>
}
