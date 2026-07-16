"use client"

import { useState, useRef, useEffect } from "react"

export function TerminalInput({ onCommand }: { onCommand: (cmd: string) => void }) {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  return <form onSubmit={(e) => { e.preventDefault(); onCommand(input); setHistory([...history, input]); setHistoryIndex(-1); setInput("") }}><input type="text" value={input} onKeyDown={(e) => { if (e.key === "ArrowUp" && history.length) { const i = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex; setHistoryIndex(i); setInput(history[history.length - 1 - i] || "") } }} onChange={(e) => setInput(e.target.value)} /></form>
}
