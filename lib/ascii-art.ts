/**
 * ASCII art assets and helpers for the terminal-styled UI.
 * No external deps — banner art is hand-embedded (figlet "ANSI Shadow").
 */

// "regis" — ANSI Shadow figlet, 6 rows. Rendered in a <pre>, aria-hidden.
export const REGIS_BANNER: string[] = [
  "██████╗ ███████╗ ██████╗ ██╗███████╗",
  "██╔══██╗██╔════╝██╔════╝ ██║██╔════╝",
  "██████╔╝█████╗  ██║  ███╗██║███████╗",
  "██╔══██╗██╔══╝  ██║   ██║██║╚════██║",
  "██║  ██║███████╗╚██████╔╝██║███████║",
  "╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝",
]

// Characters used for the scramble/decode reveal effect.
export const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#░▒▓█@%&"
