import { useState } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { SECRET_COMMANDS } from "@/lib/commands/catalog"
import { Portfolio } from "./portfolio"

const { effectState, triggerDvd } = vi.hoisted(() => ({
  effectState: { dvdPhase: "hidden" as "hidden" | "active" | "exiting" },
  triggerDvd: vi.fn(),
}))
let dvdMountCount = 0

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  })
})

vi.mock("@/hooks/use-fragment-explosion", () => ({
  useFragmentExplosion: () => ({ isLocked: false, trigger: vi.fn(() => true) }),
}))

vi.mock("@/hooks/use-easter-eggs", () => ({
  useEasterEggs: () => ({
    matrixPhase: "hidden",
    glitchPhase: "hidden",
    upsideDownPhase: "hidden",
    dvdPhase: effectState.dvdPhase,
    triggerMatrix: vi.fn(),
    triggerGlitch: vi.fn(),
    triggerUpsideDown: vi.fn(),
    triggerDvd,
    startCycle: vi.fn(),
    stopCycle: vi.fn(),
  }),
}))

vi.mock("../effects/matrix-rain", () => ({ MatrixRain: () => null }))
vi.mock("../effects/ascii-background", () => ({ AsciiBackground: () => null }))
vi.mock("../effects/dvd-overlay", () => ({
  DvdOverlay: () => {
    const [mountId] = useState(() => ++dvdMountCount)
    return <div data-testid="dvd-overlay">{mountId}</div>
  },
}))
vi.mock("@/lib/providers/run-command", () => ({
  RunCommandProvider: ({ children }: { children: React.ReactNode }) => children,
  useRunCommand: () => () => undefined,
}))

vi.mock("../sections/about", () => ({
  AboutSection: () => <button data-testid="about-link">click-contact</button>,
}))
vi.mock("../sections/contact", () => ({ ContactSection: () => <div>Contact Regis</div> }))
vi.mock("../sections/experience", () => ({ ExperienceSection: () => <div>Experience</div> }))
vi.mock("../lab/lab", () => ({ LabSection: () => <div>Lab</div> }))

const run = (command: string) => {
  const input = screen.getByRole("textbox")
  fireEvent.change(input, { target: { value: command } })
  fireEvent.submit(input.closest("form")!)
}

describe("Portfolio commands", () => {
  beforeEach(() => {
    vi.useRealTimers()
    triggerDvd.mockClear()
    effectState.dvdPhase = "hidden"
    dvdMountCount = 0
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders Contact and triggers DVD for hire me", () => {
    render(<Portfolio />)
    run("hire me")
    expect(screen.getByText("Contact Regis")).toBeInTheDocument()
    expect(triggerDvd).toHaveBeenCalledOnce()
  })

  it("prints a hidden command name instead of opening a popup", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    render(<Portfolio />)
    run("secret")
    expect(screen.getByText((text) => SECRET_COMMANDS.includes(text as typeof SECRET_COMMANDS[number]))).toBeInTheDocument()
  })

  it("preserves the DVD overlay while an active effect exits", () => {
    effectState.dvdPhase = "active"
    const view = render(<Portfolio />)
    expect(screen.getByTestId("dvd-overlay")).toHaveTextContent("1")

    effectState.dvdPhase = "exiting"
    view.rerender(<Portfolio />)
    expect(screen.getByTestId("dvd-overlay")).toHaveTextContent("1")
  })

  it("preserves the stateless DVD overlay when an exiting effect is retriggered", () => {
    effectState.dvdPhase = "exiting"
    const view = render(<Portfolio />)
    expect(screen.getByTestId("dvd-overlay")).toHaveTextContent("1")

    effectState.dvdPhase = "active"
    view.rerender(<Portfolio />)
    expect(screen.getByTestId("dvd-overlay")).toHaveTextContent("1")
  })

  it("rejects the removed command-reference command", () => {
    render(<Portfolio />)
    run("commands")
    expect(screen.getByText("zsh: command not found: commands")).toBeInTheDocument()
  })

  it("provides RunCommand context so AboutSection can call useRunCommand", async () => {
    // If the provider were missing, the mocked AboutSection's useRunCommand
    // would throw and the AboutSection would never render. We expect it to
    // render once the boot auto-type completes.
    render(<Portfolio />)
    expect(await screen.findByTestId("about-link", {}, { timeout: 5000 })).toBeInTheDocument()
  })
})
