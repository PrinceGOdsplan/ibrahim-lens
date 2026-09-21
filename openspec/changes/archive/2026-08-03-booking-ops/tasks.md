## 1. Data model

- [x] 1.1 Schema: `people`, `bookings`, `booking_events` + rules (public create path safe)
- [x] 1.2 API helpers: +234 phone normalize (strip trunk `0`), people match-by-phone, booking update-with-audit, NGN formatters
- [x] 1.3 Migrate existing booking `form_inquiries` into people/bookings best-effort

## 2. People + Booking Manager

- [x] 2.1 Clients → People: list/create/edit (name, +234 phone, optional email, notes) + booking history
- [x] 2.2 Clients → Bookings manager: filters by status / payment; detail with status, notes, schedule, Person
- [x] 2.3 Manual create booking; status select includes needs_contact, pending, confirmed, completed, declined, cancelled

## 3. Finance + audit + booking-only intake

- [x] 3.1 Fee + amount paid (NGN); derived unpaid/partial/paid; simple report strip
- [x] 3.2 Read-only booking history (audit events) on detail
- [x] 3.3 Public booking form: +234 prefix phone, name required; submit auto-creates Person + Booking `needs_contact`
- [x] 3.4 Remove public contact inquiry form + Website contact-fields intake builder; Contact page = globals display + booking only

## 4. Hub wiring

- [x] 4.1 Dashboard Needs you + pipelines use booking statuses / unpaid confirmed (no contact-form queue)
- [x] 4.2 Deliveries: pick Person (optional Booking); keep expiry/revoke behavior
- [x] 4.3 Inbox without public contact-kind intake; smoke empty + migrated data
