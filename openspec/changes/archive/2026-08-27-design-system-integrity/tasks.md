Phases are drawn so each one builds, lints and ships on its own. Phase 1 covers the three critical defects and is worth releasing before the rest is implemented.

## 1. Critical: frames, type scope, and Home

- [x] 1.1 Restructure the image area in `src/components/public/ImageImmersive.tsx` so the image sits in a definite-height box: give the intermediate wrapper `h-full w-full` so the images' `max-h-full max-w-full object-contain` clamps resolve — see design.md, which corrects this task's original prescription of `h-full w-full object-contain` on the images themselves (that upscales a small frame)
- [x] 1.2 Verify the viewer at 1920×1080 and 390×844 with a tall portrait, a wide landscape, and an image smaller than the viewport: the whole frame is visible in every case, nothing extends past an edge, and the small image is not upscaled beyond its natural size
- [x] 1.3 Verify the progressive-loading path still holds after 1.1: the cached thumbnail is visible immediately, the full image replaces it on load, and when the original is unreachable the thumbnail takes over the real `alt` text
- [x] 1.4 Add a `.studio-shell` class in `src/index.css` carrying the Cormorant/Figtree pair currently sitting in `@theme`, and apply it to the `StudioLayout` root
- [x] 1.5 Add a `SurfaceContext` (default: public) provided by `PublicLayout`, `DeliveryPage`, and `StudioLayout`
- [x] 1.6 Have the shared `src/components/ui/dialog.tsx` primitive read the surface from context and apply the matching shell class to the element it portals into; do the same for the mobile navigation drawer
- [x] 1.7 Add a development-only warning when a portal renders without a surface provider, so the fallback is loud rather than a font that looks nearly right
- [x] 1.8 Verify at 390px that mobile nav links render in Syne/Sora matching the header wordmark, that the image viewer's caption, counter and controls do the same, and that Studio dialogs and confirm dialogs still render in Cormorant/Figtree
- [x] 1.9 Add `home_lanes_headline` (text) to `website_globals` in `scripts/ensure-schema.ts` via `ensureFields`, and expose it in the Website → Home editor
- [x] 1.10 Replace the joined lane-title headline on Home with the authored field, defaulting to a fixed Soft night line when unset; confirm no slash separators remain in the headline and no line ends with a dangling separator when it wraps
- [x] 1.11 Implement the per-count lane column lookup (1→1, 2→2, 3→3, 4→2, 5→3 with the trailing row shared, 6→3) and verify at 2, 3, 4 and 5 lanes that no card is orphaned beside empty columns
- [x] 1.12 Cap Home lanes at 6 in the Website → Home editor with a hint when the photographer reaches it
- [x] 1.13 Bound the atmosphere block below the small breakpoint to a fixed count with a control through to `/portfolio`; verify Home's total height on a 390px viewport drops well below its current 14,240px and that the atmosphere block is no longer the longest section
- [x] 1.14 Add a Book control to Home's persistent header targeting the on-page booking section, and verify it scrolls rather than navigating to `/contact` while inner routes keep their existing Contact-booking target
- [x] 1.15 Run `npm run build` and `npm run lint`; verify no new warnings

## 2. Public galleries present frames at their own proportions

- [x] 2.1 Remove the forced uniform ratio from the Portfolio gallery so each item lays out at its own aspect ratio, keeping the reserved layout space that `public-image-delivery` already requires so nothing reflows as images arrive
- [x] 2.2 Do the same for the Home atmosphere block and a Work story's image set
- [x] 2.3 Confirm lane cards keep their fixed ratio, since there the photograph is the ground beneath a title rather than the browsed frame
- [x] 2.4 Verify with both a portrait and a landscape image in each gallery that no landscape frame is cropped to a portrait tile and that heights now vary
- [x] 2.5 Resolve the trailing row on Work story and Portfolio grids so a final lone image does not centre itself away from the page's left alignment

## 3. Public touch targets

- [x] 3.1 Add two utilities to `src/index.css`: a `min-height`/padding target for links and form controls, and a pseudo-element hit expander for controls whose visible mark must stay small
- [x] 3.2 Apply the hit expander to testimonial carousel dots and hero slideshow dots and any pause control, keeping the visible dot at its current size
- [x] 3.3 Apply the target utility to footer navigation links, the Privacy and Terms links, see-more links, and the booking panel WhatsApp link
- [x] 3.4 Raise booking form inputs, selects and the submit control to at least 44px
- [x] 3.5 Verify at 390×844 that every control listed in the `public-mobile` delta measures at least 44×44, that stacked footer links have enough separation to avoid mis-taps, and that inline prose links are left alone

## 4. Public dead ends and placeholder copy

