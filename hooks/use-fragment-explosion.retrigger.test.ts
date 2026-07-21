import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useFragmentExplosion } from "./use-fragment-explosion"

describe("useFragmentExplosion re-trigger guard", () => {
  it("returns false when triggered too soon after a previous trigger", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useFragmentExplosion())
    let first: boolean | null = null
    let second: boolean | null = null
    act(() => { first = result.current.trigger() })
    act(() => { second = result.current.trigger() })
    expect(first).toBe(true)
    expect(second).toBe(false)
    vi.useRealTimers()
  })
})
