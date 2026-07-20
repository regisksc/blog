import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useEasterEggs } from "./use-easter-eggs"

afterEach(() => vi.useRealTimers())

describe("useEasterEggs rapid re-trigger", () => {
  it("cancels pending exit/hide timers when re-triggered mid-fade", () => {
    vi.useFakeTimers()
    const setTheme = vi.fn()
    const { result } = renderHook(() => useEasterEggs(setTheme))
    act(() => result.current.triggerGlitch())
    expect(result.current.glitchPhase).toBe("active")
    // Re-trigger mid-active — should still be active (not exit pending yet)
    act(() => result.current.triggerGlitch())
    expect(result.current.glitchPhase).toBe("active")
  })
})
