## Why

A UI/UX audit of the public site and Studio found that the visual craft is solid but the interface **asserts facts it has no basis for**: it renders "nothing here" before data has loaded, reports zeros when PocketBase calls fail, and confirms saves that never completed. The Clients hub opens with "You're clear for now — nothing waiting on a reply or payment" on every visit before any fetch resolves; the Dashboard shows an empty library and no bookings when the backend is unreachable; a Gallery caption edit shows a green "Saved" while the write is still in flight and stays green when it fails. Alongside that, shared links render as blank grey boxes because all page metadata is applied client-side and WhatsApp/Instagram crawlers do not execute JavaScript — a photography site that cannot show a photograph when shared is failing at its core job, in the two channels that carry the audience.

These are trust failures, not polish items: the photographer cannot rely on the Studio to tell them the truth about their own business, and visitors cannot share the work.

## What Changes

**Truthful states (public + Studio)**

- Distinguish loading, empty, and error as three separate states everywhere data is fetched. Empty-state copy SHALL NOT render before the first fetch settles.
- Stop swallowing fetch failures into empty results. `loadDashboardSnapshot` and the Website/Clients/Gallery refreshes surface partial or total failure instead of reporting zeros.
- No success confirmation without a settled successful write. Fixes the Gallery caption `try/catch` around an un-awaited promise, and the silent `.catch(() => undefined)` on Website Home uploads.
- Add a retry affordance to error states rather than dead-end text.
- Route PocketBase errors through the existing `pbErrorMessage` helper so raw internals stop reaching visitors and the photographer.
- Add a shared confirmation step for destructive actions (delete image/album/Work/tag/testimonial/FAQ, revoke delivery), promoting the pattern Gallery delete already uses.

**Booking submit integrity**

- Guard the public booking form against double submission (pending state, disabled submit, pending label), preventing duplicate Person + Booking records.
- Move submit feedback next to the submit control on small screens, inline field-level validation for phone, and a `min` bound so a preferred date cannot be in the past.

**Shareable metadata**

- Static Open Graph and Twitter Card tags with a default share image in `index.html`, so link previews work in WhatsApp, Instagram, and Facebook without JavaScript.
- Add `robots.txt` and `sitemap.xml`.
- Keep the existing per-page CMS-driven `document.title` / description behavior for in-browser and JS-capable crawlers.

**Accessibility baseline**

- Associate every label with its control (public booking form, Delivery feedback, and the Studio editors that rely on placeholders as labels).
- Announce errors and status changes via `role="alert"` / `role="status"` — the codebase currently contains zero live regions.
- Give the Home page an `<h1>`, add a skip-to-content link, and give image-picker thumbnail buttons accessible names.
- Restore visible focus where `outline-none` has no replacement, complete focus trap and focus restore in all three dialog implementations, and add a pause control to both autoplay carousels.
- Set `color-scheme: dark` on the public shell so native date pickers, selects, and checkboxes stop rendering dark-on-dark.
- Fix error text using `text-red-700` on the near-black public background (~3:1 contrast).

**Image delivery**

- Responsive sources (`srcset`/`sizes`) derived from the PocketBase thumb helper, intrinsic dimensions or reserved aspect ratio to stop reflow, consistent `loading`/`fetchpriority` so the hero is eager and everything below the fold is lazy.

**Shell corrections**

- Reset scroll position on navigation (currently absent, so footer links land mid-page).
- Derive the fixed-header content offset instead of hardcoding `4.75rem`, which under-compensates once a top safe-area inset applies.
- Make the Studio usable on a narrow viewport — the `w-60` sidebar plus `p-8` currently leaves roughly 70px of content at 375px.
- Route-level code splitting so a public visitor stops downloading the entire Studio bundle.

## Capabilities

### New Capabilities

- `ux-state-integrity`: Loading, empty, and error are distinguishable states; success is confirmed only after a settled successful write; failures are surfaced with retry; destructive actions require confirmation. Applies to both public and Studio surfaces.
- `ux-accessibility`: Baseline accessibility contract — programmatic labels, live-region announcements, heading structure, skip link, visible focus, dialog focus management, autoplay pause control, native control theming, and error-text contrast.
- `public-image-delivery`: How photographs are delivered on public surfaces — responsive sources, reserved layout space, and loading priority.

### Modified Capabilities

- `website-seo`: Per-page SEO metadata must additionally be exposed to crawlers that do not execute JavaScript (social link previews), with a default share image, `robots.txt`, and `sitemap.xml`.
- `website-forms`: The public booking form gains submit integrity — single submission, pending affordance, inline field validation, reachable confirmation, and no past preferred dates.
- `app-shell`: Navigation resets scroll position; the fixed-header content offset accounts for safe-area insets; a skip-to-content link precedes the header.
- `studio-app-shell`: The Studio shell must remain usable on narrow viewports without a fixed-width sidebar consuming the content area.

## Non-goals

- **Server-side rendering or prerendering.** Static site-wide Open Graph tags fix blank link previews; genuinely per-page social previews would require prerendering, which is an architecture decision deferred to its own change.
- **Pagination or virtualization** for large collections. `getFullList` remains; the scale ceiling is a separate concern.
- **Design-system rewrite.** Soft night tokens, fonts, and Studio light-tool identity stay as specified in `public-soft-night`; this change corrects misuse (body copy in muted role, duplicate accent token) but does not redirect the aesthetic.
- **New dependencies for state management or data fetching.** No query library; loading flags are local state.
- **Automated test suite.** The project has none today; introducing one is out of scope here.
- **Email notifications, watermarks, and delivery passwords** remain out of v1 as already specified.

## Impact

**Public**: `index.html`, `src/index.css`, `src/App.tsx`, `src/components/public/*` (`PublicLayout`, `BookingSection`, `HeroSlideshow`, `TestimonialsCarousel`, `ImageImmersive`, `PublicBreadcrumbs`), `src/pages/public/*` (`PublicContentPages`, `PortfolioPage`, `WorkPage`, `WorkDetailPage`, `DeliveryPage`, `LegalPages`), `src/components/PhoneNgInput.tsx`.

**Studio**: `src/components/studio/*` (`StudioLayout`, `StudioSection`, `StudioFullscreenModal`, `StudioImageGallery`, `RequireAuth`, `website/*`), `src/pages/studio/*` (`DashboardPage`, `LibraryPage`, `ClientsPage`, `WebsitePage`, `SettingsPage`, `StudioLoginPage`).

**Shared**: `src/lib/dashboard.ts` (stop swallowing errors), `src/lib/library.ts` (thumb helper gains responsive source generation), `src/lib/studioScrollLock.ts` (becomes the single scroll-lock owner), `src/lib/pb-error.ts` (usage widens).

**New files**: shared confirm dialog, shared alert/error component, loading skeleton primitives, scroll-reset behavior, `public/robots.txt`, `public/sitemap.xml`, a default social share image.

**No changes to**: PocketBase schema, collection rules, seed scripts, Docker Compose, or the Soft night / Studio token definitions.

**Dependencies**: none added.
