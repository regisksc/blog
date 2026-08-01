"use client"

import { useEffect, useState, useRef } from "react"
import { AsciiBanner } from "@/components/ui/ascii-banner"
import { useFragmentingSignal } from "@/lib/providers/fragment-explosion"
import { useRunCommand } from "@/lib/providers/run-command"

function CommandLink({ command, label }: { command: string; label: string }) {
  const run = useRunCommand()
  return (
    <button
      type="button"
      onClick={() => run(command)}
      className="inline-flex items-baseline gap-1.5 text-sm font-mono text-primary hover:text-foreground transition-colors duration-150 group cursor-pointer"
    >
      <span className="opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true">$</span>
      <span className="underline decoration-dotted underline-offset-4 decoration-primary/40 group-hover:decoration-primary">{command}</span>
      <span className="text-muted-foreground">— {label}</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" aria-hidden="true">↗</span>
    </button>
  )
}

const skills = [
  {
    category: "Flutter",
    items: ["BLoC", "Riverpod", "Platform Channels", "Widgetbook", "Animations", "Hive / Drift"],
  },
  {
    category: "Mobile",
    items: ["UIKit", "SwiftUI", "Combine", "RxSwift", "Android", "Compose"],
  },
  {
    category: "System Design",
    items: ["Clean Architecture", "DDD", "REST APIs", "CI/CD", "AWS", "Kafka"],
  },
  {
    category: "AI",
    items: ["Claude Code", "Hermes", "Loop Engineering", "Harness Engineering", "Graph Engineering", "RAG"],
  },
]

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

export function AboutSection() {
  const [showContent, setShowContent] = useState(false)
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const fragmentingSignal = useFragmentingSignal()

  // Typing animation state
  const [displayText, setDisplayText] = useState("")
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fade in content
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Typing/deleting effect
  useEffect(() => {
    const currentPhrase = phrases[phraseIndex]

    const type = () => {
      if (fragmentingSignal.current) {
        typingTimeoutRef.current = setTimeout(type, 120)
        return
      }

      if (isDeleting) {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(prev => prev.slice(0, -1))
          typingTimeoutRef.current = setTimeout(type, 30) // faster delete
        } else {
          setIsDeleting(false)
          setPhraseIndex(prev => (prev + 1) % phrases.length)
        }
      } else {
        // Typing
        if (displayText.length < currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1))
          typingTimeoutRef.current = setTimeout(type, 60) // typing speed
        } else {
          // Pause at end before deleting
          typingTimeoutRef.current = setTimeout(() => {
            if (fragmentingSignal.current) {
              type()
              return
            }
            setIsDeleting(true)
            type()
          }, 2500)
        }
      }
    }

    typingTimeoutRef.current = setTimeout(type, isDeleting ? 30 : 60)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [displayText, isDeleting, phraseIndex])

  return (
    <div className={`
      flex flex-col gap-6 sm:gap-8
      transition-opacity duration-300 ease-out
      ${showContent ? "opacity-100" : "opacity-0"}
    `}>
      {/* Hero */}
      <div>
        <p className="text-muted-foreground text-xs font-mono">
          <span className="text-primary/60" aria-hidden="true"># </span>hello, I&apos;m
        </p>
        <div className="mt-4 mb-4">
          <AsciiBanner />
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl min-h-[3.75rem] sm:min-h-[2.5rem]">
          {displayText}
        </p>
      </div>

      {/* Bio */}
      <div className="text-muted-foreground leading-relaxed max-w-2xl">
        <p>
          Senior software engineer, 7 years in. I&apos;ve shipped at every size: scrappy startup MVPs, companies mid-growth, and enterprise platforms with a lot of eyes on them. Mobile is where I&apos;m strongest with Flutter, Swift, and Kotlin, but I also build the APIs, auth, and databases sitting behind them.
        </p>
        <p className="mt-3">
          Having taken a major role in Itaú Shop's I lead a team and contributed across several squads. I shaped the mobile architecture, fixed a substantial authentication problem in its predecessor (iupp), and did a lot of the groundwork that got Flutter approved as an internal tech: shared component libraries, a company-wide design system, and CI/CD pipelines wired up with security, quality gates, and observability.
        </p>
        <p className="mt-3">
          Currently I work with US teams and English-speaking clients on production mobile. The thing I&apos;m good at is taking a fuzzy business ask and turning it into a plan someone can build, being honest about the trade-offs, and staying in the code through architecture, testing, and release. I run an AI-assisted workflow and keep sharpening it across planning, coding, review, testing, and research.
        </p>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 content-start">
        {skills.map((skillGroup, groupIndex) => (
          <div 
            key={skillGroup.category}
            className="transition-opacity duration-300"
            style={{ 
              transitionDelay: `${groupIndex * 50}ms`,
              opacity: showContent ? 1 : 0
            }}
          >
            <h3 className="text-xs font-mono text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
              <span data-fragment-keep="true" className="w-2 h-px bg-primary" />
              {skillGroup.category}
            </h3>
            <ul className="space-y-1.5">
              {skillGroup.items.map((skill) => (
                <li 
                  key={skill}
                  onMouseEnter={() => setHoveredSkill(skill)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className={`
                    text-sm transition-all duration-200 cursor-default relative pl-3
                    ${hoveredSkill === skill 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                    }
                  `}
                >
                  <span data-fragment-keep="true" className={`
                    absolute left-0 text-primary transition-all duration-200
                    ${hoveredSkill === skill ? "opacity-100" : "opacity-0"}
                  `}>
                    &gt;
                  </span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Clickable hints — let non-keyboard visitors trigger commands. */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-border/50 mt-2">
        <CommandLink command="xp" label="see my experience" />
        <CommandLink command="contact" label="get in touch" />
        <CommandLink command="lab" label="see experiments" />
      </div>

    </div>
  )
}
