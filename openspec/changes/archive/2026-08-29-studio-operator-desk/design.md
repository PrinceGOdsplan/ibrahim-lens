## Context

See `proposal.md` for why. Today Dashboard is Needs you + Today (names and previews). Settings merges profile into Account with frozen login email and no avatar. Mail hooks exist but local Compose often misses `RESEND_API_KEY` (key only in `deploy/.env`); bodies are unbranded; client-downloaded and upload/portfolio email still exist; Write never notifies. `booking_events` already logs `money_changed` with before/after snapshots. PocketBase auth supports password reset and user file fields; Studio does not wire them.

## Goals / Non-Goals

**Goals:**

- Pulse Dashboard: money plane + count stacks + period presets; no privy roster.
- Period collected from `booking_events` payment deltas; period booked = fee first set / hub entry rule once.
- Profile vs Account; header photo; forgot-password on Sign in; login email change with current password.
- Mail: SMTP health, branded templates, Write inbound, drop downloaded + upload/portfolio email.
- Richer bell for booking / Write / feedback aligned with Inbox unread.

**Non-Goals:**

- Custom date ranges, charts, or accounting exports.
- Confirm-link email change flow.
- Digest mail or second photographer inbox.

## Decisions

### Dashboard composition over metric grid

One money panel (display-scale total earned; Collected / Booked for period; Outstanding line). Counts as two quiet rows of three stacks (Photos, Deliveries, Bookings | Requests, Messages, Feedback): lifetime digit + muted `+N`. Period as text segments `24h · 7d · 30d · All` in the greeting row. Persist `studio-desk-period` in `localStorage`.

**Alternatives considered:** Spreadsheet table (rejected). Restoring Needs-you list (rejected — privy).

### Period collected from money_changed events

Sum `max(0, after.amount_paid_ngn - before.amount_paid_ngn)` for `booking_events` with `type = money_changed` and `created` in window. Lifetime earned = sum `amount_paid_ngn` on hub bookings. Outstanding = existing `financeSummary` open books.

**Booked in period:** when a hub booking’s fee transitions from ≤0 to >0 in the window (from money_changed fee side), or a booking is accepted/created into the hub with fee already >0 in the window — count that fee once; later fee increases do not add to Booked (only to Collected if paid).

**Alternatives considered:** Filter bookings by `created` only (misses late payments). Full payment ledger table (overkill).

### Count lifetime + intake

Lifetime = current totals (media count, live deliveries, hub bookings, all-time requests/messages/feedback counts or waiting — use all-time created counts for Requests/Messages/Feedback lifetime, live for Deliveries). In-period = `created` within window. When period is All, hide `+N`.

### Identity

Ensure `users.avatar` file field via schema. Profile tab: name + avatar upload. Account: editable email + oldPassword, password change. After update call `pb.collection('users').authRefresh()`. Forgot password: `pb.collection('users').requestPasswordReset(email)` on Sign in; PocketBase mail templates / SMTP must be on. Document that reset emails use PocketBase auth mail path (same SMTP).

### Mail matrix and hooks

Photographer events: `booking`, `message` (Write / `form_inquiries` kind contact), `feedback`. Remove `upload` / `portfolio` from EMAIL path and Settings email columns (remove rows or keep In-app off by default without email checkbox — prefer remove self-action rows entirely). Remove `client_downloaded` toggle and hook send. Add Write notify on `form_inquiries` create kind contact. Shared branded HTML wrapper in hooks. `recordMailOk` sets `last_sent_at`. Settings shows SMTP ready + last error/sent. Fix README: root `.env` must carry `RESEND_API_KEY` for local Compose; keep deploy `.env` for VPS.

### Notices

Bell loads unread inbound from Inbox (booking needs_contact / contact unread / feedback unread) plus realtime append; dismiss marks inbox_read. Title + relative time + href.

## Risks / Trade-offs

- **[Risk] Booked fee rule edge cases** → Mitigation: document once-per-booking when fee becomes positive; no double count on fee edits.
- **[Risk] Password reset depends on SMTP** → Mitigation: Sign in shows mail unavailable when SMTP off.
- **[Risk] Local mail still broken if env not copied** → Mitigation: README + Settings health; optional docker-compose `env_file` note.
- **[Risk] Large `booking_events` scan** → Mitigation: one photographer, filter by created window; acceptable.

## Migration Plan

1. Backup `pb_data`.
2. Schema: ensure users avatar; migrate notice channels (drop upload/portfolio email defaults; drop client_downloaded UI).
3. Deploy hooks + Studio dist; recreate PocketBase if hooks mount needs it.
4. Set `RESEND_API_KEY` in the env file Compose actually reads.
5. Rollback: previous dist + hooks; new avatar field can sit unused.

## Open Questions

None that block specs or tasks.
