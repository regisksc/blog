"use client"

import { useEffect, useState, useRef } from "react"

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
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  return (
    <div>
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
                  className={`cursor-default ${hoveredSkill === item ? "text-foreground" : "text-muted-foreground"}`}
                >{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
