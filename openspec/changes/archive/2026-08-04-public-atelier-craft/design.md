## Context

See proposal.md — Why. Public pages and `PublicLayout` already ship with charcoal/ivory/champagne tokens and inset CMS layouts. Studio remains a light shadcn tool UI and is out of craft scope. CMS featured picks and Portfolio membership stay as data sources; this change is presentation and interaction craft only. Parallel to `booking-ops` (data/ops).

## Goals / Non-Goals

**Goals:**
- Establish reusable public atelier primitives (tokens, nav/mobile, motion, lightbox, editorial section patterns)
- Make Home the quality bar; cascade language to Portfolio, Work, About, Contact, Delivery
- Keep CMS contracts (featured from Portfolio, booking scroll target) while changing layout composition

**Non-Goals:**
- Studio restyle; new PocketBase collections; booking-ops schema; watermarks; email

## Decisions

1. **Tokens first in CSS `@theme`**  
   Cooler ink ground, cool ivory, muted steel / soft white accent; deprecate champagne as the primary accent (may remain as unused legacy var briefly).  
   *Alt considered:* keep champagne — rejected; fights “photos carry color” and reads as generic luxury kit.

2. **Home composition**  
   Full-bleed (or overlapping) hero using first `home_featured` image; brand + line + Book overlaid or beside with controlled asymmetry; remaining featured → horizontal Selected strip (`overflow-x` scroll, mixed widths). Remove “View portfolio” from hero CTA group.  
   *Alt:* split 50/50 stage — rejected as less atelier; may use slight type/image overlap instead.

3. **Shared `ImageImmersive` (lightbox)**  
   One public component for Portfolio, Work detail, Delivery: focus trap, Esc/close, prev/next, no watermark. Prefer CSS + React state over a heavy gallery library unless a11y proves painful.  
   *Alt:* per-page custom modals — rejected for drift.

4. **Motion**  
   CSS/`@media (prefers-reduced-motion: reduce)` gated: hero image slow scale or fade, brand settle, Selected strip optional scroll-snap. No Framer dependency required for v1 of this change.  
   *Alt:* Framer Motion everywhere — deferred unless CSS is insufficient.

5. **Nav**  
   `PublicLayout`: transparent/film header on Home (and optionally other full-bleed tops); solid/minimal elsewhere; hamburger + panel on small breakpoints.  
   *Alt:* always-solid bar — rejected for hero brand test.

6. **Editorial sections**  
   Services as stacked or horizontal editorial rows; testimonials as large quotes without boxes; booking form without bordered card wrapper (hairlines / spacing).

7. **About imagery**  
   Prefer an optional globals/brand image if already available; if none, strong typographic about is acceptable for v1 of this change (no new CMS field required unless already present).

8. **Studio untouched**  
   Studio tokens and layouts stay; do not “atelier” the tool UI.

## Risks / Trade-offs

- **[Risk] Overlay type contrast on bright photos** → Mitigation: scrim / gradient veil behind brand+CTA; photographer guidance that hero picks work dark-to-mid.
- **[Risk] Lightbox a11y** → Mitigation: focus trap, Esc, aria-modal, reduced-motion stills.
- **[Risk] Horizontal Selected on mobile** → Mitigation: scroll-snap + peek of next image; avoid tiny unusable thumbs.
- **[Risk] Scope creep into booking-ops UI copy** → Mitigation: craft-only; do not change intake data paths here.
- **[Trade-off] Uneven grids harder than equal columns** → Accept; Home bar demands it.

## Migration Plan

1. Update CSS tokens and PublicLayout (nav/mobile).
2. Rebuild Home (hero + Selected + editorial below).
3. Add immersive open; wire Portfolio / Work / Delivery.
4. Restyle About, Contact/booking chrome.
5. Visual smoke on desktop + mobile; verify `prefers-reduced-motion`.
6. No DB migration.

## Open Questions

- Exact display typeface keep (Cormorant) vs sharper contemporary pair — **default:** keep Cormorant for brand continuity; body Figtree stays.
- Whether Contact inquiry form remains during `booking-ops` — **out of scope here**; craft whichever forms are present.
