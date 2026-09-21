## Context

See proposal.md — Why. What matters for the approach is that three of the defects share a shape worth naming, because fixing them individually would leave the shape in place.

**Percentage constraints against auto-height ancestors.** The full-size viewer already asks for the right behaviour: `max-h-full max-w-full object-contain` on the image, inside `flex min-h-0 flex-1`. It does not work because the image sits inside an intermediate `<div className="relative flex max-h-full max-w-full items-center justify-center">` whose own height is `auto`. A percentage `max-height` against an auto-height ancestor does not resolve, so both clamps become inert and the image lays out at its natural 1440×1920. The same pattern — a fixed or auto-height wrapper defeating a percentage constraint — is what makes the Studio bookings list scroll inside a `max-h-[448px]` cap while the viewport below it is empty.

**Class-scoped design tokens versus portalled DOM.** `.public-shell` is a `<div>` in `PublicLayout` and `DeliveryPage`. It carries `--font-display: Syne`, `--font-sans: Sora` and `color-scheme: dark`. Anything rendered through `createPortal` to `document.body` — the mobile nav drawer, the image viewer, and every dialog built on the shared `ui/dialog` primitive — is not a descendant of that div, so it inherits the `@theme` defaults instead. Those defaults are Cormorant Garamond and Figtree, which is to say Studio's type. The bug is not in either component; it is that the token scope and the render tree disagree.

**Composed strings standing in for authored copy.** The lanes headline is built by joining lane titles with `" / "`. That is why it reads "Portraits / Fashion / Lifestyle / shoots", grows with the lane count, and wraps leaving a dangling separator. It also puts slash ornaments into chrome that `public-soft-night` excludes.

Constraints: PocketBase collections are extended through the existing idempotent `ensureFields` helper in `scripts/ensure-schema.ts`, so field additions reach installs that already have the collection. Tokens and fonts stay code-defined per `public-soft-night` — none of this becomes editable in Studio.

## Goals / Non-Goals

**Goals:**

- Fix the three shared-shape defects at the shape, not per component, so the next overlay and the next panel inherit correct behaviour.
- Keep every change inside the existing Soft night and Studio-light token systems.
- Sequence the work so the three critical defects ship before the long tail, and each phase is independently releasable.

**Non-Goals:**

- No CSS framework or component library change. Tailwind 4 with `@theme` stays.
- No new rendering strategy. Client-side React stays; the SEO story-title work is per-route document metadata, not prerendering.
- No abstraction of the public and Studio type systems into one shared scale. They are deliberately different and stay so.
- No refactor of the shared `ui/dialog` primitive beyond adding surface awareness. It was reworked in `app-ux-integrity` and its focus and layering behaviour stays as it is.
- Not curating existing content. See proposal.md — Non-goals.

## Decisions

### Give constrained boxes a definite size instead of chaining percentage maximums

Give the intermediate wrapper a definite height so the image's percentage clamps resolve. The image area already has a definite height from `min-h-0 flex-1` inside the dialog's `fixed inset-0`; the wrapper between it and the image is what breaks the chain, because `max-h-full max-w-full` leaves the wrapper's own height `auto`.

The wrapper becomes `h-full w-full`, and the images keep `max-h-full max-w-full object-contain`.

The images must keep `max-h-*` rather than switching to `h-full w-full object-contain`, which was this decision's first formulation. `object-fit: contain` inside a definite box *upscales* a small image to fill that box, which would break the spec's requirement that a photograph smaller than the viewport is not enlarged beyond its natural size. Clamping an intrinsically sized image with a maximum is what gives natural-size-or-smaller; the fix belongs on the ancestor whose auto height defeats the clamp, not on the image.

Rejected: adding `max-height: 100dvh` to the image. It happens to work today but hard-codes an assumption that the viewer is exactly the viewport with no header, which is not true — there is a header row above the image area. Rejected: `min-h-0` on the wrapper alone. It does not give the wrapper a definite height, so the percentage maximum still fails to resolve.

