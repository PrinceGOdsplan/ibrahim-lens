## Context

`booking-ops` delivered full power; Studio UI presents too much at once. This change is presentation and IA only — same data, calmer rhythm.

## Goals / Non-Goals

**Goals:** Today queue; progressive booking detail; soft labels; quiet New booking; People secondary; Dashboard handoff into calm paths.  
**Non-Goals:** Public redesign, new booking statuses, removing finance/audit, deleting Deliveries/Feedback/Inbox, email/Paystack.

## Decisions

- **Default Clients tab:** `today` (new) when `?tab=` absent; deep links `bookings`, `deliveries`, etc. still work.
- **Tab order (suggested):** Today · Bookings · Deliveries · Feedback · (People / Inbox under “More” or trailing quieter tabs).
- **Today sections:** Needs a reply | Collect — row actions only.
- **Booking detail layers:** (1) identity + status actions (2) Payment section collapsed/toggle (3) Notes + History collapsed.
- **Copy map:** `needs_contact` → “Needs a reply”; payment line → “Paid ₦X of ₦Y”; avoid shouting enums.
- **Create:** “+ New booking” opens a panel/modal; remove always-on create block from main Bookings view.
- **Send gallery:** From confirmed booking detail, CTA linking to Deliveries with person/booking prefills when possible (light touch).

## Risks / Trade-offs

- Power users may want filters immediately — keep Bookings tab full-featured one click away.
- Hiding money too deep could slow fee entry — show Payment expanded by default when status is `confirmed` or when opened from Collect.

## Migration Plan

N/A (UI only).

## Open Questions

- None blocking — Inbox can remain a tab or nest under More; default keep tab but last.
