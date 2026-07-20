import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useEasterEggs } from "./use-easter-eggs"

afterEach(() => {
  vi.useRealTimers()
})

describe("useEasterEggs", () => {
  it("stops theme cycling when unmounted", () => {
    vi.useFakeTimers()
    const setTheme = vi.fn()
    const { result, unmount } = renderHook(() =>
      useEasterEggs(setTheme),
    )

    act(() => result.current.startCycle(100))
    act(() => vi.advanceTimersByTime(100))
    expect(setTheme).toHaveBeenCalledOnce()

    unmount()
    act(() => vi.advanceTimersByTime(300))
    expect(setTheme).toHaveBeenCalledOnce()
  })
})
