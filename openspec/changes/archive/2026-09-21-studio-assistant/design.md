## Context

See `proposal.md` for why. Studio is a React SPA on PocketBase: hubs call typed `src/lib/*` functions; `deploy/pb_hooks/main.pb.js` already exposes authenticated `/api/ibrahim/*` and uses `$http.send` (Web Push, 20s timeout). CSP `connect-src 'self'` forbids a browser call to OpenRouter. Collection rules and guest-write hardening stay; Assistant is photographer-session only. Photo picking already exists as `StudioImageGallery` (Pick photos). Media “date” in Library is PocketBase `created` (upload), not camera EXIF.

## Goals / Non-Goals

**Goals:**

- One hook-shaped Assistant: chat+tools via OpenRouter, writes only on authenticated hook actions, reads reused from `src/lib`.
- Same Compose graph (PocketBase + Caddy). Optional key like Resend/VAPID.
- Caddy/PocketBase timeouts long enough for one non-streaming turn (~60s) on the Assistant path only.

**Non-Goals:**

- Design-level: no sidecar LLM process, no streaming SSE, no vision payloads, no daily token governor in the hook (vendor credit is the cap).

## Decisions

### OpenRouter behind the hook, never `VITE_*`

PocketBase env: `OPENROUTER_API_KEY`, `ASSISTANT_MODEL_CHEAP` (default `google/gemini-2.5-flash-lite`), `ASSISTANT_MODEL_MID` (default `google/gemini-2.5-flash`), `ASSISTANT_CREDIT_WARN_USD` (default `1`). The SPA learns “configured” from a tiny authenticated `GET /api/ibrahim/assistant-status` (boolean key present, last empty-credit flag) — not from a public env flag.

**Alternatives considered:** Direct Gemini (cheaper, one family). Client-side OpenRouter (blocked by CSP, leaks the key).

### Hidden cheap vs mid router in the hook

Classify the user text + whether write/plan tools are likely: short status/lookup → cheap; plan, Confirm, or tool-using → mid. Sticky mid while the recent thread is a planning stretch. Never OpenRouter `:auto`, never Pro/Sonnet.

**Alternatives considered:** Single mid model always (simpler, slightly more spend). Vendor auto-router (surprise bills).

### Thread is one PocketBase row

Collection `assistant_thread`: `key` (unique, e.g. `studio`), `messages` (JSON array of photographer-visible turns, including Confirm cards), `summary` (fold text), `in_flight` (bool), `in_flight_at`, `credit_warned_at`, `credit_empty` (bool). Rules: authenticated list/view/update only; no public create. One row, seeded empty. Fold: when messages grow past ~12 model-visible turns, compress older ones into `summary`; keep full `messages` for the UI.

**Alternatives considered:** `localStorage` (phone ≠ laptop). One row per login (only one photographer now).

### Reads in the client; every write on the hook

Turn loop: client POSTs user text + `{ pathname, search }` to `POST /api/ibrahim/assistant` (`$apis.requireAuth()`). Hook builds digest (Needs-you, name + last-4 phones, quoted inbox snippets, current route ids), calls OpenRouter chat+tools, returns assistant text and **tool intents**. Client executes **read** tools via existing lib. For **writes**, client POSTs `POST /api/ibrahim/assistant-write` with `{ action, payload, confirm?: true }` — hook re-loads the record, enforces the Confirm list, then `$app.save`. Safe auto list in v1: **mark Inbox read only**. Confirm: fee, amount paid, delete person/booking/Delivery/media, Website/globals/published, gallery mail, test mail. Photo-set writes accept only ids that just came from Pick photos Done in that turn (pass the picker token / id list the client got from Done, not the model’s raw ids alone).

**Alternatives considered:** All tools in JSVM (duplicate `src/lib`). All tools in the client (stolen-tab deletes).

### Pick photos modal, Gallery hub only for looking

A client helper `openStudioPicker({ selectedIds, filter, max })` reuses `StudioImageGallery`. Navigate helper `openStudioPath(path)` for look-only. Date filters use Lagos calendar days against `media.created`.

**Alternatives considered:** Thumbs in the chat as the only confirm (weaker than the existing picker). Puppeteer the Gallery hub.

### In-flight lock on the thread row

Set `in_flight` at turn start; clear in `finally`. Second POST while in flight and `in_flight_at` younger than 90s → 409, client keeps Working. Stale lock → steal. Drawer close does not abort the HTTP call.

**Alternatives considered:** Cancel on navigate (orphaned writes). Allow parallel turns (double apply).

### Credit: warn, don’t disable Send

Before/after a turn, GET OpenRouter remaining credit (cache ~60s). Below floor → include `creditLow` once until dismissed or credit recovers. HTTP 402 / empty → set `credit_empty`, return the spec’d copy. Do not disable Send.

**Alternatives considered:** Daily turn cap (rejected in explore). Hide drawer at $0 (a stop).

### Timeouts and Caddy

`$http.send` timeout ≥ 55s on OpenRouter. Dedicated Caddy handle for `/api/ibrahim/assistant*` with `transport http { response_header_timeout 70s }` (or equivalent) **before** the generic `/api/*` proxy. Client abort at ~60s → timeout copy; no write retry.

### Untrusted text and digest

Wrap client-typed fields as quoted data in the system prompt. Tool arguments may not take `id` from those strings. Digest last-4 phones; full e164 only on a write that needs it. Lagos for “today” / Saturday.

### Logs and audit

Optional JSON `assistant_meta` on the thread or a capped list of `{ at, model, tools, ids, error }` — no prompt bodies. `booking_events.actor` remains the login email.

### Settings and Privacy

Settings has no Assistant block. Credit and setup copy live in the bottom-corner chat. Privacy default string in the legal seed/default body.

### Unsaved open forms

After a successful assistant-write for a record id that an open editor holds, that editor re-fetches and shows a fade notice that it changed (reuse existing fade-notice pattern).

## Risks / Trade-offs

- [Long wait, no stream] → Working… + 60s timeout; do not fake streaming through hooks.
- [Poisoned Inbox] → quoted data + Confirm re-read; never execute ids from client prose.
- [Wrong Saturday] → upload `created`, not EXIF; picker is the trim.
- [Prepaid $10 gone in a long mid-model night] → allowlist + fold; warn under ~$1; no our hard stop.
- [Hook/lib drift] → write actions are a short allowlist that call the same PocketBase fields as `src/lib`, documented next to each action.
- [Open editor clobber] → refresh + tell them; they can re-type.

## Migration Plan

1. Backup `pb_data`.
2. `ensure-schema` creates `assistant_thread` (auth rules, one seed row).
3. Mount env on PocketBase; Caddy timeout handle; restart PocketBase + Caddy.
4. Ship frontend with a bottom-corner Assistant chat on every signed-in Studio hub.
5. Update Privacy default; if Site chrome already overrode Privacy, leave their body and document that they should add the sentence.

Rollback: unset `OPENROUTER_API_KEY`, redeploy — chat stays visible and says it is not set up. Collection can remain. Caddy handle is harmless unused.

## Open Questions

- Exact OpenRouter model slugs will move; keep them in env, not in specs.
