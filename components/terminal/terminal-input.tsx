"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { TAB_COMPLETE_COMMANDS } from "@/lib/commands/catalog"

export interface TerminalInputHandle {
  /** Animate typing a command into the input, then submit it. */
  autoType: (command: string, opts?: { hideCommand?: boolean }) => void
  focus: () => void
}

interface TerminalInputProps {
  onCommand: (command: string, opts?: { hideCommand?: boolean }) => { success: boolean; message?: string }
  disabled?: boolean
}

export const TerminalInput = forwardRef<TerminalInputHandle, TerminalInputProps>(
  function TerminalInput({ onCommand, disabled = false }, ref) {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isShaking, setIsShaking] = useState(false)
  const [isAutoTyping, setIsAutoTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Submit a command programmatically (shared by form submit + auto-type).
  const submitCommand = (raw: string, opts?: { hideCommand?: boolean }) => {
    const trimmed = raw.trim().toLowerCase()
    if (!trimmed) return
    const result = onCommand(trimmed, opts)
    if (!result.success) {
      setIsShaking(true)
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current)
      shakeTimeoutRef.current = setTimeout(() => setIsShaking(false), 500)
    }
    setHistory(prev => [...prev, trimmed])
    setHistoryIndex(-1)
    setInput("")
  }

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    autoType: (command: string, opts?: { hideCommand?: boolean }) => {
      autoTimersRef.current.forEach(clearTimeout)
      autoTimersRef.current = []
      setIsAutoTyping(true)
      setInput("")
      const chars = command.split("")
      chars.forEach((_, i) => {
        const t = setTimeout(() => {
          setInput(command.slice(0, i + 1))
        }, 90 * (i + 1))
        autoTimersRef.current.push(t)
      })
      const done = setTimeout(() => {
        submitCommand(command, opts)
        // Flip auto-typing off last so the focus effect re-runs and refocuses.
        setIsAutoTyping(false)
      }, 90 * (chars.length + 1) + 350)
      autoTimersRef.current.push(done)
    },
  }))

  useEffect(() => {
    return () => {
      autoTimersRef.current.forEach(clearTimeout)
    }
  }, [])

  const clearTimers = () => {
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current)
      shakeTimeoutRef.current = null
    }
  }

  // Keep the prompt focused whenever it's interactive. Re-runs when auto-typing
  // ends (input re-enables) so focus returns after the boot `about`.
  useEffect(() => {
    if (disabled || isAutoTyping) {
      inputRef.current?.blur()
      return
    }
    inputRef.current?.focus()
  }, [disabled, isAutoTyping])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  // Arrow keys skip empty history.
    // Refocus on click anywhere in the container
  const handleContainerClick = () => {
    if (disabled) return
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled || isAutoTyping) return
    submitCommand(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isAutoTyping) return

    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex] || "")
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex] || "")
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      const match = TAB_COMPLETE_COMMANDS.find(c => c.startsWith(input.toLowerCase()))
      if (match) setInput(match)
    }
  }

  return (
    <div 
      className={`px-4 sm:px-6 py-3 border-t border-border ${disabled ? "cursor-not-allowed opacity-80" : "cursor-text"}`}
      onClick={handleContainerClick}
    >
      <div className="max-w-4xl mx-auto">
        <div className="font-mono text-sm"><span className="text-primary">$</span> <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <span className="font-mono text-sm select-none shrink-0">
            <span className="hidden sm:inline text-primary">regis@dev </span>
            <span className="text-muted-foreground">~ </span>
            <span className="text-primary">❯</span>
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='new here? type "help" and hit enter'
              className={`
                w-full bg-transparent font-mono text-sm text-foreground 
                placeholder:text-muted-foreground/40 outline-none
                ${isShaking ? "animate-shake" : ""}
              `}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              disabled={disabled || isAutoTyping}
            />
          </div>
        </form></div>
      </div>
    </div>
  )
})
