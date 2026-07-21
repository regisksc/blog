const FRAGMENT_BATCH = 32 // particles per RAF tick (perf)
import { useState, useCallback, useEffect, useRef, type RefObject } from "react"

import { useFragmentingSignal } from "@/lib/providers/fragment-explosion"

type Phase = "idle" | "flash" | "burst" | "falling" | "cleanup"

const FLASH_MS = 220

interface HiddenTarget {
  el: HTMLElement
  prevOpacity: string
  prevVisibility: string
}

interface ScrollTarget {
  el: HTMLElement
  prevOverflow: string
  prevOverflowX: string
  prevOverflowY: string
}

interface ReplacedText {
  originalText: Text
  chunk: HTMLSpanElement
}

// Pre-baked randomization buckets. Each letter picks one bucket instead of
// paying for 5 inline `setProperty` calls. 6 buckets × 5 props = enough variety
// without per-element style writes.
const BUCKETS = [
  { x: -180, y: -160, rot: -780, stagger: 0,   duration: 1500 },
  { x:  160, y: -120, rot:  720, stagger: 60,  duration: 1700 },
  { x: -100, y: -210, rot: -440, stagger: 130, duration: 1900 },
  { x:  220, y:  -80, rot:  880, stagger: 30,  duration: 1400 },
  { x:  -60, y: -260, rot: -960, stagger: 180, duration: 2000 },
  { x:  120, y: -140, rot:  540, stagger: 90,  duration: 1600 },
] as const

const LETTER_BUCKET_CLASSES = [
  "fragment-letter-0",
  "fragment-letter-1",
  "fragment-letter-2",
  "fragment-letter-3",
  "fragment-letter-4",
  "fragment-letter-5",
] as const

const buildChunkForTextNode = (textNode: Text): ReplacedText | null => {
  const originalText = textNode.nodeValue ?? ""
  const parent = textNode.parentNode
  if (!parent || !parent.contains(textNode)) return null

  const chunk = document.createElement("span")
  chunk.className = "fragment-chunk"

  // Build via DocumentFragment so we only touch the live DOM once per text node.
  const frag = document.createDocumentFragment()
  let bucketIndex = 0
  for (let i = 0; i < originalText.length; i++) {
    const ch = originalText[i]
    if (ch.trim() === "") {
      frag.appendChild(document.createTextNode(ch))
      continue
    }
    const letter = document.createElement("span")
    letter.className = LETTER_BUCKET_CLASSES[bucketIndex % LETTER_BUCKET_CLASSES.length]
    letter.textContent = ch
    // Self-remove on animation end — no RAF sweep needed.
    letter.addEventListener("animationend", () => {
      letter.remove()
    }, { once: true })
    frag.appendChild(letter)
    bucketIndex++
  }
  chunk.appendChild(frag)
  parent.replaceChild(chunk, textNode)
  return { originalText: textNode, chunk }
}

