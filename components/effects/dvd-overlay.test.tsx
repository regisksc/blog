import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DvdOverlay } from "./dvd-overlay"

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1))
  vi.stubGlobal("cancelAnimationFrame", vi.fn())
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("DvdOverlay", () => {
  it("leaves lifecycle opacity to the parent phase controller", () => {
    render(<DvdOverlay />)
    act(() => vi.advanceTimersByTime(12000))
    expect(document.querySelector(".dvd-overlay")).toHaveClass("opacity-100")
  })

  it("settles at the origin without changing theme every frame in a narrow viewport", () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal("innerWidth", 320)
    vi.stubGlobal("innerHeight", 70)
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    }))
    vi.spyOn(Math, "random").mockReturnValue(0)

    render(<DvdOverlay />)
    const overlay = document.querySelector(".dvd-overlay")!

    act(() => frames.shift()!(0))
    expect(overlay).toHaveStyle({ left: "0px", top: "0px" })
    const themeAfterFirstFrame = overlay.getAttribute("data-theme")

    act(() => frames.shift()!(16))
    expect(overlay).toHaveStyle({ left: "0px", top: "0px" })
    expect(overlay).toHaveAttribute("data-theme", themeAfterFirstFrame!)
  })

  it("settles at the origin when positive available bounds are smaller than padding", () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal("innerWidth", 373)
    vi.stubGlobal("innerHeight", 93)
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    }))
    vi.spyOn(Math, "random").mockReturnValue(0)

    render(<DvdOverlay />)
    const overlay = document.querySelector(".dvd-overlay")!

    act(() => frames.shift()!(0))
    expect(overlay).toHaveStyle({ left: "0px", top: "0px" })
    const themeAfterFirstFrame = overlay.getAttribute("data-theme")

    act(() => frames.shift()!(16))
    expect(overlay).toHaveStyle({ left: "0px", top: "0px" })
    expect(overlay).toHaveAttribute("data-theme", themeAfterFirstFrame!)
  })
})
