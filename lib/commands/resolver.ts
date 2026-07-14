import { sectionAliases } from "./catalog"
import type { CommandResult } from "./catalog"

export function getStaticResponse(command: string): CommandResult | null {
  if (sectionAliases[command]) {
    return { success: true }
  }
  return null
}
