"use client"

import { useEffect, useState } from "react"

interface PdfWindowProps {
  open: boolean
  onClose: () => void
  src?: string
}

// Scaffold — iframe + controls + ESC handler + catalog wiring land in #224-#228.
export function PdfWindow({ open, onClose, src = "/resume.pdf" }: PdfWindowProps) {
  const [dragging, setDragging] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div data-pdf-window data-open={open} className="pdf-window-base">
      <header className="pdf-window-titlebar controls-docked" data-controls-docked="true">{dragging ? "(dragging)" : "resume.pdf"}</header>
      <button type="button" onClick={onClose} aria-label="Close PDF window">×</button>
      <iframe title="resume" src={src} className="pdf-window-frame" data-testid="pdf-iframe" />
    </div>
    </div>
  )
}