The identical reasoning applies to the Studio panels. Make each hub's content region a definite-height flex column so its children can use `flex-1 min-h-0`, and delete the `max-h-[448px]` cap rather than raising it. A raised cap is the same bug at a different number.

### Stamp the surface class onto portal roots from context, rather than flipping the default

Add a `SurfaceContext` provided by `PublicLayout`, `DeliveryPage` and `StudioLayout`, and have the portal-creating primitives — the shared dialog and the mobile nav drawer — apply the corresponding class (`public-shell` / `studio-shell`) to the element they portal into. Introduce `.studio-shell` carrying the Cormorant/Figtree pair currently sitting in `@theme`.

Considered and rejected: moving the public fonts to `:root` and scoping only Studio. That fixes the two public overlays in one line, but it creates the mirror-image bug — Studio dialogs, which use the same portal mechanism, would then render in Syne and Sora. Since both surfaces portal, neither can be the unguarded default.

Considered and rejected: wrapping each portal's children in a `<div className="public-shell">` at the call site. It works but depends on every future caller remembering, which is the failure mode we are already paying for.

Reading the surface from context means a component does not need to know where it is mounted, and it carries `color-scheme: dark` along with the fonts — which the image viewer also needs, for scrollbar and native control rendering on the dark ground.

### Resolve the lane row with a per-count column lookup, not `auto-fit`

Pick the track count from the lane count: 1→1, 2→2, 3→3, 4→2, 5→3 with the trailing row's items sharing the row, 6→3. Cap the lane count in Studio at 6 and tell the photographer when they are past what the section is shaped for.

Rejected: `repeat(auto-fit, minmax(280px, 1fr))`. It is the reflex answer and it does not solve the problem — auto-fit still produces a widow row whenever the count does not divide by the resulting track count, which is exactly the 4-lane case that prompted this. Rejected: capping lanes at 3 to match the Portraits/Fashion/Lifestyle intent. There is already a fourth lane in the data, and a cap would either drop it silently or block saving content the photographer chose to add.

A lookup is more code than a one-line grid template, but it is the only option that is correct for every count rather than for most of them.

### Authored headlines, with the composed string kept only as a fallback default

Add `home_lanes_headline` to `website_globals` via `ensureFields`, with a Soft night default when unset. The public component reads the field and stops joining lane titles.

The default must not be the old joined string, or nothing changes for the existing install. Use a fixed authored default ("Portraits, fashion, lifestyle") so an unconfigured site reads as designed prose rather than as a list, and the photographer can override it.

### Numbers move to one sans family with tabular lining figures

Set numeric contexts in Figtree with `font-variant-numeric: tabular-nums lining-nums`, and reserve Cormorant for headings. Cormorant Garamond's default figures are old-style — varying heights with descenders — which is why `₦350,000` and `₦160,000` currently fail to align for comparison.

Rejected: keeping Cormorant and requesting `lnum`/`tnum`. The Google Fonts build's support for those features is not something to depend on for correctness, and even lining Cormorant figures are a display face doing a data job. Using the sans also settles the second half of the defect — the dashboard currently sets its KPI figures in Cormorant and its Gallery counts in Figtree, so one family removes the inconsistency rather than harmonising two.

### One formatter module, with a pinned locale

Add `src/lib/format.ts` exporting a date-time formatter and a currency formatter, and route every Studio surface through them. Pin the locale explicitly rather than passing `undefined` to `Intl`, so day-month order is a decision rather than a property of the viewer's browser. Format to the minute; drop seconds.

This is what removes the raw `2027-05-02T11:00` on the Dashboard and the `5/2/2027, 11:00:00 AM` in Clients as a class of defect, rather than fixing the two call sites that happen to be visible today.

### The Studio accent exists to serve the link role

