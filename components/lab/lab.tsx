"use client"

import { useEffect, useState } from "react"
import { BLACK_HOLE_GRID, BlackHole } from "./black-hole"
import { GRAVITY_WELL_GRID, GRAVITY_WELL_PARTICLES, GravityWell } from "./gravity-well"

const experiments: { id: string; label: string; tagline: string }[] = [
  {
    id: "gravity-well",
    label: "gravity well",
    tagline: "move the pointer to drag the attractor, click to spawn a burst, right-click to reset — char density encodes speed",
  },
  {
    id: "black-hole",
    label: "black hole (3D)",
    tagline: "accretion disk raymarched around an event horizon with gravitational lensing — drag to orbit, scroll to zoom; chars encode doppler-boosted disk brightness",
  },
]

export function LabSection() {
  const [visibleLines, setVisibleLines] = useState(0)
  const totalLines = 3 + experiments.length

  useEffect(() => {
    setVisibleLines(0)
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= totalLines) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 80)
    return () => clearInterval(interval)
  }, [totalLines])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-xs font-mono">
          <span className="text-primary/60" aria-hidden="true"># </span>experiments
        </p>
        <p
          className="mt-3 text-muted-foreground leading-relaxed max-w-lg terminal-line"
          style={{ animationDelay: "120ms", opacity: visibleLines >= 2 ? 1 : 0 }}
        >
          Small canvas sketches that live inside the scrollback. No overlays, no
          modals — they run where you read them.
        </p>
      </div>

      <div
        className="terminal-line flex flex-col gap-3"
        style={{ animationDelay: "200ms", opacity: visibleLines >= 3 ? 1 : 0 }}
      >
        {experiments.map((exp, i) => (
          <article
            key={exp.id}
            className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3"
            style={{
              opacity: visibleLines >= 3 + i ? 1 : 0,
              transition: "opacity 150ms",
            }}
          >
            <header className="flex items-baseline gap-3">
              <h3 className="font-mono text-sm text-primary">{exp.label}</h3>
              <span className="text-xs text-muted-foreground">/lab/{exp.id}</span>
            </header>
            <p className="text-sm text-muted-foreground">{exp.tagline}</p>
            {exp.id === "gravity-well" ? <GravityWell /> : <BlackHole />}
            <p className="text-[11px] font-mono text-muted-foreground/70">
              {exp.id === "gravity-well"
                ? `${GRAVITY_WELL_PARTICLES} particles · ${GRAVITY_WELL_GRID} cells · drag to move · click to burst · right-click to reset`
                : `${BLACK_HOLE_GRID} disk march · drag to orbit · scroll to zoom · 30fps`}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}