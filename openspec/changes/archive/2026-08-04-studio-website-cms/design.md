## Context

See proposal.md — Why. Soft night public is shipped; Studio Website still exposes Services packages, split Booking/Globals, and cannot edit lanes, atmosphere, Work-on-Home, eyebrows, footer, or legal bodies. Library captions and Artist portrait rely on weak conventions.

## Goals / Non-Goals

**Goals:**
- Soft night–shaped Website IA with progressive disclosure
- Delete packages; merge Contact & booking; tuck Site chrome
- Wire public Soft night to new CMS fields + Library Artist/caption
- Include explore refinements (open public, coaching, promote path, SEO hints)

**Non-Goals:**
- Theme/token CMS; draft/publish; Dashboard/Clients rebuild; page builder

## Decisions

### 1. Website tab model
**Choice:** Primary Home | About | Contact & booking; secondary Testimonials | FAQ; ▼ Site chrome (Footer, Eyebrows, SEO, Legal, Fallbacks).  
**Why:** Mirrors Soft night pages; frequent vs rare.  
**Alt:** Keep content-type tabs (rejected — fights finished front).

### 2. Delete packages
**Choice:** Drop `service_packages` collection + Studio + lib; no Home teaser.  
**Why:** Orphaned CMS.  
**Alt:** Wire to Home (rejected by product).

### 3. Contact & booking merge
**Choice:** One tab owns voice + booking questions + reach-me; remove Globals top tab; stop using `contact_fields` for intake.  
**Why:** Matches `/contact`; phone drives WA.  
**Alt:** Keep Booking form + Globals (rejected).

### 4. FAQ secondary
**Choice:** FAQ remains its own secondary tab; still renders only on Contact.  
**Why:** Less frequent than booking; keeps Contact & booking lean.  
**Alt:** Embed FAQ in Contact tab (deferred).

### 5. Home curator storage
**Choice:** Extend `website_globals` JSON/text fields for lanes, atmosphere mode+ids, home_work ids, about tease, eyebrows, footer_blurb, legal bodies, contact_h1/intro, site_display_name — avoid new collections unless needed.  
**Why:** Single site row already exists.  
**Alt:** New `home_sections` collection (heavier).

### 6. Atmosphere Auto vs Manual
**Choice:** `auto` = Portfolio minus Artist flag; `manual` = ordered Portfolio id list.  
**Why:** Covers both “set and forget” and curation.  
**Alt:** Manual only (more friction).

### 7. Artist portrait
**Choice:** Boolean/flag on `media` (enforce single Artist in app layer when setting). Migrate caption=`Artist` once if present.  
**Why:** Explicit > convention.  
**Alt:** Keep caption hack (rejected).

### 8. Work on Home
**Choice:** Ordered id list on globals (max 3), picker filtered to `show_on_website`. Fallback to first 3 by sort when empty.  
**Why:** Explicit Soft night Selected Work.  
**Alt:** `featured_on_home` boolean on work (harder to order).

### 9. Library caption + Work cover/reorder
**Choice:** Caption field in Library detail/side panel; Work editor gets cover select + sort controls.  
**Why:** Unlocks hero lines and Work polish.  
**Alt:** Captions only on Website (wrong ownership).

### 10. Site chrome eyebrows
**Choice:** Keyed map of eyebrow strings with Soft night defaults in code when blank.  
**Why:** CMS everything rare; don’t force fill.  
**Alt:** Hardcode forever (rejected by user).

### 11. Refinements packaging
**Choice:** Ship open-public links, empty-state coaching, caption callouts on Home featured, testimonials promote entry on Website tab, SEO missing-description hints, Soft night hub subtitle in same change.  
**Why:** User asked to include refinements.  
**Alt:** Defer polish (rejected).

### 12. Craft lock
**Choice:** No Studio controls for Soft night tokens, fonts, sticky booking, film header.  
**Why:** Content CMS ≠ theme builder.

## Risks / Trade-offs

- [Large WebsitePage] → Split tab components under `components/studio/website/`  
- [globals JSON bloat] → Typed helpers in `website.ts`; validate max 3 work / lane slots  
- [Artist migration] → One-time: if caption Artist and no flag, set flag  
- [Removing packages] → Delete collection after UI/lib gone; document in migration  
- [Legal empty] → Keep code defaults when CMS empty  

## Migration Plan

1. Schema: add media artist flag + globals fields; stop creating service_packages; migrate Artist caption; delete packages collection when empty/safe  
2. Studio Website IA + Library caption/Artist + Work cover/sort  
3. Public Soft night consumers  
4. Smoke Studio→public for Home/About/Contact/footer/legal; build  
5. Rollback: revert app; retain new PB fields harmlessly if needed  

## Open Questions

None — FAQ B, eyebrows tuck, packages delete, merge Contact & booking, and refinements-in-scope were decided in explore.
