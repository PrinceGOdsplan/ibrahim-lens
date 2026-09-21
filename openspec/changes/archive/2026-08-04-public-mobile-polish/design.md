## Context

See proposal.md — Why. Public Soft night ships with hamburger nav, solid Book CTAs, and raised booking panels, but a ~390px audit found muted-all mobile menu links, hero dots with multi-`aria-current` and low clearance, no safe-area padding, tall stacked lanes + 2-col masonry, and long booking forms without a sticky primary submit. Studio and PocketBase stay unchanged.

## Goals / Non-Goals

**Goals:**
- Package C: A (polish) + B (scroll density) + C (booking submit comfort)
- Preserve Soft night desktop look; touch only public mobile/small breakpoints

**Non-Goals:**
- New tokens/fonts; Studio mobile; WA FAB; schema/CMS; PWA

## Decisions

### 1. Menu contrast
**Choice:** Mobile explore links default to `text-public-fg`; active route uses muted or hairline emphasis inverted from today’s “active=fg, rest=muted” when on Home all rest were muted. Prefer: inactive = fg, active = accent or underline — or inactive = fg/80, active = fg. Simplest: all explore links `text-public-fg`, active gets border-b / opacity-100 vs opacity-70.  
**Why:** Home has no active explore item.  
**Alt:** Keep muted defaults (rejected — unreadable).

### 2. Safe areas
**Choice:** `padding-top: max(…, env(safe-area-inset-top))` on fixed header and mobile menu; bottom inset on menu footer actions and hero bottom padding / dots.  
**Why:** Notched phones.  
**Alt:** Ignore insets (rejected).

### 3. Hero dots
**Choice:** Fix `aria-current` to active index only; increase min tap size (~44px hit area via padding); raise position (`bottom` + safe-area); keep Soft night bars (not pills). Extra hero `pb` so CTAs clear dots.  
**Why:** A11y + gesture bar.  
**Alt:** Remove dots on mobile (rejected — still useful).

### 4. Lanes + masonry (B)
**Choice:** Lanes `aspect-[3/4]` below `sm`, keep `4/5` from `sm` up. Atmosphere `.public-masonry` → `columns: 1` below ~480px (or `max-sm`), `columns: 2` from sm, `3` from md as today.  
**Why:** Thumb fatigue without killing photo-first.  
**Alt:** Horizontal lane carousel (deferred — more motion risk).

### 5. Booking sticky submit (C)
**Choice:** On small screens only, stick the Soft night primary `Request booking` button (and keep WhatsApp text below it in normal flow, or duplicate a quiet WA text near sticky bar). Prefer sticky bar inside the raised form: `sticky bottom-0` with raised bg + safe-area padding so it doesn’t float as a green FAB. Desktop unchanged (inline button).  
**Why:** Long forms on phone.  
**Alt:** Shorten questions (CMS — out of scope); always-visible FAB WA (non-goal).

### 6. Meta description
**Choice:** Update `index.html` default description to Soft night / portraits & fashion across Nigeria (SEO Studio can still override per page).  
**Why:** “Quiet luxury” leftover.  

## Risks / Trade-offs

- [Sticky submit covers fields] → Only `max-sm`; padding-bottom on form; respect safe-area  
- [1-col masonry feels sparse] → Accept for readability; 2-col from sm  
- [Shorter lanes crop faces] → Prefer `object-top` already in use  

## Migration Plan

1. CSS + layout/menu/hero/booking changes in one public pass  
2. Smoke at ~390 and ~768: menu contrast, safe-area, dots, lanes, masonry, sticky submit Home+Contact  
3. Rollback = revert those files; no data migration  

## Open Questions

- Exact sticky vs “extra bottom padding + larger inline button” if sticky fights iOS keyboard — prefer sticky first; fall back to larger inline + form `pb` if keyboard covers it in smoke
