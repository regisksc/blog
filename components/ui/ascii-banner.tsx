"use client"

import { REGIS_BANNER } from "@/lib/ascii-art"
import { GlitchBanner } from "@/components/effects/glitch-banner"

/**
 * The "regis" figlet banner — a preset of the generic GlitchBanner.
 * Kept as a named component so the whoami hero reads intent-first.
 */
export function AsciiBanner() {
  return (
    <GlitchBanner
      lines={REGIS_BANNER}
      label="regis"
      fallbackAs="h1"
      className="text-[7px] min-[440px]:text-[9px] sm:text-xs md:text-sm"
    />
  )
}
