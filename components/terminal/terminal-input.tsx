"use client"

import { useState } from "react"

export function TerminalInput({ onCommand }: { onCommand: (cmd: string) => void }) {
  const [input, setInput] = useState("")
  return <form onSubmit={(e) => { e.preventDefault(); onCommand(input); setInput("") }}><input type="text" value={input} onChange={(e) => setInput(e.target.value)} /></form>
}
