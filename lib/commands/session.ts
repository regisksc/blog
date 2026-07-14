import { SECRET_COMMANDS } from "./catalog"

/** Mutable module-scope state for command-driven sessions. Kept private so
 *  tests must use the exported reset helpers. */

let secretQueue: string[] = []
let lastSecretCommand: string | null = null

export function resetSecretCommandState(): void {
  secretQueue = []
  lastSecretCommand = null
}

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function popSecretCommand(): string {
  if (secretQueue.length === 0) {
    secretQueue = shuffle(SECRET_COMMANDS)
    if (secretQueue.at(-1) === lastSecretCommand && secretQueue.length > 1) {
      ;[secretQueue[0], secretQueue[secretQueue.length - 1]] = [
        secretQueue[secretQueue.length - 1],
        secretQueue[0],
      ]
    }
  }

  const command = secretQueue.pop()!
  lastSecretCommand = command
  return command
}

let eaCallCount = 0

export function resetGameCommandState(): void {
  eaCallCount = 0
}

export function nextEaResponseIndex(): number {
  const i = eaCallCount
  eaCallCount += 1
  return i
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}