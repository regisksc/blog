"use client"

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { TerminalInput, type TerminalInputHandle } from "./terminal-input"
import { SECTION_COMPONENTS } from "../sections/section-map"
import { RunCommandProvider } from "@/lib/providers/run-command"
import { MatrixRain } from "../effects/matrix-rain"
import { AsciiBackground } from "../effects/ascii-background"
import { DvdOverlay } from "../effects/dvd-overlay"
import { ScrollbackLog, type LogEntry } from "./scrollback-log"
import type { Theme, Section } from "@/lib/types"
import { THEMES } from "@/lib/types"
import { sectionAliases, type CommandResult } from "@/lib/commands/catalog"
import { getStaticResponse } from "@/lib/commands/resolver"
import { useFragmentExplosion } from "@/hooks/use-fragment-explosion"
import { useEasterEggs } from "@/hooks/use-easter-eggs"

export function Portfolio() {
  const [theme, setTheme] = useState<Theme>("green")
  const [isDark, setIsDark] = useState(true)
  const [log, setLog] = useState<LogEntry[]>([])
  const logIdRef = useRef(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<TerminalInputHandle>(null)
  const { isLocked: isFragmentingLocked, trigger: triggerFragmentExplosion } = useFragmentExplosion(contentRef)
  const {
    matrixPhase,
    glitchPhase,
    upsideDownPhase,
    dvdPhase,
    triggerMatrix,
    triggerGlitch,
    triggerUpsideDown,
    triggerDvd,
    startCycle,
    stopCycle,
  } = useEasterEggs(setTheme)

  // Effects fade out smoothly via opacity. Class-toggling effects keep their
  // classes through active + exiting; the wrapper handles the fade.
  const fadeStyle = (phase: "hidden" | "active" | "exiting"): React.CSSProperties => ({
    opacity: phase === "exiting" ? 0 : 1,
    transition: "opacity 320ms ease-out",
  })

  // Apply theme + light/dark to <html>.
  useEffect(() => {
    const html = document.documentElement
    html.classList.remove(
      "theme-green", "theme-amber", "theme-rose", "theme-cyan", "theme-violet",
      "dark", "light"
    )
    html.classList.add(`theme-${theme}`)
    html.classList.add(isDark ? "dark" : "light")
  }, [theme, isDark])

  // Render a section as an inline output node for the history stream.
  const renderSection = useCallback((section: Section): ReactNode => {
    const Component = SECTION_COMPONENTS[section]
    return <Component />
  }, [])

  const handleCommand = useCallback((command: string): CommandResult => {
    if (isFragmentingLocked && command !== "shatter") {
      return { success: false, message: "fragment protocol running..." }
    }

    // Section navigation → print the section into the stream.
    if (sectionAliases[command]) {
      const section = sectionAliases[command]
      return { success: true, node: renderSection(section) }
    }

    // Theme / mode.
    if (command === "light" || command === "day") {
      setIsDark(false)
      return { success: true, message: "let there be light" }
    }
    if (command === "dark" || command === "night") {
      setIsDark(true)
      return { success: true, message: "darkness falls" }
    }
    if (command === "stop") {
      stopCycle()
      return { success: true, message: "stopped" }
    }
    if (command.startsWith("theme ")) {
      const arg = command.split(" ")[1]
      // `theme cycle` / `theme stop` are variants of the theme command.
      if (arg === "cycle") {
        stopCycle()
        startCycle()
        return { success: true, message: "cycling themes... type 'theme stop' to end" }
      }
      if (arg === "stop") {
        stopCycle()
        return { success: true, message: "stopped" }
      }
      const themeName = arg as Theme
      if ((THEMES as readonly string[]).includes(themeName)) {
        stopCycle()
        setTheme(themeName)
        return { success: true, message: `theme set to ${themeName}` }
      }
      return { success: false, message: "themes: green, amber, rose, cyan, violet, cycle" }
    }

    // Pure-response commands.
    const staticResult = getStaticResponse(command)
    if (staticResult) return staticResult

    // Stateful / effect commands.
    switch (command) {
      case "clear":
      case "cls":
      case "reset":
        setLog([])
        return { success: true }

      case "shatter":
        if (triggerFragmentExplosion()) {
          return { success: true, message: "fragment protocol activated..." }
        }
        return { success: true, message: "fragment protocol already running" }

      case "sudo":
      case "sudo rm -rf":
      case "sudo rm -rf /":
      case "rm -rf /":
        triggerGlitch()
        return { success: true, message: "permission denied... just kidding, nice try" }

      case "matrix":
        triggerMatrix()
        return { success: true, message: "wake up, neo..." }

      case "glitch":
      case "crash":
        triggerGlitch()
        return { success: true, message: "system malfunction..." }

      case "dvd":
        triggerDvd()
        return { success: true, message: "you know what to do" }

      case "upside-down":
      case "upside down":
      case "hawkins":
        triggerUpsideDown()
        return { success: true, message: "you've entered the upside-down" }

      case "reboot":
      case "restart":
        window.location.reload()
        return { success: true, message: "rebooting..." }

      case "hire me":
        triggerDvd()
        return { success: true, node: renderSection("contact") }

      default:
        return { success: false, message: `zsh: command not found: ${command}` }
    }
  }, [isFragmentingLocked, renderSection, triggerGlitch, triggerMatrix, triggerUpsideDown, triggerDvd, startCycle, stopCycle, triggerFragmentExplosion])

  // Every executed command appends an entry (text or rendered node) to the stream.
  const runCommand = useCallback((command: string, opts?: { hideCommand?: boolean }): { success: boolean; message?: string } => {
    const isClear = ["clear", "cls", "reset"].includes(command)
    if (isClear) {
      // Wipe the stream, then re-run `about` so the user isn't left with a blank prompt.
      setLog([])
      const aboutResult = handleCommand("about")
      setLog([{
        id: logIdRef.current++,
        command: "about",
        message: aboutResult.message,
        node: aboutResult.node,
        success: aboutResult.success,
        hideCommand: true,
      }])
      return { success: true }
    }

    const result = handleCommand(command)
    setLog(prev => [
      ...prev,
      {
        id: logIdRef.current++,
        command,
        message: result.message,
        node: result.node,
        success: result.success,
        hideCommand: opts?.hideCommand,
      },
    ])
    return { success: result.success, message: result.message }
  }, [handleCommand])

  // On first load, auto-type `about` and submit it, like a fresh shell greeting.
  const bootedRef = useRef(false)
  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true
    const t = setTimeout(() => {
      // Boot command is hidden so the scrollback starts at the top of About
      // instead of pinning to the bottom.
      inputRef.current?.autoType("about", { hideCommand: true })
    }, 500)
    return () => clearTimeout(t)
  }, [])

  // Sections can run commands via the RunCommandProvider context — no window
