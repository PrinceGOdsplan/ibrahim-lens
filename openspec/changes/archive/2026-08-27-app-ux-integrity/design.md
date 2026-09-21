## Context

See `proposal.md` — Why. Design-relevant current state:

- Routing uses `<BrowserRouter>` with a `<Routes>` tree in `src/App.tsx`. This is **not** a React Router data router, so the library's `ScrollRestoration` component and `useBlocker` hook are unavailable — both require `createBrowserRouter`. Any scroll-reset and unsaved-changes behaviour must be hand-rolled or the router must be migrated.
- Every route is imported statically; there is no `React.lazy`, `Suspense`, or `manualChunks` anywhere.
- Data fetching is bare `useEffect` + `useState` per page, with no shared loading/error representation. Several call sites collapse failure into an empty result (`src/lib/dashboard.ts` lines 55–63, `WebsitePage` refresh, `ClientsPage.markInquiryRead`).
- There are three independent body-scroll-lock implementations: `PublicLayout` (direct `document.body.style.overflow`), `ImageImmersive` (same), and the ref-counted `src/lib/studioScrollLock.ts`. `StudioLayout` already carries an `ensureStudioScrollUnlocked` window-focus listener as a workaround for locks getting stuck.
- There are three dialog implementations with three different levels of correctness: `ImageImmersive` (focus in, Tab trap, Escape, no focus restore), `StudioFullscreenModal` (Escape, scroll lock, no focus handling), and the `PublicLayout` mobile menu (Escape, scroll lock, no focus handling) — all three declare `role="dialog"` / `aria-modal`.
- Images all route through `mediaThumbUrl(record, thumb)`, which wraps `pb.files.getURL` with a single `thumb` string. Callers pass `'1200x0'` almost everywhere. PocketBase generates thumbs on demand for arbitrary `WxH` values.
- `src/lib/pb-error.ts` exposes `pbErrorMessage` but only `bookings.ts`, `clients.ts`, `website.ts`, and `SettingsPage` use it.
- Tailwind CSS 4 with tokens declared in an `@theme` block in `src/index.css`; there is no `color-scheme` declaration and no danger colour token.

## Goals / Non-Goals

**Goals:**

- One shared representation of async state, so "loading vs empty vs error" cannot diverge per page.
- One dialog primitive that owns focus, inertness, and scroll locking, so the three current implementations converge and the stuck-lock workaround can be deleted.
- Share previews that work in non-scripting unfurlers without introducing a rendering pipeline.
- Corrections applied at the source (helper, primitive, token) rather than per call site, so the fix does not have to be re-applied by hand as the app grows.

**Non-Goals (design-level, additional to the proposal):**

- Not migrating to `createBrowserRouter`. See Decision 7.
- Not introducing a component library for dialogs, toasts, or forms. The existing shadcn-style primitives plus Radix packages already present are the ceiling.
- Not changing the token *values* in `@theme`, only adding the missing danger role and `color-scheme`.
- No global toast/notification system. Feedback stays local to the surface that caused it, which is what the specs require and avoids a new state container.

## Decisions

### 1. A single `useAsyncData` hook, not per-page flags

Introduce one hook that owns the async lifecycle and returns a discriminated state plus a retry function:

```ts
type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: T; error: null }
  | { status: 'error'; data: null; error: string }
```

Every fetching surface consumes `status` rather than inferring emptiness from `data.length`. This makes the central requirement — empty copy must not render before the first fetch settles — structurally enforced instead of remembered.

*Alternatives considered.* Adding an `isLoading` boolean per page is what the codebase does today and is exactly how the current bugs arose: nothing stops the next page from omitting it. TanStack Query would give this plus caching and retry for free, but the proposal excludes new dependencies, and with a single-user Studio and small collections the caching is not needed.

*Consequence.* Surfaces that aggregate several reads (Dashboard, Clients, Website) need per-read outcomes to satisfy the "partial load" requirement, so the hook accepts a record of loaders and reports which keys failed, rather than a single `Promise.all` that is all-or-nothing.

### 2. `loadDashboardSnapshot` reports failures instead of absorbing them

