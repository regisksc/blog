import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useRef } from "react"
import { FragmentExplosionProvider } from "@/lib/providers/fragment-explosion"
import { useFragmentExplosion } from "./use-fragment-explosion"

function Harness({ onReady }: { onReady: (t: () => boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const { trigger } = useFragmentExplosion(ref)
  onReady(trigger)
  return <div ref={ref}><p>hello world</p></div>
}

describe("useFragmentExplosion cleanup", () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.className = ""
    document.body.querySelectorAll(".fragmenting-flash-overlay").forEach((n) => n.remove())
  })

  it("removes flash overlay and body classes if unmounted during flash", () => {
    vi.useFakeTimers()
    let trigger: (() => boolean) | undefined
    const { unmount } = render(
      <FragmentExplosionProvider>
        <Harness onReady={(t) => (trigger = t)} />
      </FragmentExplosionProvider>,
    )
    act(() => { trigger!() })
    expect(document.querySelector(".fragmenting-flash-overlay")).not.toBeNull()
    act(() => { unmount() })
    expect(document.querySelector(".fragmenting-flash-overlay")).toBeNull()
    expect(document.body.classList.contains("fragmenting")).toBe(false)
    expect(document.body.classList.contains("fragmenting-flash")).toBe(false)
  })
})