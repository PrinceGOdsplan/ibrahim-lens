## Context

PocketBase JSVM serializes each handler and runs it in an isolated program. Top-level `function` declarations in `*.pb.js` are invisible inside `routerAdd` / `onRecord*` / `cronAdd`. Live diag confirmed `sendMail`, `notifyPhotographerEvent`, `vapidPublicKey`, etc. are all `undefined` in route handlers. Share helpers already moved to `ibrahim_utils.js` for OG; notify paths still call outer helpers.

## Goals / Non-Goals

**Goals:**
- Email + Mobile push from Send test and public booking / Write / feedback hooks work again
- Feedback inbox row creation no longer aborts when `siteUrl` is missing from handler scope
- VAPID public key route and push send use requireable modules

**Non-Goals:**
- Redesign notice Settings UI
- Change channel defaults or Resend/VAPID secrets
- Rewrite Assistant notify tooling beyond shared helpers

## Decisions

1. **CommonJS modules under `pb_hooks/`** — `ece.js`, `vapid_push.js`, expanded `ibrahim_utils.js`. Handlers `require(\`${__hooks}/…\`)` at the start of the callback (PocketBase-documented workaround).
2. **Keep thin `00_ece.pb.js` / `00_vapid.pb.js`** — stubs only so filename sort stays stable; real code lives in `.js` modules.
3. **In-app** — remains client realtime on bookings / form_inquiries. Fixing hooks restores feedback→inbox writes that were swallowed when `siteUrl()` threw before inbox insert.

## Risks / Trade-offs

- Shared module registry: mutate carefully (guest rate-limit map lives in the module on purpose).
- Large hook file edits — deploy hooks only; no SPA rebuild required for mail restore.
- Resend on port 587 needs `smtp.tls = false` (STARTTLS). `tls = true` caused immediate TLS dial failures.
- If `VAPID_PUBLIC_KEY` was missing while the SPA was built with a different pair, Mobile needs a fresh Allow after the matching public is served from `/api/ibrahim/vapid-public` (derived from private when env public is empty). Stale `push_subscriptions` should be cleared once.
