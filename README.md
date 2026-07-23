# portfolio-site

A terminal-inspired developer portfolio built with Next.js, React, and Tailwind v4.

## Getting Started

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

The catalog of exposed commands lives in `lib/commands/catalog.ts`.

## Terminal

The page behaves like a REPL. Type `help` to see what's available.


| about | who I am |
| experience | selected work |
| contact | get in touch |


## Easter eggs

The terminal accepts a few hidden commands that trigger page-level visual effects:

- `matrix` — toggle the matrix-rain easter egg (CJK + Greek + Cyrillic glyph rain).


## Effects

- `glitch` — RGB-shift banner overlay.
- `dvd` — bouncing DVD overlay.
- `shatter` / `crash` — fragment-explosion across the page.


## Lab

The terminal accepts `lab` to open the lab canvas experiments — gravity well and 3D black hole.


## Themes

The terminal accepts `theme` to cycle the accent palette (matrix / green / amber / blue).
