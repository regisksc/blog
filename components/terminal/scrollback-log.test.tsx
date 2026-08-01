import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { ScrollbackLog, type LogEntry } from "./scrollback-log"

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  })
})

const setDimensions = (element: HTMLElement) => {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: 400 },
    scrollHeight: { configurable: true, value: 800 },
  })
}

describe("ScrollbackLog", () => {
  it("starts hidden About output at the top and hides its cue after scrolling", () => {
    const entries: LogEntry[] = [{ id: 1, command: "about", node: <div>About Regis</div>, success: true, hideCommand: true }]
    render(<ScrollbackLog entries={entries} />)
    const log = screen.getByRole("log")
    setDimensions(log)
    act(() => window.dispatchEvent(new Event("resize")))

    expect(log.scrollTop).toBe(0)
    expect(screen.getByText("more below ↓")).toBeInTheDocument()

    log.scrollTop = 10
    fireEvent.scroll(log)
    expect(screen.queryByText("more below ↓")).not.toBeInTheDocument()
  })

  it("pins ordinary command output to the bottom", () => {
    const entries: LogEntry[] = [{ id: 1, command: "experience", node: <div>Experience</div>, success: true }]
    render(<ScrollbackLog entries={entries} />)
    const log = screen.getByRole("log")
    setDimensions(log)
    act(() => window.dispatchEvent(new Event("resize")))
    expect(log.scrollTop).toBe(800)
  })
})