- [x] 4.1 Render the published email as a `mailto:` link and the published phone as a `tel:` link on Contact, displaying the number grouped for reading while the dial target uses the stored international form
- [x] 4.2 Make About's in-copy references to the portfolio, Work, booking and WhatsApp navigable, and confirm at least one route onward exists from the page body rather than only from the header
- [x] 4.3 Make the FAQ answer's reference to Work a link
- [x] 4.4 Replace the Contact loading placeholder that reads "Contact details are managed from Studio → Website → Contact & booking" with visitor-appropriate copy, and audit the other public sections for operator instructions used as placeholders
- [x] 4.5 Give the shared booking form the ability to render without its own heading block, and use that on Contact so the page presents one heading and one lead; confirm Home's booking section keeps its heading

## 5. Work stories

- [x] 5.1 Add optional `story_body`, `story_client`, `story_location` and `story_shot_at` fields to `work_projects` in `scripts/ensure-schema.ts` via `ensureFields`
- [x] 5.2 Add those fields to the Work project editor in Studio
- [x] 5.3 Present narrative body and the shoot-facts block on the story page, omitting any field that is unset rather than rendering an empty label
- [x] 5.4 Add a next-story link and a closing booking CTA to the end of a story page; handle the single-published-story case without rendering a broken sibling link
- [x] 5.5 Set a per-story `document.title` and per-story share preview title and description, falling back to the story's own title and summary when no per-story SEO fields are configured
- [x] 5.6 Verify two stories open in separate tabs show distinct titles, and that a sparsely configured story renders without empty labels

## 6. Portfolio filters and tags

- [x] 6.1 Normalize tags on write in Settings → Portfolio tags: trim, collapse internal whitespace, and reject a create that collides case-insensitively with an existing tag, telling the photographer it already exists
- [x] 6.2 Group tags on read by lowercased key so an install that already holds case variants offers one filter matching images tagged either way
- [x] 6.3 Present each Portfolio filter as a discrete control with its own bounded hit area, an active state carried by more than colour, and an option to clear the filter
- [x] 6.4 Verify the filter row no longer lists both `Weddings` and `weddings`, that the active state is visible with colour disregarded, and that clearing returns the full gallery

## 7. Booking form presentation

- [x] 7.1 Match the phone control to the form's other fields so it is no longer the heaviest element, presenting `+234` as a quiet part of the same field rather than a separately bordered chip
- [x] 7.2 Confirm trunk-zero stripping and the local-digits placeholder still behave as `website-forms` requires
- [x] 7.3 Size short-answer fields to less than the full form width on desktop while free-text fields may span it; keep full width on narrow viewports

## 8. Studio space and panel sizing

- [x] 8.1 Make each Studio hub's content region a definite-height flex column so children can use `flex-1 min-h-0`
- [x] 8.2 Delete the `max-h-[448px]` cap on the Clients bookings list rather than raising it, and verify the list shows without an inner scrollbar at the current data size and scrolls using the full available height when content exceeds it
- [x] 8.3 Arrange the booking detail pane's fields to use the width it occupies rather than a narrow column beside empty space
- [x] 8.4 Show payment state on arrival at a booking rather than behind a disclosure, keeping disclosures for genuinely secondary detail and for narrow viewports
- [x] 8.5 Replace the constant "Needs a reply" repeated on every row inside the "Needs a reply" group with the information the position is worth spending on — who and when
- [x] 8.6 Verify at 1920×1080 that no Studio list is capped short of the available viewport and no region clips a row mid-height at its lower edge

## 9. Studio consistency

- [x] 9.1 Consolidate the two tab treatments — the filled pills in Clients and the underline tabs in Gallery and Website — into one shared component, and use it across all hubs
- [x] 9.2 Make the primary/secondary tab grouping in Website perceivable, replacing the `text-studio-border` divider glyph that measures 1.19:1 and is effectively invisible
- [x] 9.3 Add `src/lib/format.ts` with a date-time formatter (pinned locale, minute precision, no seconds) and a currency formatter
- [x] 9.4 Route every Studio surface through those formatters; verify the Dashboard no longer shows a raw `2027-05-02T11:00` and that the same booking reads identically on the Dashboard and in Clients
- [x] 9.5 Add a numeric utility applying Figtree with `font-variant-numeric: tabular-nums lining-nums`, and apply it to Dashboard KPI figures, currency, and counts
- [x] 9.6 Verify amounts align vertically in lists and that counts on the Dashboard and elsewhere use the same family and numeric style
- [x] 9.7 Add `--color-studio-accent` (candidate `#7a5210`; confirm at least 4.5:1 against `#f7f7f5` before committing) and replace the public `#c9922e` on `Open Home →` and any sibling use
- [x] 9.8 Verify no Studio route has a text contrast failure, and that the public accent no longer appears on any Studio surface

