## Context

See proposal.md for why. Studio already has a `/studio` manifest, a worker, and Settings Mobile checkboxes, but iOS never gets a complete install: Apple tags and the manifest are injected only after signed-in `StudioLayout` mounts; login is a separate route; inputs are `text-sm` (iOS page-zooms); phone hubs use a drawer; `StudioTabs` wrap; VAPID is still a commented placeholder in env examples. Public `index.html` must stay free of the Studio manifest so marketing pages keep pinch-zoom.

## Goals / Non-Goals

**Goals:**
- One Studio PWA head used by login and hubs (manifest, Apple standalone tags, touch icon, Studio theme-color, worker register, Studio-only viewport lock).
- Phone = bottom hub bar; desktop sidebar unchanged.
- One-line hub tabs on ~390px; 16px Studio fields; no pinch/double-tap zoom inside Studio.
- Working iOS push (tap + VAPID + payload Apple will deliver).
- App shell cache, iOS splash, maskable icon, shortcuts, badge, light vibrate/haptic where the OS allows.

**Non-Goals:**
- Vite-on-LAN phone workflow, public PWA, caching photo files, Capacitor/App Store this change.

## Decisions

### 1. PWA head is a Studio-only runtime helper, not `index.html`
Public and Studio share one HTML shell. Putting `apple-mobile-web-app-capable` and the Studio manifest in `index.html` would make marketing Add to Home Screen a fullscreen fake app and could lock public photo zoom.

**Choice:** A small helper mounted from `StudioLoginPage` and `StudioLayout` that sets `manifest`, `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` (`default` — light Studio), `apple-mobile-web-app-title`, overrides `theme-color` to `#F7F7F5`, and sets the viewport to `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`. On unmount, restore the public viewport and theme-color and remove Studio tags.

**Alternatives considered:** Second HTML entry (rejected — one Vite app). Global tags (rejected — public install and public zoom).

### 2. Phone hubs are a six-item bottom bar
Hamburger + drawer still reads as a website. Six hubs at ~65px each with icon + short label, `min-h-11`, `padding-bottom: env(safe-area-inset-bottom)`. Remove the phone drawer. Header keeps notices + profile. Settings stays on the bar (hiding it in profile would bury it).

**Alternatives considered:** Five hubs + Settings only in profile (rejected — discoverability). Keep drawer and only polish PWA metas (rejected — does not address “feels like a website”).

### 3. Tabs: drop icons under `md`, never wrap
Icons + `px-3` + header `px-5` overflow 350px of content width. Phone: no tab icons, tighter padding, `flex-nowrap`. If a strip is still wide, `overflow-x-auto` on the strip only. Shorten “Portfolio tags” to “Tags” on the Settings strip at phone width (full name remains the heading).

**Alternatives considered:** Always wrap (current — rejected). Scroll-only with icons (rejected — four Gallery words fit without icons).

### 4. Lock Studio scale; keep 16px fields
Installed apps do not pinch-zoom. On Studio routes: `maximum-scale=1`, `user-scalable=no`, and `touch-action: manipulation` on the shell (kills double-tap zoom). Public and `/g/` restore the open viewport. Keep 16px fields so a Safari tab of Studio still does not auto-zoom on focus. Do not lock zoom on public photographs.

### 5. Push: tap + VAPID + payload Apple will keep
`subscribeStudioPush()` in a `useEffect` is ignored on iOS. Keep Settings → Allow phone notices as the permission path; do not rely on load. Generate a VAPID pair (`scripts/vapid-keys.ts`), set `VAPID_*` on PocketBase and `VITE_VAPID_PUBLIC_KEY` on the web image rebuild. If empty-body Web Push is dropped, send a minimal visible payload (or the pending title/body) so the worker still runs.

Register the worker from the login page as well so a cold start signed-out still has `/studio/` scope.

**Alternatives considered:** Subscribe on every standalone load (keep as a no-op extra on Android only if it does not prompt; iOS path is the button). FCM (rejected — stack).

### 6. App shell cache, not a photo CDN
Extend `/studio/sw.js` to precache Studio static assets (hashed `/assets` used by Studio, `manifest`, icons, splash). Navigation under `/studio` falls back to the cached shell. Bypass `/api/`, `/api/files/`, and public routes. No `vite-plugin-pwa` on the marketing site.

### 7. Splash, icon, shortcuts
Add `apple-touch-startup-image` for the iPhone sizes we care about (13 Pro class 1170×2532 plus current 14/15/16 logical sizes), Studio light ground + mark — not a PNG per every iPad. Manifest: `background_color` / `theme_color` `#F7F7F5`, icon `purpose: "any maskable"` (or a second maskable file), shortcuts to `/studio`, `/studio/gallery`, `/studio/bookings`.

### 8. Badge + light haptics
`navigator.setAppBadge(n)` / `clearAppBadge()` from the existing in-app unread count. `navigator.vibrate` on bottom-bar hub change and on new in-app notice (short). iOS often no-ops vibrate; that is accepted until a later Capacitor shell. Failure must not block navigation.

### 9. Re-add the home screen icon after deploy
If the current icon was created from Safari without standalone tags, iOS will not grant Web Push. README: delete the old icon, open `https://ibrahimlens.com.ng/studio` (or login), Share → Add to Home Screen.

### 10. Capacitor is a later change
True Taptic Engine, App Store listing, and APNs need a native wrapper. That is a new change (store, signing, a second install path). This change stays the VPS PWA.

## Risks / Trade-offs

- **[Risk] Six bottom labels crowd a 390-wide phone** → Mitigation: stacked icon + 10px label, truncate with the hub name as `title`; do not drop Settings.
- **[Risk] Existing home-screen icon stays a bookmark** → Mitigation: README re-install; in-app copy when `standalone` is false.
- **[Risk] VAPID on VPS but forgotten on the frontend build** → Mitigation: both keys in deploy env; web build must receive `VITE_VAPID_PUBLIC_KEY`; Settings shows “not configured” if the public key is missing.
- **[Risk] Apple still drops the ping** → Mitigation: spike the payload in hooks; Email channel remains the fallback.
- **[Risk] Bottom bar eats wall height** → Mitigation: bar is ~49px + inset; Gallery wall already scrolls inside the leftover pane.
- **[Risk] `user-scalable=no` is ignored in Safari tabs** → Mitigation: 16px fields + `touch-action: manipulation`; the lock is for installed standalone, which iOS does honour.
- **[Risk] App-shell cache serves a stale Studio after deploy** → Mitigation: hashed `/assets` filenames; worker updates on `skipWaiting` / `clients.claim` as today; bump cache name when the shell strategy changes.
- **[Risk] iOS vibrate is a no-op** → Mitigation: do not block UX; Capacitor later if Taptic is required.

## Migration Plan

1. Ship frontend + Caddy worker headers if required (`Service-Worker-Allowed` `/studio/` if scope needs it).
2. Generate VAPID once; put private key only on PocketBase env; public key on PocketBase and the web build; recreate the web container.
3. Confirm Settings → Allow phone notices on a fresh Add to Home Screen from `/studio`.
4. Rollback: revert deploy; old drawer returns; push stays as broken as today. No schema migration. Existing `push_subscriptions` rows remain valid if the VAPID pair is unchanged; a new pair invalidates old subscriptions (photographer taps Allow again).

## Open Questions

None that block this design. Confirm on the 13 Pro after VPS deploy: standalone, no pinch-zoom, one-line Gallery tabs, login without auto-zoom, splash, badge, one test Mobile notice.