export function useFragmentExplosion(contentRef: RefObject<HTMLDivElement | null>) {
  const signal = useFragmentingSignal()
  const [isLocked, setIsLocked] = useState(false)

  const phaseRef = useRef<Phase>("idle")
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cleanupRafRef = useRef<number | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const hiddenTargetsRef = useRef<HiddenTarget[]>([])
  const scrollTargetsRef = useRef<ScrollTarget[]>([])
  const replacedTextRef = useRef<ReplacedText[]>([])

  const clearFlashTimer = () => {
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current)
      flashTimerRef.current = null
    }
  }

  const cancelCleanup = () => {
    if (cleanupRafRef.current !== null) {
      cancelAnimationFrame(cleanupRafRef.current)
      cleanupRafRef.current = null
    }
  }

  const removeOverlay = () => {
    if (overlayRef.current) {
      overlayRef.current.remove()
      overlayRef.current = null
    }
  }

  const restoreAll = useCallback(() => {
    cancelCleanup()
    clearFlashTimer()
    removeOverlay()

    replacedTextRef.current.forEach(({ originalText, chunk }) => {
      if (!chunk.isConnected) return
      chunk.replaceWith(originalText)
    })
    replacedTextRef.current = []

    hiddenTargetsRef.current.forEach(({ el, prevOpacity, prevVisibility }) => {
      if (!el.isConnected) return
      el.style.opacity = prevOpacity
      el.style.visibility = prevVisibility
    })
    hiddenTargetsRef.current = []

    scrollTargetsRef.current.forEach(({ el, prevOverflow, prevOverflowX, prevOverflowY }) => {
      if (!el.isConnected) return
      el.classList.remove("fragmenting-scrollbar-hidden")
      el.style.overflow = prevOverflow
      el.style.overflowX = prevOverflowX
      el.style.overflowY = prevOverflowY
    })
    scrollTargetsRef.current = []

    document.body.classList.remove(
      "fragmenting",
      "fragmenting-flash",
      "fragmenting-burst",
      "fragmenting-frozen",
    )

    signal.current = false
    phaseRef.current = "idle"
  }, [signal])

  useEffect(() => {
    return () => {
      restoreAll()
      setIsLocked(false)
    }
  }, [restoreAll])

  const trigger = useCallback((): boolean => {
    if (phaseRef.current !== "idle") return false

    const root = contentRef.current
    if (!root) return false

    phaseRef.current = "flash"
    signal.current = true
    setIsLocked(true)
    document.body.classList.add("fragmenting", "fragmenting-flash")

    const overlay = document.createElement("div")
    overlay.className = "fragmenting-flash-overlay"
    document.body.appendChild(overlay)
    overlayRef.current = overlay

    flashTimerRef.current = setTimeout(() => {
      flashTimerRef.current = null
      removeOverlay()
      document.body.classList.remove("fragmenting-flash")

      if (!root.isConnected) {
        restoreAll()
        return
      }

      phaseRef.current = "burst"
      document.body.classList.add("fragmenting-burst", "fragmenting-frozen")

      // Hide non-textual elements (icons, dividers) — keep style writes small.
      hiddenTargetsRef.current = Array.from(
        root.querySelectorAll<HTMLElement>("[data-fragment-keep='true']"),
      ).map((el) => ({
        el,
        prevOpacity: el.style.opacity,
        prevVisibility: el.style.visibility,
      }))
      hiddenTargetsRef.current.forEach(({ el }) => {
        el.style.opacity = "0"
        el.style.visibility = "hidden"
      })

      scrollTargetsRef.current = Array.from(
        root.querySelectorAll<HTMLElement>(".terminal-scrollbar"),
      ).map((el) => ({
        el,
        prevOverflow: el.style.overflow,
        prevOverflowX: el.style.overflowX,
        prevOverflowY: el.style.overflowY,
      }))
      scrollTargetsRef.current.forEach(({ el }) => {
        el.classList.add("fragmenting-scrollbar-hidden")
        el.style.overflow = "hidden"
        el.style.overflowX = "hidden"
        el.style.overflowY = "hidden"
      })

      // Collect text nodes up front (cheap pass, no DOM mutation yet).
      const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"])
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT
          if (skipTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT
          if (parent.closest("[data-fragment-ignore='true']")) return NodeFilter.FILTER_REJECT
          if (parent.closest("[data-fragment-keep='true']")) return NodeFilter.FILTER_REJECT
          if (parent.namespaceURI === "http://www.w3.org/2000/svg" || parent.closest("svg")) {
            return NodeFilter.FILTER_REJECT
          }
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        },
      })

      const textNodes: Text[] = []
      let cursor: Node | null
      while ((cursor = walker.nextNode())) {
        textNodes.push(cursor as Text)
      }

      // Process text nodes in small chunks across animation frames. With ~200
      // text nodes × ~10 letters each, doing them all in one tick blocks the
      // main thread for tens of ms; chunking keeps each frame under budget.
      const replacements: ReplacedText[] = []
      let i = 0
      const BATCH = 12

      const processBatch = () => {
        const end = Math.min(i + BATCH, textNodes.length)
        for (; i < end; i++) {
          const r = buildChunkForTextNode(textNodes[i])
          if (r) replacements.push(r)
        }
        if (i < textNodes.length) {
          cleanupRafRef.current = requestAnimationFrame(processBatch)
        } else {
          replacedTextRef.current = replacements
          phaseRef.current = "falling"
          // Wait for the longest letter animation (longest bucket) plus a buffer
          // to let the final letter's animationend fire its self-removal, then
          // tear everything down. We track via animationend on the chunk root
          // by counting remaining children with `data-fragment-*` class.
          scheduleFinalCleanup(root)
        }
      }

      const scheduleFinalCleanup = (rootEl: HTMLDivElement) => {
        // Use the longest bucket duration + a 120ms safety buffer.
        const maxDuration = Math.max(...BUCKETS.map((b) => b.duration)) + 120
        flashTimerRef.current = setTimeout(() => {
          flashTimerRef.current = null
          // Safety sweep: any letters still attached → remove.
          const stray = rootEl.querySelectorAll<HTMLElement>("[class^='fragment-letter-']")
          stray.forEach((el) => el.remove())
          phaseRef.current = "cleanup"
          restoreAll()
          setIsLocked(false)
        }, maxDuration)
      }

      cleanupRafRef.current = requestAnimationFrame(processBatch)
    }, FLASH_MS)

    return true
  }, [contentRef, restoreAll, signal])

  return { isLocked, trigger }
}


// Seeded RNG for deterministic fragment trajectories — exported alongside the hook.
export function fragmentMulberry32(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