Rather than deleting the `.catch(() => [])` calls and letting one failed read reject the whole snapshot — which would replace a lying dashboard with a blank one — the snapshot gains a `failed: string[]` field naming the reads that did not succeed. The Dashboard renders its console from what loaded and shows a partial-data notice listing what did not. A total failure (every read failed) renders as an error with retry.

*Alternative considered.* Letting `Promise.all` reject is simpler, but the Dashboard is the photographer's landing surface and one blocked collection rule should not blank it.

### 3. One dialog primitive; delete the other two scroll locks

Add a `Dialog` shell plus a `useDialogChrome` hook that owns: focus-in on open, Tab containment, Escape, `inert` on the app root, ref-counted scroll lock, and focus restore to the previously active element on close. `ImageImmersive`, `StudioFullscreenModal`, the `PublicLayout` mobile menu, and the new confirm dialog all build on it.

The scroll lock inside it is the existing ref-counted `studioScrollLock`, renamed to drop the Studio-specific name since it becomes app-wide. That is what makes the `ensureStudioScrollUnlocked` window-focus workaround in `StudioLayout` removable — the lock can no longer be orphaned by a second implementation clobbering `document.body.style.overflow`.

The lock additionally compensates for scrollbar width by padding the body, which fixes the sideways content jump on desktop when a lightbox opens.

*Alternatives considered.* Radix Dialog would provide all of this and is already an indirect dependency, but it imposes its own portal and animation model on the full-bleed `ImageImmersive` and the film-treatment mobile menu, both of which are deliberate custom craft. A focus-trap library would solve only the trap, which is the part `ImageImmersive` already gets right.

### 4. Responsive sources derived from the existing thumb helper

Add `mediaImageSources(record, { widths, sizes })` beside `mediaThumbUrl`, returning `{ src, srcSet, sizes }` by mapping each width to a `${w}x0` PocketBase thumb. `mediaThumbUrl` stays for the single-size cases (Studio pickers, favicons) so no call site breaks.

Candidate widths are capped at three per context, not four or five. Each distinct `WxH` makes PocketBase generate and store a new derived file on first request, so every extra candidate multiplies thumbnail generation work and `pb_data` disk. Three widths per context is the cost/benefit balance; the default `src` stays a width already in use so existing thumbs are reused rather than orphaned.

Reserved space comes from the aspect wrapper the layout already uses where one exists (`aspect-[4/5]`, `aspect-[3/4]`), and from `width`/`height` attributes carried on the media record where the layout is intrinsic (masonry). Media records must therefore expose stored dimensions; where they are absent the masonry falls back to a declared aspect box so the requirement is still met.

### 5. Static share metadata via Vite's HTML env substitution

Vite substitutes `%VITE_*%` placeholders in `index.html` at build time with no plugin required. Open Graph and Twitter tags go into `index.html` with the share image URL and canonical origin supplied as `VITE_SITE_URL` and `VITE_OG_IMAGE`, defaulting to a repo-served `/og-default.jpg`.

This is deliberately *site-wide*, not per-page: per-page previews would require rendering each route's metadata into its own HTML document, which is the prerendering decision the proposal defers. Site-wide tags take a blank preview to a correct one, which is the whole of the business problem; per-page precision is an optimisation on top.

The client-side `usePageSeo` behaviour is kept as-is for in-browser titles and script-capable crawlers, but is refactored so the meta-tag manipulation is written once instead of the four near-duplicate copies currently in `PublicContentPages`, `PortfolioPage`, `WorkDetailPage`, and `LegalPages`.

*Ops dependency.* `public/og-default.jpg` at 1200×630 is a binary asset that must be supplied from the photographer's own work; it cannot be authored in code. Until it exists the tags point at a missing file, so the Studio hint required by the `website-seo` delta doubles as the reminder.

### 6. Confirm dialog replaces bare destructive controls

One `ConfirmDialog` on the shared primitive, driven by a `useConfirm` hook returning a promise, so call sites read as a guard rather than a state machine:

```ts
if (!(await confirm({ title: 'Delete album?', body: …, confirmLabel: 'Delete', destructive: true })) ) return
```

