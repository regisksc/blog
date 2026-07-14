import {
  eaResponses,
  gameCompanyResponses,
  HELP_TEXT,
  randomResponses,
  staticCommands,
} from "./catalog"
import {
  nextEaResponseIndex,
  pickRandom,
  popSecretCommand,
} from "./session"
import type { CommandResult } from "./catalog"

/**
 * Table-driven resolver for commands that need no React state or DOM side
 * effects. Checked in order: fixed text → random text → computed. Returns
 * `null` when the command must be handled by the component (stateful/effect).
 */
export function getStaticResponse(command: string): CommandResult | null {
  if (staticCommands[command]) {
    return { success: true, message: staticCommands[command] }
  }

  if (randomResponses[command]) {
    return { success: true, message: pickRandom(randomResponses[command]) }
  }

  switch (command) {
    case "date":
    case "now":
      return {
        success: true,
        message: new Date().toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        }),
      }
    case "time":
      return { success: true, message: new Date().toLocaleTimeString() }
    case "uptime":
      return {
        success: true,
        message: `session age: ${Math.floor(Math.random() * 365)} days; still reviewing the diff.`,
      }
    case "help":
    case "?":
      return { success: true, message: HELP_TEXT }
    case "secret":
    case "secrets":
    case "easter":
      return { success: true, message: popSecretCommand() }
    case "ea":
      return {
        success: true,
        message: eaResponses[nextEaResponseIndex() % eaResponses.length],
      }
    case "valve":
    case "rockstar":
    case "blizzard":
    case "capcom":
    case "nintendo":
    case "konami":
    case "bethesda":
    case "microsoft":
      return { success: true, message: gameCompanyResponses[command] }
    default:
      return null
  }
}