## Why

The cool atelier public craft reads as placeless next to Nigerian photographer sites. Ibrahim Lens is a lifestyle photographer focused on **parties**, **birthdays**, and **fashion brand** shoots — the frontpage must feel warm, light, Nigerian, and premium, as one cohesive page, not a quiet European gallery.

## What Changes

- **BREAKING (visual):** Replace cool ink / muted-steel public craft with a **warm, lighter** public system (tokens, type energy, accent)
- Overhaul **Home** into one continuous pitch: hero → what I shoot (Parties · Birthdays · Fashion brands) → **Work proof** (fashion brand projects) → Portfolio atmosphere → About tease → Book
- Rebuild **public nav + footer**: footer bold and rich (+234, Instagram, brand weight, lane hints); nav aligned to warm light hero
- Elevate **Portfolio** (and Work covers/galleries) to the same premium warm language so Home → Portfolio → Work feel like one site
- Keep Studio UI unchanged; keep booking-ops data model; keep immersive open where it already works
- Update OpenSpec **Design** context to warm Nigerian lifestyle (supersede cool-atelier token defaults for public)

## Non-goals

- Studio hub redesign or shadcn restyle
- New PocketBase collections (Work + Portfolio + Website CMS already exist)
- Permanent competitor moodboards or copying reference site layouts
- Elite-style service supermarket / chat widgets
- WhatsApp Business API, email/Resend, watermarks, share passwords
- Changing public route names (Home, About, Portfolio, Work, Contact stay)

## Capabilities

### New Capabilities
- `public-warm-craft`: Shared warm-light public craft — tokens, type, accent, bold rich footer patterns, cohesive section rhythm reused across public surfaces (replaces cool-atelier as the public default)

### Modified Capabilities
- `public-home`: Total Home overhaul — cohesive scroll (lanes, Work proof, Portfolio strip, About tease, Book); warm photo-first hero with dual CTA
- `app-shell`: Public nav + footer for warm light surfaces; dedicated mobile menu retained; footer as bold brand moment
- `public-portfolio`: Premium warm gallery rhythm + immersive open aligned with Home
- `public-work`: Fashion-brand Work projects as Home proof; Work index/detail share warm premium gallery language
- `public-contact`: Booking/contact presentation matches warm cohesive public chrome (not cool atelier leftovers)
- `public-about`: About teaser on Home + About page craft aligned to warm system

## Impact

- Frontend: public CSS `@theme` tokens; `PublicLayout` (nav/footer); Home composition; Portfolio/Work gallery presentation; Contact/booking chrome; light About pass
- Studio Website: Home featured may still use Portfolio images for atmosphere; **proof block** sources published Work (Show on website) — no schema change if Work already public
- Globals: phone/Instagram for footer (+234 already product convention)
- OpenSpec `config` Design section: update public craft direction after implement/archive
- Studio hubs and booking-ops unchanged functionally