// event bus needed.

  return (
    <div
      data-portfolio-root
      className={`
        relative h-screen w-screen flex flex-col overflow-hidden
        transition-colors duration-300
      `}
    >
      {/* Opaque base fill + animated ASCII field */}
      <div className="fixed inset-0 -z-20 bg-background" aria-hidden="true" />
      <AsciiBackground />

      {matrixPhase !== "hidden" && <MatrixRain />}
      {dvdPhase !== "hidden" && (
        <div style={fadeStyle(dvdPhase)}>
          <DvdOverlay />
        </div>
      )}

      {/* REPL history stream — grows and scrolls above the prompt. Each
          class-toggling effect gets its own opacity wrapper, so one effect
          fading out doesn't interrupt another effect that is still active. */}
      <RunCommandProvider run={runCommand}>
        <div
          ref={contentRef}
          className="flex-1 min-h-0 flex flex-col"
          style={fadeStyle(glitchPhase)}
          data-glitch-target
        >
          <div
            className={`flex-1 min-h-0 flex flex-col ${glitchPhase !== "hidden" ? "animate-glitch" : ""}`}
            style={fadeStyle(upsideDownPhase)}
          >
            <div className={`flex-1 min-h-0 flex flex-col ${upsideDownPhase !== "hidden" ? "upside-down" : ""}`}>
              <ScrollbackLog entries={log} />
            </div>
          </div>
        </div>
      </RunCommandProvider>

      {/* Bottom prompt bar */}
      <div className="flex-shrink-0">
        <TerminalInput ref={inputRef} onCommand={runCommand} disabled={isFragmentingLocked} />

        <footer className="border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-mono">
              <span className="text-primary">$</span> built with next.js
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span className="hidden sm:inline opacity-60">run &quot;help&quot; to list commands</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-subtle-pulse" />
                <span>available for work</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
