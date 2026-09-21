## Context

See proposal.md — Why. Soft night CMS fields already exist from studio-website-cms; this change rewrites Studio Website + Library interaction into an app (modals, checklist, layman labels) for phone use.

## Goals / Non-Goals

**Goals:**
- Shared full-screen image gallery + caption-after-pick pattern
- Website Home checklist + five primary CTAs; More site settings naming
- Library covers on list cards; compact thumbs; clearer upload/tags
- Phone-first Studio

**Non-Goals:**
- Clients/Dashboard; live iframe preview; public Soft night redesign; infinite scroll feeds

## Decisions

### 1. Preview = checklist, not iframe
**Choice:** Static Soft night section checklist + Open public page.  
**Why:** Fast, reliable on phone; no iframe auth/perf issues.  
**Alt:** Live iframe (rejected).

### 2. Full-screen modals
**Choice:** Near full-viewport modals for editors and gallery (phone = almost a new screen).  
**Why:** App feel; shell barely scrolls.  
**Alt:** Side sheets / inline expand (rejected for phone).

### 3. Pick then caption
**Choice:** Gallery selects images → Done → calling modal shows caption/detail fields.  
**Why:** Matches photographer mental model; avoids multi-hop Library.  
**Alt:** Caption inside gallery cell (crowded).

### 4. Shared gallery component
**Choice:** One `StudioImageGallery` (filters: All / Portfolio / tag chips) reused by Website + Library.  
**Why:** Cohesion.  
**Alt:** Per-screen pickers (rejected).

### 5. Naming map
**Choice:** Services, Portfolio strip, About photo, More site settings; Featured kept. Data keys may stay (`home_lanes`, `atmosphere_*`, `is_artist_portrait`) with UI labels only—or rename display helpers. Prefer UI labels first; no forced DB rename.  
**Why:** Low migration risk.

### 6. Covers
**Choice:** Work: existing cover field; default first image when empty. Albums: first image thumb; add optional `cover` only if override needed without reorder.  
**Why:** Auto with override as decided.

### 7. Scope boundary
**Choice:** Website + Library only this change.  
**Why:** User locked.

## Risks / Trade-offs

- [Modal stacking] → One editor modal + gallery on top; close gallery returns to editor  
- [Tag filter empty] → Hide tag chips with no tags  
- [Album cover without field] → First image until override field added if required  
- [Large Library] → Compact grid + filters; no infinite scroll requirement—paginate or virtualize inside modal if needed without “endless feed” UX  

## Migration Plan

1. Shared gallery + modal shell primitives  
2. Website Home checklist/CTAs + rename labels; wire editors into modals  
3. Library list covers, compact thumbs, upload/tags polish, About photo from Website  
4. Phone smoke + desktop smoke; build  

## Open Questions

None — Home CTAs, preview B, filters, Featured primary, Website+Library scope, full-screen phone modals, and naming were decided in explore.
