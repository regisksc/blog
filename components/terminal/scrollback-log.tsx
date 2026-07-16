import type { ReactNode } from "react"

export interface LogEntry {
  id: number
  command: string
  message?: string
  node?: ReactNode
  success: boolean
}

export function ScrollbackLog({ entries }: { entries: LogEntry[] }) {
  return <div className="overflow-y-auto p-4">{entries.length}</div>
}
