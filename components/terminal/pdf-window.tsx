"use client"

import { useState } from "react"

interface PdfWindowProps {
  open: boolean
  onClose: () => void
  src?: string
}

// Scaffold — iframe + controls + ESC handler + catalog wiring land in #224-#228.
export function PdfWindow({ open, onClose, src = "/resume.pdf" }: PdfWindowProps) {
  const [dragging, setDragging] = useState(false)
  if (!open) return null
  return (
    <div data-pdf-window data-open={open} className="pdf-window-base">
      <header className="pdf-window-titlebar">{dragging ? "(dragging)" : "resume.pdf"}</header>
      <button type="button" onClick={onClose} aria-label="Close PDF window">×</button>
    </div>
  )
}
