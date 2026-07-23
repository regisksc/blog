import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PdfWindow } from "./pdf-window"

describe("PdfWindow", () => {
  it("renders an iframe when open", () => {
    const { container } = render(<PdfWindow open onClose={() => {}} />)
    expect(container.querySelector("[data-testid=\"pdf-iframe\"]")).not.toBeNull()
  })

  it("renders nothing when closed", () => {
    const { container } = render(<PdfWindow open={false} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
