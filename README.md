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


## Commands

- `about`, `experience`, `projects`, `contact`, `lab` — sections
- `glitch`, `dvd`, `shatter`, `crash` — easter-eggs
- `theme` — cycle accent palette
- `resume` — open PDF
- `clear`, `help` — utilities


## Project Structure

```
app/         — Next.js app router
components/  — feature sections + effects + lab + terminal
hooks/       — easter eggs, fragment explosion, reduced motion
lib/         — command catalog, types, utils
public/      — static assets (icons, resume.pdf)
```


## Canvas Experiments

- **Gravity Well** — inverse-square particle solver
- **Black Hole** — raymarched accretion disk


## Status JSON

The terminal exposes a `status.json` reflecting the latest command output.


## Open Questions

None at this time — see `/docs/QA-FEATURE-GUIDE.md`.


## Easter Eggs Caveat

Easter eggs are intentionally subtle. They are not documented in the help text and only activate on the exact token.


## License

MIT — see [LICENSE](./LICENSE) (if present).


## Deploy

This site deploys to **https://regis.is-a.dev/** via GitHub Pages. The Actions workflow at `.github/workflows/deploy.yml` builds the static export, uploads the `out/` artifact, and runs `actions/deploy-pages` on every push to `main`.
