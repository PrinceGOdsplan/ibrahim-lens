## Context

See proposal.md — Why. Public site already ships bold dark street-energy craft (Syne/Sora, Book + Portfolio hero, WhatsApp in footer + Contact under booking). Gaps: metallic gold inflation, cool-black temperature, cliché About tease, Projects vs Work naming, Home nav scrolls away, no Book/WhatsApp in inner desktop chrome, booking form lacks always-on WhatsApp escape hatch. Studio and PocketBase schema stay unchanged.

## Goals / Non-Goals

**Goals:**
- Soft night token ladder + accent diet in public CSS only
- Nav/hero/booking WhatsApp ladder (W2) without hero WA or FAB
- Street Plain copy pass + Less talk / More visuals About tease + Work naming
- Update `openspec/config.yaml` Design section to Soft night

**Non-Goals:**
- Cream/light public theme; new fonts; Studio redesign; green WA buttons; schema/CMS changes; layout IA rewrite

## Decisions

### 1. Soft night tokens (B1)
**Choice:** Warm-brown base (`~#0c0a08`–`#100e0b`), raised (`~#16120e`) for booking panels, deep (`~#070605`) for atmosphere wells; FG warm ivory; split body vs muted; brass accent `~#c9922e`/`#d4a017` (softer than `#e2b84a`); glow low-opacity amber only. Deprecate duplicate champagne=accent sameness by giving champagne glow-only or removing alias misuse.  
**Why:** Locked B1 Soft night — place without cream creep.  
**Alt:** Cool metallic keep (rejected); humid B2 higher contrast (deferred).

### 2. Accent diet + solid Book
**Choice:** Eyebrows muted; brass on primary Book (hero solid; form submit primary). WhatsApp muted text only.  
**Why:** Gold inflation killed hierarchy.  
**Alt:** Keep gold eyebrows (rejected).

### 3. Fonts keep Syne + Sora
**Choice:** No font swap; quieter eyebrow tracking; fewer eyebrows.  
**Why:** User locked keep.  
**Alt:** Warmer body font (deferred).

### 4. Nav package
**Choice:** Drop Home link; brand → `/`; Home header fixed/sticky film→solid after hero; non-home desktop Book → `/contact#booking` (no WhatsApp in header); mobile: Book a session (+ IG); WhatsApp under booking form + footer only. Active state: 1px hairline (not brass).  
**Why:** User locked drop Home, solid on scroll; later removed WhatsApp from nav for cleaner chrome.  
**Alt:** W2 muted WhatsApp in desktop inner nav (superseded).

### 5. Hero
**Choice:** Keep rotating short captions; straighten offsets; Soft night solid Book + ghost Portfolio; lighter scrim pocket OK; no WA.  
**Why:** User locked rotating + Soft night.  
**Alt:** Static tagline (rejected).

### 6. Booking + WhatsApp
**Choice:** Extend shared `BookingSection` with quiet “Or message on WhatsApp” when `whatsappHref(phone)` exists; Contact keeps details stack under form; H1 Let’s shoot.  
**Why:** Form first, WA always.  
**Alt:** WA only in nav (rejected — form escape hatch needed).

### 7. Copy
**Choice:** Home About H2 Less talk. / More visuals.; Work not Projects; seed/FORCE copy alignment optional when touching seed.  
**Why:** User locked from real captions + product word.

### 8. Design context update
**Choice:** Rewrite config Design to Soft night + nav/WA ladder + Street Plain.  
**Why:** Prevent next change reverting to cool gold street.

## Risks / Trade-offs

- [Cream creep if raised too light] → Keep raised dark brown-black  
- [Nav clutter with Book + WhatsApp] → Muted WA; short “Book” label; no brass on WA  
- [Scroll sentinel jank] → IntersectionObserver / scroll threshold; honor reduced motion for transitions only  
- [Street-energy WA “not in nav” superseded] → Specs explicitly ADDED W2; archive supersedes prior nav restriction for inner pages only (hero still no WA)

## Migration Plan

1. Tokens + BookingSection WA + copy/nav/hero in one public pass  
2. Smoke Home (film→solid, hero, booking WA), inner nav Book+WA, Contact, Work heading, About tease  
3. Update config Design; optional FORCE seed copy  
4. Rollback = revert public CSS/layout/copy commits; data unchanged

## Open Questions

- Exact brass hex fine-tune during implementation smoke (within Soft night family)
- Whether Contact route itself shows redundant header Book (acceptable; still targets same form)
