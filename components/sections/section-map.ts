import type { ComponentType } from "react"
import type { Section } from "@/lib/types"
import { AboutSection } from "./about"

export const SECTION_COMPONENTS: Record<string, ComponentType> = {
  about: AboutSection,
}
