"use client"

import { useEffect, useRef, type ReactNode } from "react"

export interface LogEntry {
  id: number
  command: string
  message?: string
  node?: ReactNode
  success: boolean
}

export function ScrollbackLog({ entries }: { entries: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [entries])
  return (
    <div ref={ref} className="overflow-y-auto p-4">
      {entries.map((e) => (
        <div key={e.id}>
          <span>regis@dev ~ ❯</span>
          <span>{e.command}</span>
          {e.node && <div>{e.node}</div>}
        </div>
      ))}
    </div>
  )
}