Add `--color-studio-accent` as a deep brass that clears 4.5:1 on `#f7f7f5`. `#7a5210` measures 6.4:1 and keeps a warm relationship to the brand without being the public `#c9922e`, which measures 2.56:1 on the Studio ground and is the current failure.

Its primary consumer is the link/emphasis case that reached for the public accent in the first place — `Open Home →` and its siblings. Framing it as a link role rather than a decorative accent keeps Studio from acquiring a colour it will then be tempted to spread around, which is the discipline `public-soft-night` already applies to brass on the public side.

### Touch targets grow by pseudo-element, not by padding, where layout is tight

For controls whose visible mark is deliberately small — carousel dots at 32×6 — expand the hit area with an absolutely positioned `::after` rather than padding. Padding would change the dots' spacing and rhythm, which is the thing the design got right. For links and form controls, where there is no such constraint, use ordinary `min-height` and padding.

Add both as utilities so the rule is applied consistently rather than case by case.

### Work story fields are additive and optional

Add narrative body, client-or-subject, location and shoot date to `work_projects` through `ensureFields`. All optional. The story page renders each only when set, so existing published projects keep working and gain nothing they did not ask for.

Rejected: a single freeform rich-text body holding all of it. Discrete fields let the story page lay out shoot facts as a consistent block across stories, which is what makes the section read as a body of work rather than as separate pages.

### Tags normalize on write and group on read

Normalize on write (trim, collapse internal whitespace) and reject a create that collides case-insensitively with an existing tag, telling the photographer it already exists. Separately, group on read by lowercased key so the public filter row already shows one `Weddings` for the install that currently has two.

Both halves are needed. Write-side normalization alone leaves today's duplicates in place; read-side grouping alone lets new duplicates keep accumulating. Neither rewrites stored values — nothing is migrated, which keeps the change reversible.

## Risks / Trade-offs

**The definite-box viewer change could regress the progressive-loading behaviour** that `public-image-delivery` already requires, since the thumbnail and the full image are stacked in the same wrapper being restructured → Verify both states explicitly after the change: thumbnail visible immediately, full image replacing it on load, and the failure path where the original is unreachable and the thumbnail takes over the alt text.

**Surface context adds a required provider.** A portal rendered outside any provider gets no surface class and falls back to `@theme` — the current bug, silently → Default the context to the public surface and assert in development when a portal renders without a provider, so the failure is loud rather than a font that looks nearly right.

**Bounding atmosphere on small screens hides content the photographer curated** → The bound applies only below the small breakpoint and always offers the route through to `/portfolio`, so nothing becomes unreachable. The count is a constant in code rather than a CMS field, per the non-goal about theme controls.

**Per-count lane lookup is opinionated and will not fit every future count** → Capped at 6 with a Studio hint past it. If the section later needs to be genuinely open-ended, the lookup is the wrong shape and should be replaced rather than extended.

**Studio numeric restyling touches many surfaces for a subtle payoff** and risks looking like unrelated churn in review → Confine it to a numeric utility applied at the call sites that display quantities, rather than changing the Cormorant heading style globally.

**The change is large.** Eighteen capabilities is a lot to hold in one review → Phase boundaries in tasks.md are drawn so each phase builds, lints and ships on its own. Phase 1 is the three critical defects and is worth releasing before the rest is written.

## Migration Plan

Run `scripts/ensure-schema.ts` to add `home_lanes_headline` on `website_globals` and the four story fields on `work_projects`. All are optional with empty defaults, so existing rows are valid unchanged and no data migration runs.

Rollback is per phase. Nothing here changes stored data, so reverting the code reverts the behaviour — with one exception: a tag create rejected as a case-collision is not recorded, so a photographer who was prevented from adding `weddings` alongside `Weddings` simply retains the single tag. That is the intended end state either way.

Deploy order does not matter between phases; the schema step should run before the phase that reads the new fields, and is harmless if it runs earlier.
