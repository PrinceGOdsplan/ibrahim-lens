## Context

See proposal.md — Why. Public site currently ships cool atelier tokens (ink ground, muted steel) from `public-atelier-craft`. Home is a sparse bar + Selected strip; footer is secondary/legal-leaning. Work already supports Show-on-website case studies — reuse for fashion proof. Studio stays light tool UI. Design rules that still say “cool atelier” in OpenSpec config are outdated for this change — update that Design section when implementing/archiving.

## Goals / Non-Goals

**Goals:**
- One warm-light public token system + bold footer + cohesive Home scroll
- Lanes (Parties · Birthdays · Fashion brands) + Work-as-proof + Portfolio atmosphere
- Portfolio/Work galleries share premium warm language with Home/nav/footer
- Keep immersive lightbox, booking-ops, and Studio hubs intact

**Non-Goals:**
- New PocketBase collections or brands CMS
- Copying reference site layouts
- Studio visual redesign
- WhatsApp API / chat widgets / service supermarket IA

## Decisions

### 1. Warm light tokens replace cool atelier for public only
- **Choice:** Ivory/cream-warm ground, deep warm text, sparse soft-gold/bronze accent; Studio tokens untouched.
- **Why:** User direction — warm/lighter feels more Nigerian; cool ink feels off beside local peers.
- **Alternatives:** Keep dark OSMO-like black+gold (rejected — user wants lighter); dual themes (rejected — one public system).

### 2. Home as one cohesive scroll (not CMS card stack)
- **Choice:** Fixed narrative order: Hero → Lanes → Work proof → Portfolio Selected → About tease → Book. Optional services/testimonials only if they fit editorial rhythm.
- **Why:** “Full home should feel like one cohesive page.”
- **Alternatives:** Keep services/testimonials as primary middle (rejected if they break cohesion).

### 3. Proof = published Work, not logos CMS
- **Choice:** Query website-visible Work for Home proof; fashion brands shown via project covers/titles → `/work/:slug`.
- **Why:** Already in product; honest ops (shoot → Work → publish).
- **Alternatives:** New brands collection (rejected for this change).

### 4. Dual hero CTAs
- **Choice:** Book (scroll to `#booking`) + View work (prefer `/work`, fallback `/portfolio` if no Work).
- **Why:** Matches NG premium peers (Portfolio + Hire) without losing booking-ops intake.

### 5. Bold footer as second brand moment
- **Choice:** Large brand type, lane hints, +234 + Instagram from globals, primary links, legal secondary.
- **Why:** User asked for bold rich footer; Shola/OSMO-style reachability.

### 6. Portfolio/Work keep immersive open; restyle chrome/ground
- **Choice:** Preserve lightbox a11y from atelier; restyle grids to warm uneven premium.
- **Why:** Craft investment still valuable; problem was temperature/place/voice, not immersion.

### 7. Update OpenSpec Design context
- **Choice:** After implement (or at archive), rewrite config Design from cool atelier to warm Nigerian lifestyle (parties/birthday/fashion).
- **Why:** Design section is explicitly editable; prevents next changes from reverting to ink.

## Risks / Trade-offs

- [Empty Work proof] → Soft omit / calm empty; seed demo Work helps local smoke.
- [Warm cream bias] → Avoid generic AI cream+terracotta cliché; keep distinctive type + photo-led composition + restrained gold.
- [Services CMS orphaned] → May hide or restyle; don’t let old card packages break Home story.
- [Delivery `/g` still cool] → Optional light pass if tokens are global public; prefer shared public CSS so delivery inherits warmth without scope creep into Studio.

## Migration Plan

1. Swap public CSS tokens; verify Studio still light.
2. Rebuild PublicLayout nav/footer; rebuild Home section order.
3. Wire Work list into Home proof; restyle Portfolio/Work galleries.
4. Smoke desktop/mobile + reduced motion; publish at least one fashion Work for proof demo.
5. Update OpenSpec Design context text.

Rollback: revert public CSS + layout commits; data model unchanged.

## Open Questions

- Exact hero copy (“Lagos” vs “Nigeria”) — content/CMS, not blockers for tasks.
- Whether View work prefers `/work` always vs smart empty — default `/work` with Portfolio link nearby if empty.
