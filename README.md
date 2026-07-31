# Claudisthenics

A Lafay-style, level-gamified calisthenics program + companion PWA.

The program is an adaptation of the r/bodyweightfitness **Recommended Routine** (RR),
restructured into **levels you grind and unlock** (à la Méthode Lafay), with
low-rep harder-variant progressions instead of Lafay's high-rep endurance style.

## Repo layout

- `program/PROGRAM.md` — the full program as a human-readable document (review this first)
- `program/levels.json` — the same program as machine-readable data (the app consumes this)
- `viz/demo-pushup.html` — proof-of-concept of the exercise visualization approach
  (pose-interpolated stick figures). Open directly in a browser.
- `viz/level0-1.html` — full animated gallery of every Level 0 and Level 1 exercise
  (16 tiles, shared pose engine). Open directly in a browser.
- `app/` — the PWA (v0.1): workout runner (supersets, rest timers, wake lock, sound cues),
  inline exercise viz, local performance log, progress bars + graduation-day eligibility,
  export/import backup, type-RESET data wipe. Plain JS, no build step, no dependencies.
  Test locally: open `app/index.html` in a browser (or `python -m http.server` in `app/`
  for service-worker behavior).

## Design decisions (agreed)

- **PWA**, installable on iPhone home screen, offline-capable, screen wake-lock during timers
- **Local-only data** (localStorage/IndexedDB) with one-tap JSON export/backup
- Level unlock rule: all six movement tracks at top target range with clean form → unlock test → next level
- Level 0 is a deliberate re-entry block (tendon/habit rebuild), minimum 3 weeks, no skipping
- Parked for later: voice announcements, community/sharing layer

## Status

Program v0.2 (decisions locked). App v0.1 built, pending first hands-on review.
TODO: PNG apple-touch-icon (iOS ignores SVG icons on the home screen), GitHub Pages deploy.
