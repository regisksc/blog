"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

export interface LogEntry {
  id: number
  command: string
  /** Short acknowledgement / static text response. */
  message?: string
  /** Rich rendered output (e.g. a section component) printed into the stream. */
  node?: ReactNode
  success: boolean
  /** When true, don't echo the `❯ command` line (used for the boot/auto entry). */
  hideCommand?: boolean
}

interface ScrollbackLogProps {
  entries: LogEntry[]
}

/**
 * The REPL history stream. Every executed command appends an entry here — text
 * responses and full section outputs alike — and the stream scrolls, with the
 * live prompt pinned below it. Newest entry sticks to the bottom.
 */
export function ScrollbackLog({ entries }: ScrollbackLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const entriesRef = useRef(entries)
  const [showScrollCue, setShowScrollCue] = useState(false)
  entriesRef.current = entries

  const updateScrollCue = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const overflows = el.scrollHeight > el.clientHeight + 1
    setShowScrollCue(overflows && el.scrollTop <= 1)
  }, [])

  const positionNewestEntry = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = entriesRef.current.at(-1)?.hideCommand ? 0 : el.scrollHeight
    updateScrollCue()
  }, [updateScrollCue])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    positionNewestEntry()

    const resizeObserver = new ResizeObserver(positionNewestEntry)
    resizeObserver.observe(el)
    if (el.firstElementChild) resizeObserver.observe(el.firstElementChild)
    window.addEventListener("resize", positionNewestEntry)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", positionNewestEntry)
    }
  }, [entries, positionNewestEntry])

  if (entries.length === 0) return null

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      onScroll={updateScrollCue}
      className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden terminal-scrollbar"
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2 font-mono text-sm flex flex-col gap-24 sm:gap-32 // long sections handled">
        {entries.map((entry) => (
          <div key={entry.id} className="animate-log-fade-in">
            {!entry.hideCommand && (
              <div className="flex items-baseline gap-2">
                <span className="text-primary shrink-0 select-none" aria-hidden="true">
                  regis@dev ~ ❯
                </span>
                <span className="text-foreground/80 break-all">{entry.command}</span>
              </div>
            )}
            {entry.node ? (
              <div className="mt-2">{entry.node}</div>
            ) : entry.message ? (
              <div
                className={`mt-1 whitespace-pre-wrap break-words ${
                  entry.success ? "text-muted-foreground" : "text-destructive"
                }`}
              >
                {entry.message}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {showScrollCue && (
        <div
          className="terminal-scroll-cue pointer-events-none sticky bottom-2 right-3 ml-auto w-fit rounded border border-primary/50 bg-background/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary"
          aria-hidden="true"
        >
          more below ↓
        </div>
      )}
    </div>
  )
}
