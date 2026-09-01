# GGW Connect — Creator Dashboard

The web dashboard for GGW Connect creators (spec §14). A **separate** project
from the Academy admin panel — it reuses ideas, not code. Creators sign in with
their **normal app accounts**, scoped to their own clubs, leagues, and events.
(The App Admin console — separate credential store + 2FA per spec §16 — is a
distinct surface and not part of this creator dashboard.)

## Stack
React 19 + Vite + TypeScript + Tailwind (navy + gold, matching the Flutter app).
Talks to the `golf-app-server-v2` backend.

## Setup
```bash
npm install
cp .env.example .env   # set VITE_API_URL to the backend
npm run dev
```

## Creator tools (spec §14) — all five complete

| # | Tool | What it does |
|---|---|---|
| 1 | **Tournament creation** | Event fields + the full side-games `ContestConfig` → `POST /tournament/create`, plus a tournaments list |
| 2 | **Tee-sheet builder** | Drag-and-drop board (native HTML5 DnD) over `GET /tee-sheet/find/:id` and `POST /tee-sheet/move-player`, with a generate fallback |
| 3 | **Sim board** | Bays-as-columns drag board against `/indoor/sessions` (assign-bay); session create/list |
| 4 | **Flight management** | Flight setup and assignment for indoor leagues |
| 5 | **Private-club member slots** | Pick a private club (`/club/my-club`), list/create slots — `POST /clubs/:id/slots` charges via Stripe, then issues a one-time code |

## Status

**Feature-complete for §14.** All five creator tools are implemented and wired
to the backend; `npm run build` and typecheck are clean.

Sim board required a backend endpoint that may still be local-only on some
checkouts — `GET /indoor/sessions` (commit `4fa90f5` in `golf-app-server-v2`).
If the sim board returns nothing, confirm that route exists on the API you are
pointed at.

## Related repositories

| Repo | Role |
|---|---|
| `Golf_tournament` | Flutter mobile app |
| `golf-app-server-v2` | Express + MongoDB API |
| **this repo** | React creator dashboard |

## Security note

Before building, check `postcss.config.js` — a clean one is **~81 bytes**. This
project family has carried a payload appended after the config's closing brace,
padded with spaces so it sits off-screen. Repo-wide check:

```bash
git ls-tree -r HEAD --name-only | while read f; do
  git show "HEAD:$f" | awk -v F="$f" 'length($0)>2000 {print "SUSPECT: " F; exit}'
done
```
