import { afterEach, describe, expect, it, vi } from "vitest"
import { getStaticResponse } from "./resolver"
import { resetGameCommandState, resetSecretCommandState } from "./session"
import { SECRET_COMMANDS, TAB_COMPLETE_COMMANDS } from "./catalog"

const messageFor = (command: string) => getStaticResponse(command)?.message

const exposedSecretCommands = (text: string) => {
  const words = text.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean)
  return SECRET_COMMANDS.filter((command) => {
    const commandWords = command.split(" ")
    return words.some((_, index) =>
      commandWords.every((word, offset) => words[index + offset] === word))
  })
}

const exactResponses: Record<string, string> = {
  cat: "I have 18 cats. Yes, eighteen.",
  dog: "I have 6 dogs. The house has opinions.",
  woof: "six dogs heard that. Response volume increasing.",
  bark: "six dogs heard that. Response volume increasing.",
  vim: "how do I exit this command?",
  nvim: "vim, but with a dotfiles budget.",
  neovim: "vim, but with a dotfiles budget.",
  emacs: "great editor. Weird operating system.",
  nano: "exits faster than you entered.",
  code: "83 extensions, 2GB of RAM, one window.",
  vscode: "83 extensions, 2GB of RAM, one window.",
  cursor: "tab tab tab — then I read the diff.",
  ai: "hallucination is a feature now.",
  chatgpt: "confidently typing...",
  gpt: "next token, same deadline.",
  claude: "one more tool call, then we're done.",
  meow: "18 replies are being typed...",
  cow: "wrong household: cats 18, dogs 6, cows 0.",
  cows: "wrong household: cats 18, dogs 6, cows 0.",
  "hello world": "print('hello, world!');",
  git: "On branch main, nothing to commit, working tree clean",
  "git status": "On branch main, nothing to commit, working tree clean",
  "git log": "a1b2c3d (HEAD -> main) feat: terminal easter eggs",
  "git branch": "* main",
  "git diff": "diff --git a/portfolio b/portfolio\n- nothing\n+ more easter eggs",
  "git switch": "Switched to branch 'main'",
  "git checkout": "error: pathspec 'checkout' did not match any files — try 'git switch'",
  "git push": "Everything up-to-date.",
  "git pull": "Already up to date.",
  "git commit": "[main a1b2c3d] feat: polish terminal jokes",
  "git blame": "a1b2c3d (Regis 2026-07-27) commands.ts:42 — that one's on me",
  motherlode: "+§50,000. The bills can wait.",
  "impulse 101": "HEV supplies granted. Crowbar not included.",
  hesoyam: "$250,000, full health, full armor. Grove Street approved.",
  whosyourdaddy: "god mode enabled. The Burning Legion objects.",
  valve: "Half-Life 2, a revolutionary classic.",
  rockstar: "GTA San Andreas: ah shit, here we go again.",
  blizzard: "Warcraft III: work complete.",
  capcom: "Resident Evil: seven minutes is all I can spare to play with you.",
  nintendo: "Donkey Kong Country: minecarts, barrels, and banana hoards.",
  konami: "Silent Hill 2: in my restless dreams, I see that town.",
  bethesda: "Doom: rip and tear until it is done.",
  microsoft: "Age of Empires and Age of Mythology: wololo, then the occasional meteor.",
}

afterEach(() => {
  vi.restoreAllMocks()
  resetGameCommandState()
  resetSecretCommandState()
})

describe("command discovery", () => {
  it("detects exposed multi-word secret commands without substring false positives", () => {
    expect(exposedSecretCommands("Try impulse 101, but ordinary mail remains visible."))
      .toEqual(["impulse 101"])
  })

  it("does not advertise removed commands", () => {
    const help = messageFor("help") ?? ""
    expect(help.split("\n").some((line) => line.startsWith("commands "))).toBe(false)
    expect(help.split(/\s+/)).not.toContain("party")
    expect(help).not.toContain("30+ hidden commands")
    expect(TAB_COMPLETE_COMMANDS).not.toContain("commands")
    expect(TAB_COMPLETE_COMMANDS).not.toContain("party")
    for (const command of SECRET_COMMANDS) {
      expect(TAB_COMPLETE_COMMANDS).not.toContain(command)
    }
  })

  it("advertises the secret discovery mechanism without exposing its pool", () => {
    const help = messageFor("help") ?? ""
    expect(help).toContain("secret")
    expect(help).toContain("hire me")
    expect(exposedSecretCommands(help)).toEqual([])
    expect(TAB_COMPLETE_COMMANDS).toEqual(expect.arrayContaining([
      "secret", "hire me",
    ]))
  })
})

describe("command inventory", () => {

  it.each(Object.entries(exactResponses))("returns personalized copy for %s", (command, message) => {
    expect(messageFor(command)).toBe(message)
  })

  it("keeps music text-only until playback gets its own plan", () => {
    expect(messageFor("music")).toBe("lo-fi beats to code to...")
    expect(messageFor("play")).toBe("lo-fi beats to code to...")
  })
})

describe("randomized responses", () => {
  it("uses the exit pool for every exit alias", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    for (const command of ["exit", "quit", "q", ":q", ":q!", ":wq"]) {
      expect(messageFor(command)).toBe("logout refused: this terminal still has things to show you.")
    }
  })

  it("uses the rewritten fortune pool", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    expect(messageFor("fortune")).toBe("boring code survives exciting incidents.")
    expect(messageFor("quote")).toBe("boring code survives exciting incidents.")
  })

  it("can consume a secret without exhausting the queue", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    expect(messageFor("secret")).toBe("money")
  })

  it("starts each test with a fresh secret queue", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    expect(messageFor("secret")).toBe("money")
  })

  it("reveals command names without repeating until the queue is exhausted", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    const revealed = Array.from({ length: SECRET_COMMANDS.length }, (_, index) =>
      messageFor(["secret", "secrets", "easter"][index % 3]),
    )

    expect(new Set(revealed)).toEqual(new Set(SECRET_COMMANDS))
    expect(revealed.every((command) => SECRET_COMMANDS.includes(command as typeof SECRET_COMMANDS[number]))).toBe(true)
  })

  it("avoids repeating the previous command when the queue refills", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    const firstQueue = Array.from({ length: SECRET_COMMANDS.length }, () => messageFor("secret"))
    const firstFromRefill = messageFor("secret")

    expect(firstFromRefill).not.toBe(firstQueue.at(-1))
  })

  it("uses the regis pool", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    expect(messageFor("regis")).toBe("7 years of mobile, still googling regexes.")
  })

  it("cycles EA between its slogan and The Sims", () => {
    expect(messageFor("ea")).toBe("EA Sports: it's in the game.")
    expect(messageFor("ea")).toBe("EA Sports: it's in the game.")
    expect(messageFor("ea")).toBe("The Sims is also good.")
    expect(messageFor("ea")).toBe("EA Sports: it's in the game.")
  })

  it("uses the rewritten uptime format", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    expect(messageFor("uptime")).toBe("session age: 0 days; still reviewing the diff.")
  })
})
// test new aliases
