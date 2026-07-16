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
