## Why

The public site’s bold dark street direction works, but metallic gold is overused, chrome feels template-luxury, and copy/nav still fight the photographer’s real voice (“Less talk. More visuals.”). Soft night — warm dark, brass sparingly, Street Plain wording, calmer nav/hero, and WhatsApp always reachable without stealing Book — makes the site feel like Lagos night while staying bookable.

## What Changes

- Retune public color tokens to **Soft night** (warm-brown blacks, surface ladder, softer brass accent; accent diet)
- Keep **Syne + Sora**; quiet/fewer section eyebrows; Street Plain copy; About tease **Less talk. / More visuals.**; Work product word (not Projects); Contact H1 keeps **Let’s shoot**
- Nav: drop Home link; Home film → solid on scroll; inner pages add **Book** + muted **WhatsApp** (W2); mobile menu Book + WhatsApp
- Hero: straighter type; Soft night solid Book CTA + quiet Portfolio; keep short rotating captions; no WhatsApp in hero
- Booking form: primary submit + always-on quiet WhatsApp escape hatch when phone is set (Home + Contact)
- Update OpenSpec Design context for Soft night
- Seed/demo copy alignment where it still says Projects or cliché About tease

## Non-goals

- Light / cream public theme (rejected earlier)
- New fonts or Studio visual redesign
- Floating WhatsApp FAB / official green WA chrome
- Hero WhatsApp CTA
- Layout IA rewrite, new PocketBase collections, Meta/IG runtime
- Tilts, slash ornaments, overlapping stamps

## Capabilities

### New Capabilities
- `public-soft-night`: Soft night public craft — color ladder, accent diet, type/eyebrow rules, Street Plain voice hooks for chrome

### Modified Capabilities
- `app-shell`: Public nav (no Home link; scroll-solid Home header; Book + muted WhatsApp on non-home; mobile Book/WhatsApp); footer WA remains
- `public-home`: Hero Soft night CTAs + rotating captions; About tease copy; booking + WhatsApp under form; Work section naming
- `public-contact`: Form-first with always-on WhatsApp under booking; copy polish
- `public-about`: About page may share Street Plain voice; Home tease copy lives primarily under public-home
- `public-work`: Index/detail use Work product naming (not Projects)

## Impact

- Public CSS tokens (`src/index.css`), `PublicLayout`, `HeroSlideshow`/Home hero, `BookingSection`, Home/About/Contact/Work/Portfolio chrome copy
- `openspec/config.yaml` Design section
- Optional seed copy in `scripts/seed-demo-content.ts`
- Studio UI and PocketBase schema unchanged
