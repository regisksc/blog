import type { ReactNode } from "react"
import type { Section } from "../types"

export type CommandResult = { success: boolean; message?: string; node?: ReactNode }

/** Commands offered by Tab autocomplete (order = priority). */
export const TAB_COMPLETE_COMMANDS = [
  "about", "experience", "contact", "lab",
  "help", "clear", "matrix", "glitch", "dvd",
  "theme", "theme cycle", "stop", "light", "dark",
  "upside-down", "hawkins", "shatter", "reboot",
  "hire me", "secret",
] as const

/**
 * Section navigation table. Each key is a typed command; the value is the
 * section it prints into the scrollback. Canonical names first, then the
 * intuitive aliases we keep.
 */
export const sectionAliases: Record<string, Section> = {
  about: "about",
  me: "about",
  bio: "about",
  who: "about",
  whoami: "about",
  experience: "experience",
  xp: "experience",
  work: "experience",
  resume: "experience",
  projects: "experience",
  portfolio: "experience",
  builds: "experience",
  ls: "experience",
  contact: "contact",
  email: "contact",
  mail: "contact",
  hire: "contact",
  reach: "contact",
  github: "contact",
  linkedin: "contact",
  lab: "lab",
}

/**
 * Pure response commands — no React state or DOM side effects needed.
 * Maps command aliases to their response message.
 */
export const staticCommands: Record<string, string> = {
  coffee: "brewing... error 418: i'm a teapot",
  brew: "brewing... error 418: i'm a teapot",
  pwd: "~/code/regis/portfolio",
  cd: "home already. pick a command, not a directory.",
  "cd ..": "home already. pick a command, not a directory.",
  "cd ~": "home already. pick a command, not a directory.",
  "cd.": "home already. pick a command, not a directory.",
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
  ping: "pong?",
  pong: "ping!",
  weather: "forecast: 100% chance of another deploy.",
  man: "manual shortcut: type 'help'; no pager required.",
  make: "nothing to make here.",
  "make install": "nothing to make here.",
  sleep: "sleep scheduled after the next release.",
  zzz: "sleep scheduled after the next release.",
  money: "Direct. I like it. Type 'contact' and let's talk.",
  salary: "Direct. I like it. Type 'contact' and let's talk.",
  pay: "Direct. I like it. Type 'contact' and let's talk.",
  serverless: "the server is real; the invoice is abstract.",
  cloud: "someone else's computer, now with a big monthly bill.",
  ai: "hallucination is a feature now.",
  chatgpt: "confidently typing...",
  gpt: "next token, same deadline.",
  claude: "one more tool call, then we're done.",
  meow: "18 replies are being typed...",
  nyan: "2011 called; the rainbow trail is still loading.",
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
  music: "lo-fi beats to code to...",
  play: "lo-fi beats to code to...",
  theme: "try: theme green | amber | rose | cyan | violet | cycle",
  themes: "try: theme green | amber | rose | cyan | violet | cycle",
  colors: "try: theme green | amber | rose | cyan | violet | cycle",
  version: `portfolio v2.0.0 @ ${process.env.NEXT_PUBLIC_COMMIT_SHA ?? "dev"}`,
  "-v": `portfolio v2.0.0 @ ${process.env.NEXT_PUBLIC_COMMIT_SHA ?? "dev"}`,
  "--version": `portfolio v2.0.0 @ ${process.env.NEXT_PUBLIC_COMMIT_SHA ?? "dev"}`,
  "cat language": "nya~",
}

const greetingResponses = ["hey there!", "hello friend", "greetings, human", "sup!"]
const exitResponses = [
  "logout refused: this terminal still has things to show you.",
  "shell closed emotionally, not technically.",
  "nice try. The portfolio stays online.",
]
const fortuneResponses = [
  "boring code survives exciting incidents.",
  "if the test is hard to write, the interface is trying to tell you something.",
  "ship small, observe closely, fix the cause.",
  "a clean rollback is a feature.",
  "the fastest query is the one you never send.",
  "works in production beats works on my machine.",
]
const regisResponses = [
  "7 years of mobile, still googling regexes.",
  "Flutter, Swift, and a keyboard that confuses visitors.",
  "Tamer of merge conflicts, speaker of Flutter.",
  "One terminal, many apps, no refunds.",
]

