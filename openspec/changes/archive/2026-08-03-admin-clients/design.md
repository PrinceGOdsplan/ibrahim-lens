## Context

Deliveries replace Shares. Email sending is out of v1.

## Goals / Non-Goals

**Goals:** Deliveries with client name, 7-day expiry, downloads, feedback→testimonials, bookings, Inbox.  
**Non-Goals:** 24h post-download expiry, passwords, Resend, availability calendars, watermarks.

## Decisions

- Expiry: **created_at + 7 days only**
- Client **name required** (optional email field may be added for future notifications without using email in v1)
- Selection: images | album(s) | Work
- Work delivery ≡ album delivery UX

## Risks / Trade-offs

- Secret links without passwords rely on link secrecy + 7-day window

## Migration Plan

N/A

## Open Questions

- Optional client email field on Delivery for later notifications (recommended yes, unused in v1)
