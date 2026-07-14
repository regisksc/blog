import type { Section } from "../types"

export type CommandResult = { success: boolean; message?: string }

export const sectionAliases: Record<string, Section> = {
  about: "about",
  me: "about",
  bio: "about",
  who: "about",
  whoami: "about",
}

export const HELP_TEXT = [
  "about             who I am (aliases: who, bio, whoami)",
].join("\n")
