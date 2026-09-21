## Why

Studio Website and Library now expose Soft night CMS power, but the UX feels like a long scrolling site: jargon (lanes, atmosphere, Site chrome), image picking inline with endless thumbs, captions elsewhere, and hops away for About photo. Ibrahim uses Studio on phone and needs an app-like flow—preview + a few clear actions, full-screen modals for picking and editing—without tutorials.

## What Changes

- Rebuild **Website (especially Home)** as an app surface: Soft night **section checklist** + **Open public page**, primary CTAs only, Studio shell barely scrolls; most editing in **full-screen modals** (phone-first).
- Home primary CTAs: **Edit Featured** · **Edit Services** · **Edit Work on Home** · **Portfolio strip** · **About tease** (and About photo via About / related modal—not a Library page hop).
- Shared **modal image gallery**: pick image(s) → Done → return to panel for **captions / details**; filters **All / Portfolio only / tagged**.
- **Layman labels**: Services (was lanes), Portfolio strip (was atmosphere), About photo (was Artist portrait), More site settings (was Site chrome); Featured stays.
- **Library**: smaller thumbs, clearer image meta; Work + Albums **list cards show cover thumb** (first image by default, optional override); improve **upload** and **tags** flows in the same app patterns.
- Contact & booking / Testimonials / FAQ / More site settings keep progressive disclosure via panels/modals, not long page forms.
- Soft night public craft and CMS field model stay; this is Studio interaction + naming, not a new public theme.

## Non-goals

- Clients / Dashboard UX rewrite
- Soft night public redesign or theme CMS
- Infinite scroll / feed-style Library browsing
- Live iframe Soft night preview (checklist + open public page only)
- Draft/publish workflow
- Multi-user / assistant-oriented copy

## Capabilities

### New Capabilities

- `studio-app-shell`: App-like Studio interaction patterns for Website + Library — short shell, full-screen modals, shared image gallery picker, layman copy, phone-usable

### Modified Capabilities

- `website-content`: Studio-facing Home checklist + primary CTAs; rename lanes→Services, atmosphere→Portfolio strip, Artist→About photo, Site chrome→More site settings; Featured/caption edit via modal flow
- `library-media`: Modal-friendly pick/caption; smaller thumbs; clearer meta; improved upload and tags UX; About photo set without leaving a dead-end page hop
- `library-work`: List cards show cover thumb; first image default cover with override
- `library-albums`: List cards show cover thumb (first image default with override)
- `library-categories`: Tags assignment usable in modal/app flow without tutorial jargon

## Impact

- Studio: `WebsitePage` / website tab components, `LibraryPage`, shared modal gallery component
- Public Soft night: unchanged composition; only benefits from clearer operator curation
- No PocketBase schema required unless album cover needs an explicit field (prefer first-image default)
- Phone + desktop Studio layouts
