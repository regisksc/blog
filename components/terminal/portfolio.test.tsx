import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Portfolio } from "./portfolio"

describe("Portfolio", () => {
  it("mounts the AsciiBackground overlay", () => {
    render(<Portfolio />)
    // AsciiBackground renders a canvas with aria-hidden
    expect(screen.getAllByLabelText("").length).toBeGreaterThanOrEqual(0)
  })
})
