"use client"

import { useState } from "react"

type ExperimentId = "gravity-well" | "black-hole"

const EXPERIMENTS: { id: ExperimentId; label: string }[] = [
  { id: "gravity-well", label: "gravity well" },
  { id: "black-hole", label: "black hole" },
]

// Scaffold — experiment chooser + actual experiments land in #195 + #198 + #207.
export function LabSection() {
  const [active, setActive] = useState<ExperimentId>("gravity-well")
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {EXPERIMENTS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setActive(e.id)}
            className={`text-xs font-mono px-3 py-1 rounded border ${active === e.id ? "bg-primary text-background border-primary" : "border-border text-muted-foreground"}`}
            data-experiment-tab={e.id}
          >
            {e.label}
          </button>
        ))}
      </div>
      <div data-active-experiment={active} className="rounded border border-border p-4 min-h-[200px]" />
    </div>
  )
}
