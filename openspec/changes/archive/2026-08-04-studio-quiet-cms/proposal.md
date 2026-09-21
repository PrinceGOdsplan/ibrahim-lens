## Why

Studio Website and Library are quieter than before, but sections still feel heavy, saves are silent (blur with no cue), Featured/Works flows are confusing, and idle Studio sometimes freezes scroll/click until refresh—usually after nested panels leave body overflow locked.

## What Changes

- Quieter Studio chrome: thinner borders, less boxed inputs; keep Studio light (not Soft night).
- Accordion sections across Website tabs, More site settings, and Library: **one section open at a time**.
- Explicit **Save** on each expanded section with **Saving / Saved / Error** (no silent blur-only saves for section fields).
- **Featured**: list grows to **5**; each item Upload **or** Pick from Library, then caption under that photo; Save on the section.
- **Works** (rename from Work on Home): show all website-visible Work with thumb + on/off; max **3** on; **drag reorder only among the selected three**; Save on the section.
- Fix body scroll lock so nested panel/gallery close cannot leave the page scroll/click dead after idle.
- Apply the same accordion + Save pattern to About, Contact & booking, Testimonials, FAQ, More site settings, and Library.

## Non-goals

- Soft night public redesign or public input styling
- Clients / Dashboard rewrite
- Live iframe Soft night preview
- Draft/publish workflow
- Changing PocketBase schema beyond existing media/globals fields

## Capabilities

### New Capabilities

- `studio-quiet-panels`: Shared quiet Studio panel patterns — accordion (one open), section Save status, quieter inputs, reliable scroll unlock after nested overlays

### Modified Capabilities

- `website-content`: Featured max 5 with per-item upload/pick + caption; Works curation (thumbs, on/off, drag selected); Website tabs + More site settings use quiet accordion + Save
- `library-media`: Library uses quiet accordion + Save-per-section; quieter lists/upload/tags surfaces
- `library-work`: Website-visible Work list supports Home Works curation (thumb + toggle clarity)

## Impact

- Studio: `WebsitePage`, Home/About/Contact/SiteChrome tabs, Testimonials/FAQ, `LibraryPage`, `StudioFullscreenModal`, `StudioImageGallery`, shared Input/textarea styling
- Possible light drag-reorder helper (HTML5 or small lib already in repo preference)
- Public Soft night unchanged except Featured/Works curation quality
- No new PocketBase collections expected
