## Why

A design pass over the live site and Studio found that the visual foundation is sound — the Soft night ladder, the Syne/Sora pairing, the rationed brass — but a set of defects sit on top of it that contradict what the design is for. The worst is that the full-size image viewer renders each photograph at its natural pixel size inside the viewport, so a portrait frame hangs 410px above and 430px below the screen and the visitor sees the middle 56% of it. A portfolio whose full-size view cannot show a whole photograph has inverted its own purpose, and it fails silently.

Two more defects have the same character — invisible in code review, obvious once measured. The public fonts are scoped to a `.public-shell` class, but the mobile navigation drawer and the image viewer are portalled to `document.body` and therefore land outside that scope, silently inheriting the Studio faces; mobile nav links render in Cormorant Garamond while the wordmark beside them is Syne. And Home is 14,240px on a phone — nearly seventeen screens, seven of them a single unbroken column of atmosphere frames — on the one route whose header offers no Book control.

## What Changes

**Frames are shown whole.** The full-size viewer must fit the entire photograph within the viewport. Public galleries must stop forcing every frame into one uniform crop, so a photograph's own proportions survive being displayed.

**Public typography covers overlays.** The Syne/Sora requirement is tightened to apply to surfaces rendered outside the page shell, closing the portal escape at the requirement level rather than patching two components.

**Home becomes navigable, and keeps a way to book.** Lane cards adapt to how many lanes exist instead of orphaning the fourth into an empty row. Section headlines stop being machine-joined from item titles with slash separators, which today produces "Portraits / Fashion / Lifestyle / shoots" and a dangling slash on wrap. The atmosphere block is bounded on small screens. A Book affordance is present in Home chrome, targeting the on-page booking section.

**Public controls become tappable.** A minimum touch target applies to public interactive chrome. Today the testimonial carousel dots are 6px tall, footer links 20px, form inputs 40px and the submit 42px — the earlier accessibility pass scoped the 44px rule to Studio compact controls, so the mobile-first surface was never held to it.

**Dead ends close.** Email and phone on Contact become actionable rather than plain text a visitor must copy by hand. In-copy references on About and in the FAQ become links. Work story pages gain narrative, identifying metadata and an onward path, so the section delivers the "process, people, details" it advertises instead of a title over a grid — which also means Work records gain the optional fields to hold that narrative.

**Portfolio filters become controls.** The tag list is normalized so case variants collapse rather than listing both `Weddings` and `weddings`, and the filter row reads as discrete controls with a state that is not carried by colour alone.

**Studio stops wasting space and drifting.** Panels size to the viewport instead of fixed caps — the bookings list is capped at 448px and scrolls to hide 40px while 345px of viewport sits empty beneath it. One tab idiom replaces the current split between filled pills and underlines. Numbers get lining tabular figures from one family instead of Cormorant old-style figures for money and Figtree for counts on the same dashboard. Timestamps are formatted once, rather than raw ISO on Dashboard and `5/2/2027, 11:00:00 AM` in Clients. Studio gains its own accent token so it stops borrowing the public brass, which currently fails contrast at 2.56:1.

**The Website hub becomes usable as an editor.** Its rows name sections the way the public site names them, show what they contain, and drop the status field that reads "Ready" on every row regardless of state.

**Uploading becomes a designed action.** Gallery gains a drop target rather than a bordered native file input reading "No file chosen".

**Public placeholders address visitors.** Contact currently renders "Contact details are managed from Studio → Website → Contact & booking" while globals load — an operator instruction shown to the public.

**Presentational consistency is tidied without a requirement behind it.** Two items are small enough to be implementation rather than contract, and are tracked as tasks: the Testimonials block sits 64px off the left alignment spine every other section shares, and the two see-more links mean the same thing while being styled differently — "All work →" uppercase with tracking, "Portfolio →" sentence case without.

## Non-goals

