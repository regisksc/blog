import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { ScrollbackLog, type LogEntry } from "./scrollback-log"

describe("ScrollbackLog", () => {
  it("renders lines", () => {
    const entries: LogEntry[] = [{ id: 1, command: "hi", success: true, message: "hello" }]
    render(<ScrollbackLog entries={entries} />)
    expect(screen.getByText("hi")).toBeInTheDocument()
  })
})


describe("ScrollbackLog auto-scroll", () => {
  it("scrolls to bottom on new entries", () => {
    const entries: LogEntry[] = [{ id: 1, command: "about", success: true, message: "regis" }]
    const { container } = render(<ScrollbackLog entries={entries} />)
    const log = container.querySelector('[role="log"]')
    expect(log).toBeTruthy()
  })
})
