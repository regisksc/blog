# Handoff: Deploy blog to GitHub Pages via regis.isroot.in (HTTPS cert pending)

## Session Metadata
- Created: 2026-08-03 20:14:21
- Project: /Users/regiskian/Git/sideprojects/blog
- Branch: main
- Session duration: ~2.5 hours (continuation of prior deploy session)

### Recent Commits (for context)
  - 47bb345 content: title uses Sr. Mobile Engineer (Itau stays Staff)
  - 29b3840 chore: switch cname to regis.isroot.in
  - e52c849 revert: remove basePath (site serves at root via custom domain)
  - 6d8c02a fix: add basePath /blog for github pages subpath
  - 3cd2be6 ci: grant pages write permission at workflow level

## Handoff Chain

- **Continues from**: [2026-08-03-175313-deploy-regis-is-a-dev.md](./2026-08-03-175313-deploy-regis-is-a-dev.md)
  - Previous title: Deploy regis.is-a.dev via GitHub Pages
- **Supersedes**: None (previous handoff's is-a.dev plan was replaced — user chose isroot.in instead)

> Review the previous handoff for full context before filling this one. NOTE: previous handoff targeted `regis.is-a.dev`; that was abandoned. The live domain is now `regis.isroot.in`.

## Current State Summary

The blog (terminal-style portfolio, Next.js static export) is DEPLOYED and LIVE at **http://regis.isroot.in/** — verified via cloakbrowser (HTTP 200, title "Regis Kian — Sr. Mobile Engineer", portfolio root renders, no console errors). The GitHub Pages custom domain is bound and healthy. The ONLY remaining item is HTTPS: GitHub has not yet issued the Let's Encrypt certificate, so browsers show "insecure" / incognito shows "does not support HTTPS". This is NOT a misconfiguration — GitHub's own health API reports `is_https_eligible: true` and `reason: null`. Cert issuance is async (GitHub-side, typically 15min–1h, up to 24h). A background cron loop (20-min cadence) is armed to auto-enable HTTPS enforcement the moment the cert lands, verify via cloakbrowser, and stop.

## Codebase Understanding

### Architecture Overview

- Next.js 16.2.0 + React 19 + Tailwind v4, terminal-portfolio (portfolio-site derivative)
- `output: 'export'` in next.config.mjs → static build to `out/`, served by GitHub Pages
- **NO basePath** — site serves at domain root via custom domain (basePath '/blog' was tried then reverted; only needed if serving at github.io/blog/ subpath, which the custom domain bypasses)
- Repo: `regisksc/blog`, PUBLIC, build_type=workflow
- Deploy workflow: `.github/workflows/deploy.yml` (build job npm ci + npm run build → upload artifact; deploy job → deploy-pages). Has `enablement: true` on configure-pages and workflow-level `pages: write` + `id-token: write` permissions.

### Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `public/CNAME` | Contains `regis.isroot.in` | Binds custom domain; committed and deployed |
| `next.config.mjs` | `output: 'export'`, NO basePath | Root-served static export |
| `.github/workflows/deploy.yml` | Pages build+deploy | Working; all runs green |
| `app/layout.tsx` | Metadata title | "Sr. Mobile Engineer" (line 16, 18) |
| `components/sections/experience.tsx` | Job roles | Jahnel=Sr., Itaú=Staff (intentional) |
| `/tmp/check-site.js` | cloakbrowser verification script | Run from blog dir for local playwright resolution |

### Key Patterns Discovered

- **cloakbrowser is the ONLY trustworthy live-check.** curl gave false 200s (edge cache + ignored cert errors); real browser exposed the actual 404 and cert failure. Always verify deploys with cloakbrowser, never curl alone.
- cloakbrowser binary: `/Users/regiskian/.cloakbrowser/chromium-145.0.7632.109.2/Chromium.app/Contents/MacOS/Chromium`, driven via Playwright. Script must run from a dir with `playwright` in node_modules (blog dir has it) — copy /tmp/check-site.js to blog dir as `_check-site.js`, run, then rm.
- Every commit authored as `regisksc <41172158+regisksc@users.noreply.github.com>` (set GIT_AUTHOR_NAME/EMAIL inline per bash call — env doesn't persist across tool calls).

## Work Completed

### Tasks Finished

- [x] Scrubbed ALL "simone" attribution traces + entire `removedCommands` array (leaked prior command history) from all 292 commits via `git filter-branch --tree-filter`, force-pushed
- [x] Made repo `regisksc/blog` PUBLIC
- [x] Fixed deploy workflow (enablement + pages:write permission)
- [x] Enabled GitHub Pages (gh api POST /pages)
- [x] Switched CNAME is-a.dev → isroot.in
- [x] Diagnosed + fixed the `/blog/` subpath asset-404 bug (added then reverted basePath once custom domain chosen)
- [x] Set custom domain via gh api; triggered rebuild that bound it (status went from serving 404 → 200)
- [x] Changed metadata title Staff → Sr. Mobile Engineer; Jahnel role → Sr.; Itaú role kept Staff (user's actual title)
- [x] Ran GitHub Pages health check — confirmed domain valid + HTTPS-eligible
- [x] Ruled out all cert blockers (CAA, DNSSEC, AAAA, proxy, wrong DNS)
- [x] Armed cron loop to auto-enable HTTPS when cert issues

### Files Modified

| File | Changes | Rationale |
|------|---------|-----------|
| app/globals.css | Removed "simone's defaults" comment (all commits) | Scrub attribution trace |
| lib/commands/commands.test.ts | Removed removedCommands array + its test (all commits) | Leaked prior command history |
| public/CNAME | regis.is-a.dev → regis.isroot.in | User chose isroot.in |
| next.config.mjs | Added then removed basePath '/blog' | Custom domain serves at root |
| app/layout.tsx | Staff → Sr. Mobile Engineer (title + description) | User correction |
| components/sections/experience.tsx | Jahnel role → Sr.; Itaú stays Staff | User: Itaú was genuinely Staff |
| next-env.d.ts | Uncommitted local churn (Next.js regen) | Harmless; can be discarded |

### Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| Domain = regis.isroot.in | is-a.dev (PR-based), isroot.in (web dashboard), rename repo to regisksc.github.io | User registered isroot.in; simpler than is-a.dev PR |
| Scrub history destructively | Keep + add attribution, vs remove from history | User: "should never have been there" — filter-branch + force push |
| Single A record acceptable | Add all 4 GitHub IPs vs one | isroot.in UI replaces record on add (only 1 possible at apex); health check confirms single record is is_valid + https_eligible |
| No basePath | basePath '/blog' vs none | Custom domain serves at root; basePath would break asset paths |

## Pending Work

## Immediate Next Steps

1. **Wait for GitHub to issue the Let's Encrypt cert** (async). Poll: `echo | openssl s_client -connect regis.isroot.in:443 -servername regis.isroot.in 2>/dev/null | openssl x509 -noout -subject` — currently returns `CN=*.github.io`; when it returns `CN=regis.isroot.in`, cert is issued.
2. **Enable HTTPS enforcement** once cert exists: `gh api repos/regisksc/blog/pages -X PUT -f cname='regis.isroot.in' -F https_enforced=true` (currently returns "certificate does not exist yet").
3. **Verify HTTPS with cloakbrowser**: cp /tmp/check-site.js → blog/_check-site.js, `node _check-site.js https://regis.isroot.in/`, confirm 200 + no cert error, then rm.

### Blockers/Open Questions

- [ ] GitHub Let's Encrypt cert issuance pending (GitHub-side, no user action possible). Only a blocker if >24h — then contact GitHub Support.

### Deferred Items

- HTTPS enforcement toggle — deferred until cert issues (auto-handled by cron loop)
- `next-env.d.ts` uncommitted change — harmless, left as-is

## Context for Resuming Agent

## Important Context

**The site works. Do NOT re-diagnose from scratch.** Every deployment/DNS/config axis has been verified correct via GitHub's own `gh api repos/regisksc/blog/pages/health`:
- `dns_resolves: true`, `is_pointed_to_github_pages_ip: true`, `is_served_by_pages: true`, `is_valid: true`, `reason: null`, `is_https_eligible: true`
- Current `https_error: "peer_failed_verification"` = cert not issued YET (normal pre-issuance state)

There is a **cron loop armed** (kind=loop, 1200s/20min) that polls the cert and auto-enables HTTPS + verifies + stops when it lands. If resuming and HTTPS is already on, the loop already did its job. Check `cron list` and `gh api repos/regisksc/blog/pages` (look for https_enforced:true, cname:regis.isroot.in).

### Assumptions Made

- Single A record (185.199.109.153) is sufficient — confirmed by health API is_valid:true. (GitHub recommends all 4 for redundancy but isroot.in UI only allows one at apex.)
- www.regis.isroot.in InvalidDNSError in health check is IRRELEVANT — user doesn't need www.
- Cert will issue within 24h without further action.

### Potential Gotchas

- **NEVER trust curl for live verification** — it gave false 200s all session (edge cache + `-k` masking cert errors). ONLY cloakbrowser reflects real browser behavior.
- `/tmp/check-site.js` needs `playwright` module — run copy from within blog dir (has node_modules), not /tmp.
- isroot.in DNS dashboard REPLACES a record when you "add" another at the same name/@ — can't hold multiple A records. Don't expect 4 records to stick.
- The domain is the apex of its OWN zone (has SOA + NS ns1/ns2.nevercode.in) — unusual but health check confirms handled OK (is_apex_domain:true, is_valid:true).
- `regisksc.github.io/blog/` now 301-redirects to the custom domain — that's EXPECTED GitHub behavior once custom domain set, not a bug.

## Environment State

### Tools/Services Used

- **cloakbrowser** — Chromium 145.0.7632.109.2 at ~/.cloakbrowser/, driven via Playwright. Only reliable live-check.
- **gh CLI** — authenticated as regisksc; used for Pages API (`gh api repos/regisksc/blog/pages`), workflow runs, repo edit.
- **isroot.in dashboard** (web) — DNS management (beta). Nameservers ns1/ns2.nevercode.in. Single A record → 185.199.109.153.
- **git filter-branch** — used for history scrub (already done, don't repeat).

### Active Processes

- **Cron loop** (session-scoped, kind=loop, 20-min cadence): polls cert for regis.isroot.in, auto-enables HTTPS + verifies + stops when CN=regis.isroot.in appears. Dies with session — if session ends before cert issues, manually do Immediate Next Steps 1-3.

### Environment Variables

- `GIT_AUTHOR_NAME` = regisksc (set inline per commit)
- `GIT_AUTHOR_EMAIL` = 41172158+regisksc@users.noreply.github.com (set inline per commit)

## Related Resources

- **Live site**: http://regis.isroot.in/ (HTTPS pending)
- **Repo**: https://github.com/regisksc/blog (public)
- **Pages API**: `gh api repos/regisksc/blog/pages` and `.../pages/health`
- **Cert poll cmd**: `echo | openssl s_client -connect regis.isroot.in:443 -servername regis.isroot.in 2>/dev/null | openssl x509 -noout -subject`
- **HTTPS enable cmd**: `gh api repos/regisksc/blog/pages -X PUT -f cname='regis.isroot.in' -F https_enforced=true`
- **cloakbrowser check**: `/tmp/check-site.js` (copy to blog dir to run)
- **Session notes**: /Users/regiskian/.local/share/mimocode/memory/sessions/ses_03693f802ffesaQVbmCKDmxwQM/notes.md
- **Previous handoff**: ./2026-08-03-175313-deploy-regis-is-a-dev.md

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
