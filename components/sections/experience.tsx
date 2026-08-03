"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { PdfWindow } from "../terminal/pdf-window"

const ITAU_PRESENTATION_URL = "https://www.itau.com.br/download-file/v2/d/42787847-4cf6-4461-94a5-40ed237dca33/1f7e6629-5b4e-203b-c533-a416e238fc62?origin=2"

const experience = [
  {
    id: "01",
    company: "Jahnel Group",
    role: "Sr. Mobile Engineer",
    highlightCompany: true,
    companyUrl: "https://www.jahnelgroup.com",
    description:
      "Building production mobile systems across Flutter and native iOS/Android. Delivered a shared component library and design system, an ML/OCR VIN scanner with Swift and Kotlin bindings, offline-first platform-channel contracts, and a unified in-app purchase layer backed by Django reconciliation. Established testing, analytics, crash monitoring, and CI/CD guardrails across team apps.",
    tech: ["Flutter", "Swift", "Kotlin", "Django", "StoreKit 2", "CI/CD"],
    period: "Feb 2025 — Present",
  },
  {
    id: "02",
    company: "Banco Itaú",
    role: "Staff Mobile Engineer",
    highlightCompany: true,
    opensPresentation: true,
    description:
      "Shipped marketplace and loyalty experiences for a banking product serving 15M+ peak active users. Built Swift bridges for authentication and the Itaú Shop webview showcase, routing deep links, payments, attribution, and security through the native channel. Helped enable Flutter as an approved internal stack through shared components, a design system, CI/CD, and reusable platform contracts.",
    tech: ["Swift", "UIKit", "Flutter", "Clean Architecture", "Design Systems", "CI/CD"],
    period: "Mar 2021 — Jan 2025",
  },
  {
    id: "03",
    company: "Early Career",
    role: "Full-Stack & Mobile Developer",
    highlightCompany: false,
    description:
      "Built and shipped production MVPs across AgTech, fintech, and automotive products, working across mobile interfaces, backend services, APIs, and data stores.",
    tech: ["Mobile", "REST APIs", "Python", "SQL", "NoSQL"],
    period: "2019 — 2021",
  },
]

export function ExperienceSection() {
  const [showContent, setShowContent] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [presentationOpen, setPresentationOpen] = useState(false)
  const presentationButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }
  const closePresentation = useCallback(() => setPresentationOpen(false), [])

  return (
    <div className={`flex flex-col transition-opacity duration-300 ease-out ${showContent ? "opacity-100" : "opacity-0"}`}>
      <div className="mb-4 sm:mb-6">
        <p className="text-muted-foreground text-xs font-mono">
          <span className="text-primary/60" aria-hidden="true"># </span>experience
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {experience.map((item, index) => {
          const expanded = expandedId === item.id

          return (
            <div
              key={item.id}
              className="transition-all duration-300"
              style={{
                transitionDelay: `${index * 50}ms`,
                opacity: showContent ? 1 : 0,
                transform: showContent ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <article
                className={`group relative -mx-2 cursor-pointer rounded-lg p-4 transition-all duration-300 sm:-mx-4 ${
                  hoveredId === item.id || expanded ? "bg-card" : "hover:bg-card/50"
                }`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => toggleExpanded(item.id)}
              >
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className={`text-xs font-mono transition-colors duration-200 ${
                        hoveredId === item.id ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {item.id}
                      </span>

                      <h3 className="flex min-w-0 items-center text-base font-medium">
                        <span className="inline-flex w-[1.125rem] shrink-0" aria-hidden="true">
                          {item.highlightCompany && (item.companyUrl || item.opensPresentation) ? (
                            <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" />
                          ) : null}
                        </span>
                        {item.highlightCompany && item.companyUrl ? (
                          <a
                            className="group/company inline-flex items-center text-primary underline decoration-primary/50 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                            href={item.companyUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {item.company}
                          </a>
                        ) : item.highlightCompany && item.opensPresentation ? (
                          <button
                            ref={presentationButtonRef}
                            type="button"
                            className="group/company inline-flex items-center text-left text-primary underline decoration-primary/50 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                            onClick={(event) => {
                              event.stopPropagation()
                              setPresentationOpen(true)
                            }}
                          >
                            {item.company}
                          </button>
                        ) : (
                          <span className="text-foreground">{item.company}</span>
                        )}
                        <span className="text-foreground"> — {item.role}</span>
                      </h3>

                      <button
                        type="button"
                        className={`font-mono text-xs text-primary transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                          expanded ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                        }`}
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${item.company} experience`}
                        aria-expanded={expanded}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleExpanded(item.id)
                        }}
                      >
                        [{expanded ? "−" : "+"}]
                      </button>
                    </div>

                    <p className={`text-sm text-muted-foreground leading-relaxed transition-all duration-300 break-words [overflow-wrap:anywhere] ${
                      expanded ? "" : "line-clamp-2"
                    }`}>
                      {item.description}
                    </p>
                    {!expanded && (
                      <span className="mt-1 inline-block font-mono text-xs text-primary/80">Read more</span>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.tech.map((technology, technologyIndex) => (
                        <span
                          key={technology}
                          data-fragment-keep="true"
                          className={`rounded px-2 py-0.5 text-xs font-mono transition-all duration-200 ${
                            hoveredId === item.id ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                          }`}
                          style={{ transitionDelay: hoveredId === item.id ? `${technologyIndex * 30}ms` : "0ms" }}
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="shrink-0 text-xs font-mono text-muted-foreground">{item.period}</span>
                </div>
              </article>
            </div>
          )
        })}
      </div>

      <PdfWindow
        open={presentationOpen}
        onClose={closePresentation}
        src={ITAU_PRESENTATION_URL}
        title="Itaú Institutional Presentation — Document Viewer"
        returnFocusRef={presentationButtonRef}
      />
    </div>
  )
}
