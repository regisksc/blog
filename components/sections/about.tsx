
function CommandLink({ command, label }: { command: string; label: string }) {
  const run = useRunCommand()
  return (
    <button
      type="button"
      onClick={() => run(command)}
      className="text-sm font-mono text-primary hover:text-foreground"
    >
      <span>${command}</span>
      <span>— {label}</span>
    </button>
  )
}

"use client"

import { useEffect, useState, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

import { AsciiBanner } from "@/components/ui/ascii-banner"



const phrases = [
  "I ship reliable, accessible mobile apps.",
  "I make Flutter and native work together.",
  "I build foundations teams can scale.",
  "I turn complexity into clear architecture.",
  "I design for offline and poor networks.",
  "I fix production issues at the root.",
  "I balance business needs with tech reality.",
  "I take products from idea to release.",
]

const skills = [
  { category: "Flutter", items: ["BLoC", "Riverpod", "Platform Channels", "Widgetbook", "Animations", "Hive / Drift"] },
  { category: "Mobile", items: ["UIKit", "SwiftUI", "Combine", "RxSwift", "Android", "Compose"] },
  { category: "System Design", items: ["Clean Architecture", "DDD", "REST APIs", "CI/CD", "AWS", "Kafka"] },
  { category: "AI", items: ["Claude Code", "Hermes", "Loop Engineering", "Harness Engineering", "Graph Engineering", "RAG"] },
]

export function AboutSection() {

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex]
    if (reducedMotion) {
      setDisplayText(currentPhrase)
      return
    }
    if (displayText.length < currentPhrase.length) {
      typingTimeoutRef.current = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1))
      }, 60)
      return () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current) }
    }
  }, [displayText, phraseIndex])


  useEffect(() => {
    if (displayText.length === phrases[phraseIndex].length) {
      typingTimeoutRef.current = setTimeout(() => setIsDeleting(true), 2500)
      return () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current) }
    }
    if (isDeleting && displayText.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1))
      }, 30)
      return () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current) }
    }
    if (isDeleting && displayText.length === 0) {
      setIsDeleting(false)
      setPhraseIndex(prev => (prev + 1) % phrases.length)
    }
  }, [displayText, isDeleting, phraseIndex])

  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  const [displayText, setDisplayText] = useState("")
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  return (
    <div data-fragment-key="about" className={`flex flex-col gap-6 sm:gap-8 transition-opacity duration-300 ${showContent ? "opacity-100" : "opacity-0"}`}>
      <AsciiBanner />
      <p>Senior software engineer, 7 years in. I've shipped at every size: scrappy startup MVPs, companies mid-growth, and enterprise platforms with a lot of eyes on them.</p>
      <p>Having taken a major role in Itaú Shop's I lead a team and contributed across several squads. I shaped the mobile architecture, fixed a substantial authentication problem in its predecessor (iupp), and did a lot of the groundwork that got Flutter approved as an internal tech.</p>
      <p>Currently I work with US teams and English-speaking clients on production mobile. I'm good at taking a fuzzy business ask and turning it into a plan someone can build.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {skills.map((group) => (
          <div key={group.category}>
            <h3>{group.category}</h3>
            <ul>
              {group.items.map((item) => (
                <li
                  key={item}
                  onMouseEnter={() => setHoveredSkill(item)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className={`cursor-default relative pl-3 transition-all duration-200 ${hoveredSkill === item ? "text-foreground" : "text-muted-foreground"}`}
                >
                  <span data-fragment-keep="true" className={`absolute left-0 text-primary transition-all duration-200 ${hoveredSkill === item ? "opacity-100" : "opacity-0"}`}>&gt;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    <div className="flex flex-wrap gap-6 pt-2 border-t border-border/50 mt-2">
      <CommandLink command="xp" label="see my experience" />
      <CommandLink command="contact" label="get in touch" />
      <CommandLink command="lab" label="see experiments" />
    </div>
    </div>
  )
}