The inline-panel pattern already in `LibraryPage` (~770–797) is genuinely better than a modal for the delete-with-copies case, because it needs to present a choice rather than a yes/no. It stays; `ConfirmDialog` covers the yes/no cases that currently have nothing.

Undo is not implemented. PocketBase deletes are immediate with no soft-delete column, so undo would need a schema change, which the proposal excludes.

### 7. Hand-rolled scroll reset; no router migration

A `ScrollReset` component inside `BrowserRouter` reads `useLocation` and `useNavigationType`: reset to top on `PUSH`/`REPLACE` without a hash, scroll to the element on a hash, and leave `POP` alone so the browser's own restoration applies.

Migrating to `createBrowserRouter` would give `ScrollRestoration` and `useBlocker` (the latter being the clean way to warn about unsaved Studio edits on navigation). It is rejected here because it rewrites the entire route tree — including the `RequireAuth` wrapper and nested layout routes — while this change is already touching most view files. Two structural rewrites at once is how regressions get missed.

*Consequence for unsaved changes.* Without `useBlocker`, navigation-away cannot be intercepted. Coverage is therefore: `beforeunload` for tab close/reload, and a dirty-guard on modal dismissal (backdrop click and Escape), which is where Studio editing actually happens. Full navigation blocking is deferred to a possible router-migration change.

### 8. Code splitting by route group, not by page

`React.lazy` boundaries at three points only: the Studio group, the Delivery route, and the legal pages. Splitting per page would fragment the public site, where cross-navigation is expected and each chunk is small. The `Suspense` fallback reuses the same skeleton primitives as the loading states, so a chunk fetch and a data fetch look alike rather than introducing a second visual language for waiting.

### 9. Palette additions, not palette changes

Two additions to the `@theme` block: a `--color-public-danger` role that meets 4.5:1 on the warm-dark surfaces (replacing the `text-red-700` misuse that measures ~3:1 there), and `color-scheme: dark` on `.public-shell` to fix browser-supplied control chrome. `--color-public-champagne` is removed as a duplicate of `--color-public-accent`.

Body-copy corrections are role reassignments only — `text-public-muted` → `street-body` where the content is sustained reading — with no change to either token's value, so the Soft night ladder in `public-soft-night` is unaffected.

## Risks / Trade-offs

- **Thumbnail generation load and disk growth.** → Cap candidates at three widths per context and keep an already-used width as the default `src`, so existing derived files are reused. Document `pb_data` growth in the ops notes alongside the existing backup guidance.

- **Touching most view files in one change.** → Tasks are phased so each phase ends at a passing production build, and phases are ordered so the highest-value, lowest-blast-radius fixes (caption save, load gates, submit guard) land first and can ship independently of the systemic phases.

- **Converging three dialogs onto one primitive can regress deliberate craft.** `ImageImmersive` is full-bleed and `PublicLayout`'s menu carries the film treatment. → The primitive owns behaviour (focus, inertness, lock, Escape) and imposes no layout or animation; each consumer keeps its own markup and classes.

- **`inert` has no effect in older browsers.** → Pair it with `aria-hidden` on the app root so assistive-technology isolation degrades gracefully; the Tab containment in the primitive does not depend on `inert` either way.

- **Adding pending state to the booking submit changes the highest-value path on the site.** → The guard is a ref checked at entry plus disabled state, not a rewrite of the submit flow, and the existing `submitPublicBooking` contract is unchanged.

- **Site-wide share previews mean every shared link shows the same photograph.** → Accepted for this change; it is strictly better than no photograph, and the `website-seo` delta is written so per-page precision can be added later without contradicting it.

- **`og:image` points at an asset that does not exist yet.** → The Studio hint required by the `website-seo` delta surfaces the gap to the photographer, and the ops task records it. A missing image degrades to a text-only preview, not a broken page.

## Open Questions

- Whether to later migrate to `createBrowserRouter` for `ScrollRestoration` and `useBlocker`. Deferrable: Decision 7 delivers the specified scroll behaviour without it, and the unsaved-changes gap is documented rather than silently accepted.
- Whether media records should persist intrinsic width and height at upload time so masonry can reserve exact space instead of a declared aspect box. Deferrable: it is a schema addition, and the declared-aspect fallback already satisfies the reserved-space requirement.