- **No change to the Soft night direction.** The palette, the Syne/Sora pairing, the brass diet and the Studio light/public dark split all stay. This change enforces them, it does not revise them.
- **No visual redesign of Studio.** Studio's calm-tool character is correct. The work is spacing, consistency and numeric legibility.
- **No theme controls in Studio.** Tokens and fonts stay code-defined, per `public-soft-night`.
- **No art-direction system for per-image focal points.** Preserving a frame's proportions is in scope; letting the photographer choose a crop per breakpoint is a larger feature and is not.
- **No new public routes or sections.** Work stories gain depth within the existing template; nothing new is added to the nav.
- **No revision of what the accent means.** Brass stays reserved for Book actions on the public site; Studio gets its own token rather than a licence to use brass.
- **No content authoring.** Replacing the off-brand 3D renders in the Work grid, the `Frame 2` captions and the junk `game` tag is the photographer's editorial work, not a code change. The tag normalization here prevents new duplicates; it does not curate existing content.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `public-image-delivery`: adds that the full-size viewer fits the whole frame within the viewport, and that galleries present a photograph's own proportions rather than forcing one uniform crop.
- `public-soft-night`: narrows the typography requirement so it binds surfaces rendered outside the page shell, not only in-tree content.
- `public-home`: adds that the lane grid adapts to lane count, that composed section headlines are not built by joining item titles with separators, and that atmosphere volume stays bounded on small screens.
- `app-shell`: modifies the Book chrome requirement so Home also carries a Book affordance, targeting its on-page booking section rather than Contact.
- `public-mobile`: adds a minimum touch target for public interactive chrome.
- `public-work`: adds that a story page carries identifying metadata, narrative copy, and an onward path.
- `library-work`: adds the optional story fields — narrative body, client or subject, location, and when the shoot took place — that the public story page presents.
- `public-portfolio`: adds that category filters present as discrete controls whose active state is not conveyed by colour alone.
- `library-categories`: adds normalization so tags differing only by case or surrounding whitespace resolve to one tag.
- `public-about`: adds that in-copy references to other surfaces are navigable.
- `public-contact`: adds that published email and phone are actionable, and that the booking section does not stack a second heading and lead beneath the page's own.
- `website-seo`: modifies document title requirements so a Work story identifies itself rather than sharing one title across every story.
- `website-forms`: adds that booking form controls share one visual treatment regardless of input type.
- `studio-app-shell`: adds a single tab idiom, numeric presentation rules for figures and currency, one date/time format, and a Studio-owned accent token.
- `studio-quiet-panels`: adds that panels size to available space rather than to fixed heights that scroll while the viewport is empty.
- `studio-website-ia`: modifies the hub listing so rows name sections as the public site names them and show their content, without a status that never varies.
- `library-media`: adds a drop target for uploading.
- `ux-state-integrity`: adds that public placeholder and empty-state copy addresses the visitor rather than the operator.

## Impact

**Public surfaces**

- `src/index.css`: move the Syne/Sora declarations off `.public-shell` onto the root with a Studio override, so portalled overlays inherit them. Add a public minimum-target utility.
- `src/components/ImageImmersive.tsx`: constrain the full-size image to the viewport box.
- `src/components/public/*`: lane grid track, composed headline construction, carousel dot targets, footer link targets, see-more link treatment, testimonials alignment.
- `src/pages/public/HomePage.tsx`: bounded atmosphere on small screens.
- `src/pages/public/WorkStoryPage.tsx`: story metadata, body copy, next-story and closing CTA; per-story document title.
- `src/pages/public/PortfolioPage.tsx`: filter controls and normalized tag list.
- `src/pages/public/AboutPage.tsx`, `ContactPage.tsx`: in-copy links, `mailto:`/`tel:`, single booking heading.
- `src/components/public/BookingForm.tsx`: phone control matched to the other fields.

**Studio surfaces**

- `src/index.css` / theme tokens: `--color-studio-accent`; tabular lining figures for numeric contexts.
- `src/components/studio/*`: one tab component; panel sizing without fixed max-heights.
- `src/pages/studio/DashboardPage.tsx`: formatted timestamps, numeric treatment, card grouping.
- `src/pages/studio/ClientsPage.tsx`: list sizing, row information hierarchy, one date format.
- `src/pages/studio/WebsitePage.tsx`: row naming and previews, status removal, accent token.
- `src/pages/studio/LibraryPage.tsx`: upload drop target.

**Shared**

- `src/lib/format.ts` (new or extended): one date/time formatter and one currency formatter.
- `src/lib/tags.ts` or `library-categories` helpers: tag normalization on write and on read.

No schema migration. No PocketBase rule changes. Tag normalization changes how existing tags are grouped for display but does not rewrite stored values unless the photographer edits them.
