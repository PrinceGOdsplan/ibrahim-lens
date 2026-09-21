## Context

See proposal.md for why. Today Contact mounts only `BookingSection`; `submitInquiry` exists and is unused; Inbox filters out `kind === 'contact'` while already knowing how to present it. Booking requests are `needs_contact` rows, listed in Inbox and redirected out of the Bookings hub. Home mounts a second copy of the booking form and hides header Book over the film hero.

No new PocketBase collection. Write uses `form_inquiries`. Book stays `people` + `bookings`. `openspec/config.yaml` Design still describes a Home booking block — this change revises that section so it matches the CTA-only Home.

## Goals / Non-Goals

**Goals:**

- One Contact page, two submits, two Inbox folders, one Accept door into Bookings.
- Intake URLs and People phone persist the way email already does.
- Public chrome that blocks booking (hidden Book, grain over the menu, silent Home failure) is repaired on the same pass.

**Non-Goals:**

- New architecture, new mailer, new collections, design-system rewrite. See proposal Non-goals.

## Decisions

### Write is a sibling form, not a CMS builder

Reuse `PhoneNgInput` (public tone), honeypot `company`, and `submitInquiry('contact', …)`. Fields are fixed: name, phone, message. Website Contact & booking gets an optional Write blurb textarea next to booking help — not a question list.

Alternative considered: a second question builder. Rejected — he will not configure it.

### Person upsert on Write, no Booking

Match booking’s phone upsert so Inbox can show a number and he can WhatsApp. Do not create `needs_contact`. No convert control.

Alternative considered: Write without a Person. Rejected — then the message is a name with no reachable phone in the directory.

### Booking requests stay bookings, not a second inquiry row

Do not also write `form_inquiries` `kind: booking`. Inbox Requests continues to use `unacceptedBookings`. Accept is still `status: pending` + navigate to `/studio/bookings?booking=`.

### Home Book navigates; it does not scroll

Remove `BookingSection` from Home. Hero and header Book (including film state) go to `/contact#booking`. Footer may include Write → `/contact#write`.

Alternative considered: keep a slim Home teaser form. Rejected — that is the duplicate that made Contact and Home the same page.

### Inbox folders: Requests | Messages

Replace (or hide) Messages / Activity / Everything as the primary switch. Default Inbox tab is Requests. Delivery events remain in the inquiries table if hooks still write them; do not surface them as the intake UI.

### Clients `setTab` merges params

`setParams({ tab })` today drops `person` / `booking` / `delivery`. Merge: keep existing keys, set `tab`, drop keys that only belong to the tab you left when they would point at the wrong surface (e.g. drop `feedback` when leaving Feedback). Wire `peopleFocusId` from `person` on load.

### Choice options live in FieldList

When type is `choice`, show a small options list (add/remove). On type change to choice, seed `['Option A', 'Option B']` if `options` is empty. Required is a checkbox per question.

### Grain z-index

Lower `.street-grain` below header/dialog (e.g. 10–20), keep dialogs at 50+. Do not invent a new overlay system.

### pb_hooks

Extend people-style trap/rate-limit to `form_inquiries` create if not already applied, so Write cannot spam Inbox. Same 8/10min class as booking is enough.

## Risks / Trade-offs

- [Home without a form feels longer to book] → Header Book is always visible; hero Book is one tap to Contact. Trade-off accepted to kill the duplicate.
- [Write + Book on one page still looks like two jobs] → Stack Write then Book; hashes separate them; Book is the brass control in the header.
- [Person from Write clutters People] → Same as booking intake; no extra CRM UI.
- [Hiding Activity hides download notices] → Email/push already cover client download; Inbox stays for humans writing in.

## Migration Plan

- Deploy frontend + hooks together. Existing `needs_contact` rows already live in Inbox. No data backfill.
- Optional Write blurb empty → a one-line default (“Name, phone, and a short note.”).
- Rollback: revert frontend; unused `contact` inquiries simply sit in PocketBase.

## Open Questions

None that block the specs. Write blurb copy default can be chosen at implement time.
