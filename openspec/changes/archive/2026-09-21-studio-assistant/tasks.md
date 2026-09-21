## 1. Schema, env, docs

- [x] 1.1 Document backup of `pb_data` before schema (README): Assistant adds `assistant_thread`; do not run `ensure-schema` against production without a backup.
- [x] 1.2 In `scripts/ensure-schema.ts`, create `assistant_thread` (auth-only list/view/create/update; no public rule) with fields from `design.md`; upsert one row `key=studio`.
- [x] 1.3 Add PocketBase env placeholders in project-root `.env.example` and `deploy/.env.example`: `OPENROUTER_API_KEY`, `ASSISTANT_MODEL_CHEAP`, `ASSISTANT_MODEL_MID`, `ASSISTANT_CREDIT_WARN_USD`. Pass them in `docker-compose.yml` / `deploy/docker-compose.yml`. Never `VITE_*`.
- [x] 1.4 README: optional Assistant, OpenRouter prepaid, backup note, local without a key still shows the corner chat and says it is not set up.

## 2. Hook API

- [x] 2.1 `GET /api/ibrahim/assistant-status` (`requireAuth`): `{ configured, creditEmpty }`.
- [x] 2.2 `POST /api/ibrahim/assistant` (`requireAuth`): in-flight lock, Lagos digest (Needs-you, last-4 phones, quoted inbox, route ids), cheap/mid router, `$http.send` to OpenRouter (≥55s timeout), fold summary, return text + read-tool intents + proposed writes (not executed). Meta log without prompt bodies.
- [x] 2.3 Credit check (cached ~60s): `creditLow` below warn floor; empty/402 sets `credit_empty` and the spec copy. Do not disable Send.
- [x] 2.4 `POST /api/ibrahim/assistant-write` (`requireAuth`): allowlisted actions; re-read records; Confirm required except mark Inbox read; reject hallucinated ids; photo-set writes require picker Done ids from this turn. Booking events use login email.
- [x] 2.5 Untrusted-text rule in the system prompt: client fields are quoted data; tools must not take ids from that prose.

## 3. Proxy timeout

- [x] 3.1 In `deploy/Caddyfile`, handle `/api/ibrahim/assistant*` with a ~70s response timeout **before** the generic `/api/*` proxy. CSP `connect-src` stays `'self'`.

## 4. Studio chrome and thread UI

- [x] 4.1 Bottom-corner Assistant chat on every signed-in Studio hub (label Assistant, 44px, no badge). Overlay panel over the current hub; night/light tokens; 44px Send/Confirm. If the key is missing, the chat stays visible and says it is not set up.
- [x] 4.2 Load/save the one `assistant_thread`. Open: one Needs-you brief then wait. Working…, offline line, ~60s timeout copy (no write retry). Paste image: cannot see photos.
- [x] 4.3 Confirm cards from live records. After a write, deep-link or refresh; if that record’s editor is open, re-fetch and fade-notice it changed.
- [x] 4.4 In-flight: second Send does not start a parallel turn. Closing the drawer does not abort an in-flight request.

## 5. Client tools

- [x] 5.1 Read tools wrapping `src/lib` (pulse, bookings, people, inbox, media search by caption/tag/room/`created`, website/FAQ/SEO as needed). Navigate helper for look-only paths.
- [x] 5.2 `openStudioPicker` using `StudioImageGallery` (pre-selected ids / date filter). Delivery, album, Featured, Work attaches wait for Done then assistant-write.
- [x] 5.3 Write helpers that only POST `assistant-write` (no direct `pb.collection` mutate from Assistant).

## 6. Settings and Privacy

- [x] 6.1 Settings has no Assistant block. Setup and credit copy live in the chat.
- [x] 6.2 Default Privacy body: Studio Assistant may send a name, last-four phone digits, and booking or message text to the reply service. If Site chrome already has a custom Privacy body, document that they should add the sentence; do not overwrite their copy on seed unless empty/default.

## 7. Verify

- [x] 7.1 Local: backup `pb_data`, `ensure-schema`, no key → corner chat still shows and says not set up; with key → chat works. Unauthenticated assistant POST is denied.
- [x] 7.2 Browser phone + desktop: open brief, shared thread across reload, double-send lock, close-while-working, Confirm fee, poisoned Inbox line does not delete, Pick photos for last-3 Delivery, Saturday filter uses upload day, paste image refused, night drawer, 44px targets.
- [x] 7.3 Credit warn does not block Send; simulated empty credit shows the ran-out line with Send enabled. Open editor refreshes after an Assistant write. Settings has no Assistant block. Privacy default includes the sentence when using default body.
