## 1. Quick polish (A)

- [x] 1.1 Mobile menu: readable explore-link contrast (fg by default; active route distinguished); safe-area padding on fixed header + full-screen menu
- [x] 1.2 Hero: fix single `aria-current` on slide dots; larger tap targets; raise dots + extra hero bottom padding for home-indicator; Soft night bars kept
- [x] 1.3 Update `index.html` default meta description to Soft night / portraits & fashion across Nigeria

## 2. Scroll comfort (B)

- [x] 2.1 Home lanes: shorter aspect on small screens (`3/4` below `sm`, keep taller from `sm` up); keep `object-top`
- [x] 2.2 Atmosphere masonry: single column on small screens; restore multi-column from `sm`/`md` as today

## 3. Booking mobile (C)

- [x] 3.1 BookingSection: small-screen sticky Soft night Request booking (raised bar + safe-area); WhatsApp stays secondary under submit; desktop inline unchanged
- [x] 3.2 Ensure Home and Contact booking sections pick up shared behavior; form content has bottom padding so sticky bar does not cover fields

## 4. Verify

- [x] 4.1 Smoke ~390 and ~768: menu contrast from Home, safe-area, hero dots/CTAs, lanes, masonry, sticky booking + WA; build passes; Studio unchanged
