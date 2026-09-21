## Context

See proposal.md for why. Dashboard already has period control in `StudioHubHeader`, then earnings, Pulse, Coming up, and count stacks. Identity already exists on `users` (`name`, `avatar`) via `useAuth()`. `StudioLayout` and Settings each compute label, initials, and file URL independently.

## Goals / Non-Goals

**Goals:**
- One identity helper used by header, Settings, and Dashboard so name/photo cannot drift.
- Greeting sits in the desk scroll, first thing above earnings, without stealing the hub H1 or the period control.

**Non-Goals:**
- Time-of-day strings, weather, or a second profile editor on Dashboard.

## Decisions

### 1. Keep hub title “Dashboard”; greet in the pane
Period control stays in the header actions. The greeting is a compact row (photo or initials + name) at the top of `StudioScrollPane`.

**Alternatives considered:** Replace the H1 with the photographer’s name (rejected — every other hub keeps a product title; period would sit next to a person name). Put the greeting only in the app header (rejected — that control is already the profile menu).

### 2. Extract shared identity helpers
Move `profileLabel`, `initials`, and avatar URL (thumb size as argument) out of `StudioLayout` / Settings into something like `src/lib/studio-identity.ts`. Dashboard and the header call the same functions on `useAuth().user`.

**Alternatives considered:** Duplicate the three helpers on Dashboard (rejected — Settings already drifted on thumb size). Fetch a new profile record (rejected — auth store already has `name` and `avatar`).

### 3. Greeting is a link to Settings → Profile
`Link` to `/studio/settings?tab=profile`. First-run accounts with only an email can set a name and photo without hunting.

**Alternatives considered:** Display-only (rejected — no path to fix an empty profile from the desk). Open the header profile menu (rejected — that menu is logout / install, not Profile fields).

### 4. Photo when set; initials otherwise
Use `pb.files.getURL` with a 200×200 thumb (Settings already does). CSS circle + `object-cover`. No photo → same initials the header uses. Never render an `img` with an empty `src`.

**Alternatives considered:** Hide the mark entirely when no photo (rejected — the row looks empty; initials match the header). Time-of-day greeting (rejected — proposal non-goal).

## Risks / Trade-offs

- **Auth store stale after Profile save** → Settings already calls `refresh()`; greeting reads `useAuth()`. If a save skips refresh, header and desk stay equally stale.
- **Email as greeting is long on a 390-wide phone** → Truncate the label; photo/initials stay fixed size.

## Migration Plan

No schema or data migrate. Deploy the frontend. Rollback is revert of the identity helper + Dashboard row.

## Open Questions

None.
