## Why

The public site has correct routes and CMS wiring but reads as a quiet CMS page with luxury tokens — not a modern artistic gallery. Home is the quality bar; without an asymmetric atelier craft language (mixed scales, overlaps, Selected strips, immersion), Portfolio, Work, About, Contact, and Deliveries will never feel intentional.

## What Changes

- Rework public visual system toward **asymmetric atelier**: deep ink ground, cool ivory type, muted steel / soft-white accent (champagne gold de-emphasized), editorial type, intentional motion
- **Home as bar**: first viewport = brand + one line + Book only + one dominant featured plane (full-bleed or controlled overlap); extra Portfolio featured picks become a horizontal **Selected** strip below — not a hero tile collage
- Public chrome: film-thin / transparent nav over hero; **dedicated mobile menu**; remove bordered card grids on marketing sections
- Portfolio & Work: uneven image rhythm + **immersive open** (lightbox/cinema)
- About & Contact & booking: editorial layouts aligned with Home language
- Delivery (`/g/:token`): same public craft language (quiet countdown, gallery immersion) — not Studio chrome
- Token / CSS updates in the public theme; Studio light tool UI unchanged

## Non-goals

- Studio hub redesign or shadcn restyle
- New PocketBase collections or booking-ops data model work
- Watermarks, share passwords, email/Resend
- Purple glow, glassmorphism, busy decorative gradients
- Changing public IA (nav labels / routes stay)

## Capabilities

### New Capabilities
- `public-atelier`: Shared public craft system — tokens, film nav + mobile menu, motion vocabulary, immersive image open, anti-card editorial patterns reused across public surfaces

### Modified Capabilities
- `public-home`: Asymmetric atelier first viewport; Selected strip; editorial below-fold sections; Book-only primary CTA in hero
- `public-portfolio`: Uneven rhythm + immersive open; craft aligned with Home bar
- `public-work`: Cover / detail presentation as artistic planes (not equal card grid)
- `public-about`: Photo + short narrative rhythm (not plain text dump alone)
- `public-contact`: Editorial contact + booking presentation (non-card)
- `client-gallery`: Tokenized `/g/:token` gallery inherits atelier language (visual/UX only; expiry/download rules unchanged)
- `app-shell`: Public film-thin nav over hero surfaces + dedicated mobile menu; Studio shell unchanged

## Impact

- Frontend: `src/index.css` tokens; `PublicLayout`; public pages (`Home`, Portfolio, Work, About, Contact, Delivery); shared public components (booking form chrome, lightbox)
- Studio Website CMS data model for featured picks unchanged (still Portfolio-sourced); presentation changes only
- No backend schema change required for craft-only work
- Parallel to `booking-ops` (ops data) — this change owns public visual/UX craft
