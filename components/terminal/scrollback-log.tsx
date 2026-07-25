"use client"

import { useEffect, useRef, useState } from "react"

// Scrollback log that auto-scrolls only when the user is already near the bottom.
export function ScrollbackLog({ lines }: { lines: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [stickToBottom, setStickToBottom] = useState(true)
  useEffect(() => {
    if (!ref.current || !stickToBottom) return
    ref.current.scrollTop = ref.current.scrollHeight
  }, [lines, stickToBottom])
  return (
    <div
      ref={ref}
      data-respects-user-scroll="true"
      onScroll={(e) => {
        const t = e.currentTarget
        setStickToBottom(t.scrollHeight - t.scrollTop - t.clientHeight < 32)
      }}
      className="font-mono text-xs whitespace-pre-wrap"
    >
      {lines.join("\n")}
    </div>
  )
}
