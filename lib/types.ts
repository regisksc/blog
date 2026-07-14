export type Section = "about" | "experience" | "contact" | "lab"

export const THEMES = ["green", "amber", "rose", "cyan", "violet"] as const
export type Theme = (typeof THEMES)[number]
