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

## Build order (spec §14 priority)
1. **Tournament creation** — done (event + full side-games ContestConfig)
2. **Tee-sheet builder** — next (drag-and-drop, monitor-sized)
3. Sim board
4. Flight management
5. Private-club member slots (last — gated on the per-member Stripe charge)

## Status
First reviewable version: creator login, navy/gold layout, tournaments list, and
the Create Tournament form wired to `POST /tournament/create`. Remaining tools
are routed placeholders.
