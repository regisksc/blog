"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

const ANIMATION_MS = 280
const NEXT_FRAME_MS = 16

interface PdfWindowProps {
  open: boolean
  onClose: () => void
  src: string
  title: string
  returnFocusRef: React.RefObject<HTMLButtonElement | null>
}

export function PdfWindow({ open, onClose, src, title, returnFocusRef }: PdfWindowProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [titleBarColor, setTitleBarColor] = useState("#00aa00")

  // Two visual states:
  //   visible = portal is in the DOM
  //   show    = portal is at the "open" position (zoom-in complete)
  // The portal mounts with `show=false`, then a 16ms setTimeout flips show
  // to true so the browser paints the hidden state before transitioning.
  const [visible, setVisible] = useState(open)
  const [show, setShow] = useState(open)

  useEffect(() => {
    if (open) {
      // Cancel any pending close so a stale timer cannot hide the dialog we
      // are about to (re)open. Always (re)start the opening transition when
      // `open` is true — handles re-opens during a closing animation.
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setVisible(true)
      setShow(false)
    }
  }, [open])

  useLayoutEffect(() => {
    if (!visible) return
    // Reset show to false synchronously so re-opens also restart the animation,
    // then flip to true on the next frame so the browser paints the hidden state.
    setShow(false)
    const id = setTimeout(() => {
      setShow(true)
    }, NEXT_FRAME_MS)
    return () => clearTimeout(id)
  }, [visible, open])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const requestClose = useCallback(() => {
    if (!visible || !show) return
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setShow(false)
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setVisible(false)
      onClose()
    }, ANIMATION_MS)
  }, [visible, show, onClose])

  useEffect(() => {
    if (!open) return

    const scrollOwner = returnFocusRef.current?.closest<HTMLElement>("[role='log']")
    const appRoot = document.querySelector<HTMLElement>("[data-portfolio-root]")
    const previousBodyOverflow = document.body.style.overflow
    const previousScrollOverflow = scrollOwner?.style.overflow
    document.body.style.overflow = "hidden"
    if (scrollOwner) scrollOwner.style.overflow = "hidden"
    appRoot?.setAttribute("inert", "")
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
    setTitleBarColor(primaryColor || "#00aa00")
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose()
        return
      }

      if (event.key !== "Tab") return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href]")
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement
      const activeElementIsFocusable = Array.from(focusable).includes(activeElement as HTMLElement)
      if (event.shiftKey && (activeElement === first || !activeElementIsFocusable)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (activeElement === last || !activeElementIsFocusable)) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      if (scrollOwner) scrollOwner.style.overflow = previousScrollOverflow ?? ""
      appRoot?.removeAttribute("inert")
      returnFocusRef.current?.focus()
    }
  }, [open, requestClose, returnFocusRef])

  if (!visible) return null

  return createPortal(
    <div
      className={`pdf-overlay fixed inset-0 z-[10100] flex items-center justify-center bg-black/45 p-2 sm:p-6 ${show ? "pdf-overlay-show" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="itau-pdf-window-title"
        className={`pdf-window win95-window flex h-[calc(95dvh-1rem)] w-[95%] max-w-[68.4rem] flex-col sm:h-[85.5dvh] ${show ? "pdf-window-show" : ""}`}
      >
        <header
          className="flex min-h-9 items-center justify-between gap-3 px-1.5 py-1 text-black"
          style={{ backgroundColor: titleBarColor }}
        >
          <h2 id="itau-pdf-window-title" className="truncate font-mono text-sm font-bold sm:text-base">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="win95-button grid size-7 shrink-0 place-items-center text-lg font-black leading-none text-black focus:outline-2 focus:outline-offset-1 focus:outline-black"
            onClick={requestClose}
            aria-label="Close presentation window"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 bg-[#808080] p-1">
          <object data={src} type="application/pdf" tabIndex={-1} className="h-full w-full bg-white" aria-label={title}>
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#c0c0c0] p-6 text-center font-mono text-black">
              <p>This browser cannot display the PDF inline.</p>
              <a className="win95-button px-4 py-2 text-sm" href={src} target="_blank" rel="noreferrer">
                Open PDF
              </a>
            </div>
          </object>
        </div>

        <footer className="flex items-center justify-between gap-3 bg-[#c0c0c0] px-2 py-1 font-mono text-[11px] text-black sm:text-xs">
          <span className="truncate">itau-1q26-institutional-presentation.pdf</span>
          <a className="shrink-0 underline underline-offset-2" href={src} target="_blank" rel="noreferrer">
            Open PDF
          </a>
        </footer>
      </section>
    </div>,
    document.body
  )
}
