import type { ComponentType } from "react"
import type { Section } from "@/lib/types"
import { AboutSection } from "./about"
import { ExperienceSection } from "./experience"
import { ContactSection } from "./contact"
import { LabSection } from "../lab/lab"

export const SECTION_COMPONENTS: Record<Section, ComponentType> = {
  about: AboutSection,
  experience: ExperienceSection,
  contact: ContactSection,
  lab: LabSection,
}