## Why

Soft night public craft works on desktop, but a mobile pass at ~390px showed friction that hurts booking: muted-only mobile menu links, hero dots fighting the home indicator with broken `aria-current`, missing safe-area padding, long stacked lane/masonry scroll, and a tall booking form without a persistent submit affordance. Nigerian visitors are heavily mobile — polish now before more content piles on.

## What Changes

- **A — Quick polish:** Mobile menu link contrast (fg by default); notch/safe-area padding on fixed header + mobile menu; hero slide dots raised with larger hit targets and correct single `aria-current`; fix `index.html` meta description away from “quiet luxury”
- **B — Scroll comfort:** Slightly shorter Home lane aspect on small screens; atmosphere masonry single-column below a small breakpoint
- **C — Booking mobile:** Keep raised Soft night form; add a clearer mobile submit path (sticky/footer-adjacent primary Request booking or equivalent) so long forms stay completable; preserve WhatsApp under submit
- Hero CTA row: slightly more bottom padding so Book/Portfolio clear dots + home gesture bar

## Non-goals

- Desktop Soft night redesign or new fonts/colors
- Studio UI mobile pass
- Floating WhatsApp FAB / green WA chrome
- New PocketBase schema or CMS fields
- Full PWA / install prompt
- Tablet-only layouts beyond Tailwind breakpoints already in use

## Capabilities

### New Capabilities
- `public-mobile`: Public Soft night mobile responsiveness — safe areas, menu contrast, hero chrome, scroll density, booking submit comfort

### Modified Capabilities
- `app-shell`: Mobile menu contrast + safe-area on public header/menu
- `public-home`: Hero dots/padding, lane aspect on small screens, atmosphere masonry density, booking mobile submit comfort on Home
- `public-contact`: Booking mobile submit comfort on Contact (shared form)
- `public-soft-night`: Optional note that Soft night chrome must remain usable on narrow viewports (safe-area / menu contrast)

## Impact

- `PublicLayout`, `HeroSlideshow`, Home lanes/atmosphere in `PublicContentPages`, `BookingSection`, `index.css` / masonry utilities, `index.html` meta
- Studio unchanged; PocketBase unchanged
