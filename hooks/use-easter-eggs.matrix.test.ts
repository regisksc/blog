import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useEasterEggs } from "./use-easter-eggs"

describe("useEasterEggs matrix trigger", () => {
  it("exposes a matrixPhase and triggerMatrix", () => {
    vi.useFakeTimers()
    const setTheme = vi.fn()
    const { result } = renderHook(() => useEasterEggs(setTheme))
    expect(result.current.matrixPhase).toBe("hidden")
    expect(typeof result.current.triggerMatrix).toBe("function")
    act(() => result.current.triggerMatrix())
    expect(result.current.matrixPhase).toBe("active")
    vi.useRealTimers()
  })
})