## 10. Studio Website hub and upload

- [x] 10.1 Rename Website hub section rows to the names the sections carry publicly, or state the public name alongside the internal one — `Portfolio strip` should be identifiable as the atmosphere block
- [x] 10.2 Show a representative photograph on each photographic section row, and the configured heading or item count on textual rows; say so plainly when a section is unconfigured
- [x] 10.3 Remove the status field that reads "Ready" on every row; if a status is kept, make the states distinguishable and their labels clear
- [x] 10.4 Replace the bordered native file input in Gallery with a designed drop target that indicates when a dragged file is over it, states accepted formats and the size ceiling before a file is chosen, and does not rely on browser-generated placeholder text
- [x] 10.5 Verify the file picker still opens on touch, where dragging is unavailable, and that size and type errors remain plain-language

## 11. Presentational consistency

- [x] 11.1 Bring the Testimonials block onto the left alignment spine the other sections share (heading at x=337 rather than x=401), and check the Contact column against the same spine
- [x] 11.2 Give the two see-more links one treatment — "All work →" and "Portfolio →" currently differ in case and tracking while meaning the same thing

## 12. Verification

- [x] 12.1 Walk every public route at 1920×1080 and 390×844: Home, Portfolio, Work index, a Work story, About, Contact, Privacy, Terms, and a delivery gallery — confirm no horizontal overflow and no regression in the `app-ux-integrity` behaviours (skip link, scroll reset, focus visibility, dialog focus trapping)
- [x] 12.2 Walk every Studio hub at 1920×1080 and 390×844: Dashboard, Library, Website, Clients, Settings — confirm no capped-short panels, one tab idiom, one date format, and consistent numerals
- [x] 12.3 Re-measure the specific numbers from the review: Home height at 390px, viewer crop on a tall portrait, mobile nav font family, bookings list scroll state, and `Open Home →` contrast
- [x] 12.4 Run `npm run build` and `npm run lint`; verify no new warnings
- [x] 12.5 Run `openspec validate --changes design-system-integrity --strict`
- [x] 12.6 Back up `pb_data` before running the schema step against any install holding real content, and confirm `scripts/ensure-schema.ts` is idempotent by running it twice
- [x] 12.7 Record any defect found during verification, and any spec that needed correcting to match what was built, in a section appended to this file

## Verification notes (2026-08-27)

Walked public routes at 1920×1080 and 390×844, and Studio hubs at both sizes, against local Vite + PocketBase.

### Measurements (was → now)

- Home document height at 390×844: **8,972px** (review: 14,240px). Atmosphere is 272px; “What I shoot” is the longest block.
- Home header **Book** stays on `/` and targets `#booking`. A first click could land short if lanes were still arriving; Home now re-scrolls after globals/lanes settle, and a second click on Home also scrolls. After settle, the form sits at ~112px from the top (`scroll-mt-28`).
- Mobile nav links: **Syne**, matching the wordmark. Drawer carries `.public-shell`. Studio Settings h1: **Cormorant Garamond**; body: **Figtree**.
- `Open Home →`: `rgb(122, 82, 16)` (`#7a5210`) on `#f7f7f5` → **6.44:1**.
- Four Home lanes at 1920: 2×2, no orphan column. Heading spine at x=337 shared with Testimonials.
- Footer links and booking fields measure 44px; carousel dots keep a 6px mark with a 44px `::after` hit.
- Schema: `home_lanes_headline` and Work story fields added on first `npm run seed`; second run reported collections already ready (idempotent). This was the local demo PocketBase, not a production `pb_data` tree.

### Defects found and patched during verification

- Mobile “Book a session” in the drawer always went to `/contact#booking`, including on Home. It now matches the header: Home → `/#booking`.
- Gallery room tabs still used a private underline copy. They now use `StudioTabs`.
- Clients detail still declared a payment-disclosure flag after payment was made always-visible; unused `sectionParam` / `expandPayment` removed (blocked `tsc -b`).
- `design.md` (earlier in this change) already corrects task 1.1: do not put `h-full w-full object-contain` on the images themselves.

### Not live-checked

- Lane counts 2, 3 and 5: lookup is implemented; this install currently publishes **4** lanes (verified 2×2).
- Dashboard ↔ Clients date pairing: local Studio has **no bookings**, so ISO timestamps could not be compared on screen. Both surfaces call `formatDateTime` (`en-GB`, minute, 24h).
- Studio Gallery’s tag dropdown still lists both `Weddings` and `weddings` as stored records. Public Portfolio filters group by lowercased key and showed one **Weddings** chip.
