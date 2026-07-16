"use client"

import { useState } from "react"

export function TerminalInput() {
  const [input, setInput] = useState("")
  return <form><input type="text" value={input} onChange={(e) => setInput(e.target.value)} /></form>
}