export const randomResponses: Record<string, string[]> = {
  hello: greetingResponses,
  hi: greetingResponses,
  hey: greetingResponses,
  yo: greetingResponses,
  fortune: fortuneResponses,
  quote: fortuneResponses,
  exit: exitResponses,
  quit: exitResponses,
  q: exitResponses,
  ":q": exitResponses,
  ":q!": exitResponses,
  ":wq": exitResponses,
  regis: regisResponses,
}

export const SECRET_COMMANDS = [
  "money", "ai", "cat", "dog", "regis",
  "motherlode", "impulse 101", "hesoyam", "whosyourdaddy",
  "ea", "valve", "rockstar", "blizzard", "capcom",
  "nintendo", "konami", "bethesda", "microsoft",
] as const

export const eaResponses = [
  "EA Sports: it's in the game.",
  "EA Sports: it's in the game.",
  "The Sims is also good.",
]

export const gameCompanyResponses: Record<string, string> = {
  valve: "Half-Life 2, a revolutionary classic.",
  rockstar: "GTA San Andreas: ah shit, here we go again.",
  blizzard: "Warcraft III: work complete.",
  capcom: "Resident Evil: seven minutes is all I can spare to play with you.",
  nintendo: "Donkey Kong Country: minecarts, barrels, and banana hoards.",
  konami: "Silent Hill 2: in my restless dreams, I see that town.",
  bethesda: "Doom: rip and tear until it is done.",
  microsoft: "Age of Empires and Age of Mythology: wololo, then the occasional meteor.",
}

export const HELP_TEXT = [
  "about             who I am (aliases: who, bio, whoami)",
  "experience        selected work (aliases: xp, projects, portfolio, ls)",
  "contact           get in touch (aliases: email, reach, hire)",
  "lab               small canvas experiments",
  "theme <arg>       green | amber | rose | cyan | violet | cycle",
  "light / dark      switch color mode",
  "clear             clear the history",
  "matrix / glitch   temporary screen effects",
  "dvd / upside-down playful overlays",
  "shatter           one-shot fragment explosion",
  "hire me           contact details plus the DVD signal",
  "secret            reveal one hidden command not listed here",
  "",
  "Tab completes selected commands; plenty more reward guessing.",
].join("\n")// contact aliases
// ls alias added


// Matrix easter-egg command descriptor — surfaces trigger through terminal
// and dispatches via the run-command provider.
export const matrixCommand = {
  name: "matrix",
  description: "Toggle the matrix-rain easter egg.",
  category: "easter-egg" as const,
} as const


export const glitchCommand = {
  name: "glitch",
  description: "Trigger the glitch-banner easter egg.",
  category: "easter-egg" as const,
} as const


export const dvdCommand = {
  name: "dvd",
  description: "Trigger the DVD-overlay easter egg.",
  category: "easter-egg" as const,
} as const


export const shatterCommand = {
  name: "shatter",
  description: "Trigger the fragment-explosion easter egg.",
  category: "easter-egg" as const,
} as const


export const crashCommand = {
  name: "crash",
  description: "Alias of shatter — same fragment-explosion effect.",
  category: "easter-egg" as const,
  aliasOf: "shatter",
} as const


export const labCommand = {
  name: "lab",
  description: "Open the lab canvas experiments section.",
  category: "section" as const,
} as const


export const resumeCommand = {
  name: "resume",
  description: "Open the PDF resume window.",
  category: "section" as const,
  aliasOf: "pdf",
} as const


export const themeCommand = {
  name: "theme",
  description: "Cycle the theme palette (matrix / green / amber / blue).",
  category: "system" as const,
} as const


export const hireMeCommand = {
  name: "hire me",
  description: "Trigger the contact form prefill plus dvd easter-egg.",
  category: "easter-egg" as const,
} as const
