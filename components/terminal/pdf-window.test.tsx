import { act, fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { PdfWindow } from "./pdf-window"

afterEach(() => vi.useRealTimers())

describe("PdfWindow", () => {
  it("renders portal at hidden state immediately and adds show class on next frame", () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const returnFocusRef = createRef<HTMLButtonElement>()

    const { container } = render(
      <PdfWindow open onClose={onClose} src="/presentation.pdf" title="Presentation" returnFocusRef={returnFocusRef} />,
    )

    // Mounted but not yet at the open state
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(container.ownerDocument.querySelector(".pdf-overlay")).not.toHaveClass("pdf-overlay-show")
    expect(container.ownerDocument.querySelector(".pdf-window")).not.toHaveClass("pdf-window-show")
    expect(container.ownerDocument.querySelector(".pdf-overlay")?.className).not.toContain("backdrop-blur")

    // Flush the 16ms setTimeout that adds the show class
    act(() => vi.advanceTimersByTime(16))
    expect(container.ownerDocument.querySelector(".pdf-overlay")).toHaveClass("pdf-overlay-show", "bg-black/45")
    expect(container.ownerDocument.querySelector(".pdf-window")).toHaveClass("pdf-window-show")
  })

  it("re-opens cleanly when triggered again during the close animation", () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const returnFocusRef = createRef<HTMLButtonElement>()

    const { container, rerender } = render(
      <PdfWindow open onClose={onClose} src="/presentation.pdf" title="Presentation" returnFocusRef={returnFocusRef} />,
    )

    // Reach fully open
    act(() => vi.advanceTimersByTime(16))

    // Start closing
    fireEvent.click(screen.getByRole("button", { name: "Close presentation window" }))
    expect(container.ownerDocument.querySelector(".pdf-overlay")).not.toHaveClass("pdf-overlay-show")

    // Simulate parent: presentationOpen = false (requestClose completed) ...
    rerender(
      <PdfWindow open={false} onClose={onClose} src="/presentation.pdf" title="Presentation" returnFocusRef={returnFocusRef} />,
    )
    act(() => vi.advanceTimersByTime(280))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    // ... then user re-clicks Itaú: presentationOpen = true again
    rerender(
      <PdfWindow open onClose={onClose} src="/presentation.pdf" title="Presentation" returnFocusRef={returnFocusRef} />,
    )
    expect(container.ownerDocument.querySelector(".pdf-overlay")).not.toHaveClass("pdf-overlay-show")

    // After one frame the modal must be visible again
    act(() => vi.advanceTimersByTime(16))
    expect(container.ownerDocument.querySelector(".pdf-overlay")).toHaveClass("pdf-overlay-show")
    expect(container.ownerDocument.querySelector(".pdf-window")).toHaveClass("pdf-window-show")
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("keeps dialog mounted through the close animation and unmounts after 280ms", () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const returnFocusRef = createRef<HTMLButtonElement>()

    const { container } = render(
      <PdfWindow open onClose={onClose} src="/presentation.pdf" title="Presentation" returnFocusRef={returnFocusRef} />,
    )

    act(() => vi.advanceTimersByTime(16))
    expect(container.ownerDocument.querySelector(".pdf-overlay")).toHaveClass("pdf-overlay-show")

    fireEvent.click(screen.getByRole("button", { name: "Close presentation window" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(container.ownerDocument.querySelector(".pdf-overlay")).not.toHaveClass("pdf-overlay-show")

    act(() => vi.advanceTimersByTime(279))
    expect(screen.getByRole("dialog")).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("survives reopen while the close timer is still pending", () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const returnFocusRef = createRef<HTMLButtonElement>()

    const { container, rerender } = render(
      <PdfWindow open onClose={onClose} src="/presentation.pdf" title="Presentation" returnFocusRef={returnFocusRef} />,
    )
    act(() => { vi.advanceTimersByTime(20) }) // finish opening
    // Start closing via the close button
    fireEvent.click(screen.getByRole("button", { name: "Close presentation window" }))
    act(() => { vi.advanceTimersByTime(100) }) // < 280ms close window
    // Reopen mid-close
    rerender(
      <PdfWindow open={false} onClose={onClose} src="/presentation.pdf" title="Presentation" returnFocusRef={returnFocusRef} />,
    )
    rerender(
      <PdfWindow open onClose={onClose} src="/presentation.pdf" title="Presentation" returnFocusRef={returnFocusRef} />,
    )
    act(() => { vi.advanceTimersByTime(300) }) // cross original close deadline
    expect(screen.queryByRole("dialog")).not.toBeNull()
    expect(container.ownerDocument.querySelector(".pdf-overlay")).toHaveClass("pdf-overlay-show")
    expect(onClose).not.toHaveBeenCalled()
  })

  it("does not render a loading shimmer", () => {
    const onClose = vi.fn()
    const returnFocusRef = createRef<HTMLButtonElement>()

    render(
      <PdfWindow open onClose={onClose} src="/presentation.pdf" title="Presentation" returnFocusRef={returnFocusRef} />,
    )

    expect(screen.queryByLabelText("Loading")).not.toBeInTheDocument()
    expect(document.querySelector(".pdf-loader")).not.toBeInTheDocument()
  })
})
