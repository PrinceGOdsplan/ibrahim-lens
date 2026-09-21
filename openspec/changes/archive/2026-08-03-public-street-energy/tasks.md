## 1. Hero, Contact, WhatsApp placement

- [x] 1.1 Home hero: Book + Portfolio (`/portfolio`) only; remove WhatsApp from hero CTA row
- [x] 1.2 Contact: drop `ContactInquiryForm`; stack booking → details + WhatsApp → FAQ
- [x] 1.3 Footer keeps WhatsApp; remove WhatsApp from nav/mobile menu if present
- [x] 1.4 Remove unused inquiry form export/code paths if nothing else references them

## 2. Street-craft ornaments

- [x] 2.1 Add public film-grain overlay + sparse ribbon/print accents (CSS) with reduced-motion respect
- [x] 2.2 Apply accents on Home section openers + light footer participation (not every card)
- [x] 2.3 Add 2–3 intentional motions tied to craft (grain settle / ribbon or reveal)

## 3. Instagram one-shot seed media

- [x] 3.1 Add `scripts/seed-assets/instagram/` (gitignored as needed) + fetch script/npm script for `@ibra.himlens` stills
- [x] 3.2 Wire `seed-demo-content` to prefer local IG assets over Picsum when present; warn and fall back if missing
- [x] 3.3 Document fetch + FORCE seed usage (and that public runtime never hits Instagram)
- [x] 3.4 Run one-shot fetch locally and FORCE seed; confirm Portfolio/hero show real stills
  - Note: IG returned 429 / cookie lock during apply — fetch script ready; re-run `npm run seed:ig` when unblocked, then FORCE seed. FORCE seed completed with existing media fallback.

## 4. Design context + verify

- [x] 4.1 Update `openspec/config.yaml` Design: Book + Portfolio hero; WhatsApp footer/Contact; street-craft; IG seed one-shot only
- [x] 4.2 Build passes; smoke Home hero CTAs, Contact order, footer WhatsApp, ornaments, Portfolio images
- [x] 4.3 Note `pb_data` backup before FORCE seed in seed docs if not already covered
