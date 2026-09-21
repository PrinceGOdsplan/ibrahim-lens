## Context

Replace thin booking handling with People + Booking Manager + NGN finance + append-only audit. Nigerian market: **+234** phones, **NGN**. Public intake is **booking only** (no contact-message form). Supersedes `clients-workflow`.

## Goals / Non-Goals

**Goals:** People (name, +234 phone, optional email); auto-create booking on form submit (`needs_contact`); manual bookings; statuses including `pending` vs `needs_contact`; fee + amount paid (NGN); reports; immutable logs; remove public contact inquiry path; wire Dashboard + Deliveries.  
**Non-Goals:** Paystack/Flutterwave, multi-currency, email/Resend, availability calendars, share passwords, watermarks, full accounting, keeping a parallel “say hello” contact form.

## Decisions

- **Collections:** `people`, `bookings`, `booking_events`. Stop creating `form_inquiries` kind=`contact` from the public site. Booking submit writes Person + Booking (+ audit); optional lightweight inbox pointer is booking-linked only — **booking is canonical**.
- **Public IA:** Home/Contact booking forms only. Contact page may still show globals (email/phone/location text) but **no contact inquiry form**. Studio Website: drop or hide **contact fields** builder; keep **booking questions** (max 8).
- **Statuses:** `needs_contact` | `pending` | `confirmed` | `completed` | `declined` | `cancelled`. Web default = `needs_contact`.
- **Money:** `fee_ngn`, `amount_paid_ngn`; derived unpaid/partial/paid; format `en-NG` / ₦.
- **Phone UX (+234):**
  - UI shows a fixed prefix control **`+234`**; the editable segment is local subscriber digits only (placeholder e.g. `8012345678`).
  - On input/blur/submit: if the national part starts with `0`, strip that `0` (user typed trunk zero after country code).
  - Examples: prefix `+234` + `08031234567` → store/display `+2348031234567`; prefix + `8031234567` → `+2348031234567`.
  - Persist `phone_e164` / display `+234…` and `phone_digits` = digits only (`234803…`) for matching.
  - Same control in public booking form, People editor, and manual booking create.
- **Audit:** Single update helper; append-only `booking_events`.
- **IA:** Clients tabs: People, Bookings, Deliveries, Feedback, Inbox (feedback/delivery/booking signals — not contact forms).

## Bottlenecks & risks (watch these)

1. **Canonical booking vs inbox** — Don’t dual-write contact inquiries. **Mitigation:** remove public contact submit; Inbox deep-links to bookings when needed.
2. **+234 / leading zero** — Users habitually type `0` after country code. **Mitigation:** strip one leading `0` from the national part after `+234`; reject empty/short national numbers.
3. **Public create security** — Guests create people/bookings only via submit helper; no public list/update.
4. **Audit completeness** — One `updateBooking()` path only.
5. **Migrate old booking inquiries** — Best-effort Person + Booking; ignore or archive old `contact` inquiries.
6. **Amount paid > fee** — Allowed; treat as paid.
7. **Africa/Lagos** display vs UTC storage.
8. **Website builder** — Removing contact fields must not break existing globals contact *display* fields (email/phone/location strings stay).

## Migration Plan

1. Schema for `people`, `bookings`, `booking_events`.
2. Migrate `form_inquiries` kind=booking → bookings/people.
3. Remove public ContactInquiryForm; Website Contact editor → booking questions only.
4. Point Studio Bookings + Dashboard at `bookings`.

## Open Questions

- Soft-delete vs cancel-only? **Default:** no hard delete once money &gt; 0; use `cancelled` / `declined`.
- Keep Inbox tab at all if bookings own intake? **Default:** yes for feedback + delivery activity; booking rows optional deep-links.
