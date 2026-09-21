## Why

Studio can be added to the iPhone home screen, but it still behaves like a Safari tab: first open often arrives zoomed, hub tabs wrap on a 13 Pro even when the words would fit one line, Mobile notices never complete (standalone metas, login outside the shell, push permission without a tap, VAPID unset), and phone navigation is a hamburger drawer. The photographer already works from the installed icon; the install should feel and function as the Studio app.

## What Changes

- Treat every `/studio` route — including login — as the Studio app surface: same light shell, safe-area, PWA head (manifest, Apple standalone tags, Studio theme-color, touch icon), and service worker registration. Public Soft night and `/g/` stay ordinary websites and keep pinch-zoom for photographs.
- On phone-width viewports, replace the hamburger drawer with a persistent bottom hub bar (Dashboard, Gallery, Website, Bookings, Clients, Settings), sitting above the home-indicator inset. Desktop sidebar is unchanged.
- Hub tab strips (Gallery rooms, Settings, and the same idiom elsewhere) stay on one line on phone: drop tab icons at that width, tighten padding, do not wrap. If a strip is still wider than the pane, it scrolls horizontally as a strip — the work surface itself still must not require sideways page scroll.
- Installed Studio (and Studio on a phone viewport) SHALL NOT pinch-zoom or double-tap-zoom like a web page. Fields still use at least 16px so a Safari tab does not auto-zoom on focus either.
- Make Mobile notices actually reachable on iOS: detect standalone correctly, request push from a tap (Settings already has “Allow phone notices”), generate and set VAPID on the VPS so the production build has `VITE_VAPID_PUBLIC_KEY`, and verify Apple accepts the empty-body Web Push ping (fix the payload if it does not).
- App-like extras on the Studio install: cache the Studio shell for a fast reopen / brief offline, iOS launch splash images, home-screen badge from unread in-app notices, light haptic/vibration on hub change and notices where the OS allows it, maskable icon, and manifest shortcuts (Dashboard, Gallery, Bookings).
- After deploy, the photographer must re-add Studio to the home screen from a signed-in `/studio` page if the current icon was created as a Safari bookmark.

## Capabilities

### New Capabilities

- `studio-pwa`: Studio-only home-screen install, iOS standalone chrome, login inside that chrome, no page zoom, app-shell cache, splash, shortcuts, and Web Push that can complete on an installed iPhone.

### Modified Capabilities

- `studio-app-shell`: Phone hub navigation is a bottom bar, not a drawer; hub tab strips stay one line; Studio fields do not trigger browser page-zoom on focus; hub chrome padding fits a 390-wide phone; light haptics on hub changes where the platform allows.
- `studio-notifications`: Mobile column and push subscribe require a real standalone install plus a user gesture; production must have VAPID; empty-body push must actually wake iOS; unread count can show as a home-screen badge.

## Impact

- `index.html` stays public-safe (no Studio manifest on marketing pages). Studio login and `StudioLayout` share a PWA head helper that also locks the Studio viewport scale.
- `StudioLayout` phone chrome: bottom tabs, safe-area, drop hamburger drawer, optional vibrate.
- `StudioTabs`, `StudioHubHeader`, `Input`, Gallery search, login fields.
- `public/studio/manifest.webmanifest` (shortcuts, maskable), splash assets, `studio-pwa.ts`, `sw.js` (app-shell cache), Caddy worker headers if needed.
- `deploy/.env` on the VPS (VAPID pair) and the production frontend build (`VITE_VAPID_PUBLIC_KEY`). Hooks may need a non-empty push body.
- README: re-install from `/studio` after this ships; VAPID is required for Mobile.

## Non-goals

- Opening the Vite dev server on a physical phone (LAN host, HTTPS, phone-reachable PocketBase URL). Phone checks happen on the VPS.
- Making the public site or Delivery galleries installable, or disabling pinch-zoom on those photo surfaces.
- Caching Library originals or thumbs in the worker (shell and static Studio assets only).
- Capacitor, App Store, or TestFlight — that is a later native-shell change if store listing or true Taptic haptics are wanted. This change stays a PWA on the existing VPS.
- Changing which notice events exist, SMTP, or PocketBase as the backend.
- Periodic background sync, Web Share Target, or a full Workbox / `vite-plugin-pwa` rewrite of the public site.
