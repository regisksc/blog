"use client"

import { useEffect, useState } from "react"

/* Glyph pool: Latin (upper + lower), Greek, Cyrillic, Arabic, Hebrew, math
   symbols, digits, and a small katakana/hiragana sprinkle. Deliberately wider
   than a stock matrix rain so this isn't a direct fork. */
const GLYPHS =
  "abcdefghijklmnopqrstuvwxyz" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
  "0123456789" +
  "αβγδεζηθλμπσφω" +
  "абвгдежзийклмн" +
  "ابتثجحخدذرزسش" +
  "אבגדהוזחטיכלמנ" +
  "<>=/\\*+?#@$&%^~_|αβγавאבابت" +
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ" +
  "あいうえおかきくけこさしすせそ"

const COL_WIDTH = 18
const ROW_HEIGHT = 18
const DROP_LENGTH_MIN = 16
const DROP_LENGTH_MAX = 30
const SPEED_MIN = 1.4
const SPEED_MAX = 3.6
const RESPAWN_AGE_MIN = 220
const RESPAWN_AGE_MAX = 520
const X_JITTER = 4

const PHRASE_CODES = [
  21315, 23610, 20039, 20039, 32,
  21353, 21314, 12581, 20039, 19970, 12562, 20008, 20960, 20039,
]
const PHRASE_GLYPHS = PHRASE_CODES.map((c) => String.fromCodePoint(c))

interface Drop {
  id: number
  x: number
  y: number
  speed: number
  length: number
  glyphs: string[]
  age: number
  maxAge: number
  phraseOffset: number
}

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
}

function buildGlyphs(length: number): string[] {
  return Array.from({ length }, randomGlyph)
}

function buildDrop(id: number, x: number, columns: number): Drop {
  const length = DROP_LENGTH_MIN + Math.floor(Math.random() * (DROP_LENGTH_MAX - DROP_LENGTH_MIN))
  const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN)
  const phraseOffset = Math.floor(Math.random() * length)
  return {
    id,
    x,
    y: -Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
    speed,
    length,
    glyphs: buildGlyphs(length),
    age: 0,
    maxAge: RESPAWN_AGE_MIN + Math.floor(Math.random() * (RESPAWN_AGE_MAX - RESPAWN_AGE_MIN)),
    phraseOffset,
  }
}

function recycle(drop: Drop, columns: number): Drop {
  const nudge = Math.random() < 0.5 ? -X_JITTER : X_JITTER
  const nextX = Math.max(0, Math.min((columns - 1) * COL_WIDTH, drop.x + nudge))
  return {
    ...drop,
    x: nextX,
    y: -drop.length * ROW_HEIGHT,
    speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
    length: DROP_LENGTH_MIN + Math.floor(Math.random() * (DROP_LENGTH_MAX - DROP_LENGTH_MIN)),
    glyphs: buildGlyphs(drop.length),
    age: 0,
    maxAge: RESPAWN_AGE_MIN + Math.floor(Math.random() * (RESPAWN_AGE_MAX - RESPAWN_AGE_MIN)),
    phraseOffset: Math.floor(Math.random() * drop.length),
  }
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function MatrixRain() {
  const [drops, setDrops] = useState<Drop[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    let columns = Math.max(8, Math.floor(window.innerWidth / COL_WIDTH))
    const initial: Drop[] = Array.from({ length: columns }, (_, i) => buildDrop(i, i * COL_WIDTH, columns))
    setDrops(initial)

    if (prefersReducedMotion()) return

    const onVisibility = () => {
      if (document.hidden) setDrops([])
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
    }

    let raf = 0
    let last = performance.now()
    const frameInterval = 1000 / 60

    const tick = (now: number) => {
      const dt = now - last
      if (dt < frameInterval) {
        raf = requestAnimationFrame(tick)
        return
      }
      last = now

      setDrops((prev) => {
        if (prev.length === 0) return prev
        const out: Drop[] = new Array(prev.length)
        for (let i = 0; i < prev.length; i++) {
          const d = prev[i]
          const advanced: Drop = { ...d, y: d.y + d.speed, age: d.age + 1 }

          const newGlyphs = d.glyphs.slice()
          if (Math.random() < 0.06) {
            const idx = Math.floor(Math.random() * d.glyphs.length)
            newGlyphs[idx] = randomGlyph()
          }
          const headRow = Math.floor(advanced.y / ROW_HEIGHT)
          const trailRows = d.length - 1
          if (headRow > 0 && headRow <= trailRows - PHRASE_GLYPHS.length + 1) {
            const window = (d.id + Math.floor(d.age / 8)) % 6
            if (window === 0) {
              for (let p = 0; p < PHRASE_GLYPHS.length; p++) {
                newGlyphs[p] = PHRASE_GLYPHS[p]
              }
            }
          }
          advanced.glyphs = newGlyphs
          out[i] = advanced.age >= advanced.maxAge ? recycle(advanced, columns) : advanced
        }
        return out
      })

      raf = requestAnimationFrame(tick)
    }

    const onResize = () => {
      const next = Math.max(8, Math.floor(window.innerWidth / COL_WIDTH))
      if (next === columns) return
      columns = next
      setDrops((prev) => {
        if (next > prev.length) {
          const extras: Drop[] = []
          for (let i = prev.length; i < next; i++) {
            extras.push(buildDrop(i, i * COL_WIDTH, columns))
          }
          return [...prev, ...extras]
        }
        return prev.slice(prev.length - next)
      })
    }

    raf = requestAnimationFrame(tick)
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-40 overflow-hidden pointer-events-none bg-background/80"
    >
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute top-0 font-mono text-sm text-primary leading-none drop-opacity"
          style={{
            left: drop.x,
            transform: `translate3d(0, ${drop.y}px, 0)`,
            willChange: "transform",
          }}
        >
          {drop.glyphs.map((char, i) => {
            const headness = 1 - i / drop.length
            const opacity = 0.15 + headness * 0.85
            return (
              <div
                key={i}
                className="h-[18px]"
                style={{
                  opacity,
                  textShadow: i === 0 ? "0 0 10px currentColor" : "none",
                }}
              >
                {char}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}