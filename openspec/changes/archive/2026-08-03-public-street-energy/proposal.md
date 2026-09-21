## Why

The public site already runs bold/dark and identity-correct (Portraits · Fashion · Lifestyle), but the hero still mixes WhatsApp into the primary CTA row, Contact still stacks details and a leftover inquiry form above booking, demo media is generic stock, and the chrome still feels flat. Visitors need a photo-first street/party intensity that stays professional — and realistic images for local feedback.

## What Changes

- Hero CTAs: **Book** + **Portfolio** (`/portfolio`) only — no WhatsApp on the hero
- WhatsApp: **footer** and **Contact** only — secondary path to contact the photographer directly
- Contact stack: **booking first** → contact details + WhatsApp under it → FAQ; **drop** the public inquiry / “say hello” form (align UI with booking-only intake)
- **Ornaments**: sparse artistic accents (grain, thin ribbons / print marks) that add street/party energy without clutter or brochure softness
- **Seed media**: one-shot Instagram fetch from `@ibra.himlens` into local seed assets, then upload via FORCE seed — stills preferred; all available posts if possible, otherwise as many as the tool allows; not used at runtime
- Revise OpenSpec **Design** context: Book + Portfolio hero; WhatsApp footer/Contact; street-energy ornaments; IG one-shot seed only

## Non-goals

- Live Instagram embedding or runtime scraping on the public site
- Meta Graph API / Instagram Business product integration
- Manual photographer export workflow (path 1)
- WhatsApp Business API, chat widgets, or floating WA buttons on every page
- Studio UI redesign; schema/collection changes beyond seed content
- Soft warm-cream brochure look; heavy ribbon/neon decoration
- Changing public route names

## Capabilities

### New Capabilities
- `public-street-craft`: Shared sparse ornamental craft for public surfaces — film grain, thin ribbon/print accents, intense but professional street/party energy on the bold dark base
- `seed-demo-media`: Dev/seed-only one-shot Instagram stills fetch into local assets and Portfolio/hero seed upload for realistic local preview

### Modified Capabilities
- `public-home`: Hero CTAs Book + Portfolio only; no WhatsApp in hero; Home uses street-craft accents; booking remains on-page
- `public-contact`: Booking section first; contact details + WhatsApp below booking; no inquiry form; FAQ after
- `app-shell`: Public footer (and chrome as needed) exposes WhatsApp as secondary direct contact; public shell participates in street-craft lightly

## Impact

- Frontend: `PublicContentPages` (Home/Contact), `PublicLayout` footer/nav WhatsApp placement, `BookingSection` (remove inquiry export usage), public CSS ornaments/motion
- Seed: new or extended script to fetch IG stills → `scripts/seed-assets/` → `seed-demo-content` prefers those files over Picsum when present
- Ops: document one-shot fetch + FORCE seed; warn when IG fetch fails (keep existing media)
- `openspec/config.yaml` Design section updated to match
- Non-goals stay: no Meta product dependency, no Studio craft change, no watermarks
