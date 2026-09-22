## Context

See proposal.md — Why. Standalone viewport pinning already exists but follows `visualViewport.offsetTop` even when the keyboard is closed, so nested scroll on form hubs feels like the tab chrome is dragging. Delivery shares are SPA-only, so messengers never see a gallery photo. Feedback after-create skips notify when `e.auth` is set. Badge is driven by in-app Realtime, independent of Web Push. Brand schema has `logo` only.

## Goals / Non-Goals

**Goals:**
- Idle standalone frame stays at top 0 / full visible height; only follow visualViewport while a field is focused (keyboard).
- Phone tab strips wrap or contain overscroll so they do not drag the shell.
- Caddy routes social crawlers on `/g/:token` to a PocketBase HTML response with OG tags + first delivery photograph.
- Feedback notify runs when `@request.query.token` is present.
- Push subscribe always posts the device secret to the SW; test push and event push show tray UI.
- `brand_settings.favicon` + Settings UI + public `<link rel="icon">`.

**Non-Goals:**
- Full SSR for the Delivery SPA.
- Changing default Mobile matrix values.
- New native app store packaging.

## Decisions

1. **Viewport:** Apply `--studio-vv-offset-top` / height from `visualViewport` only while a typing target is focused; otherwise `0` / `window.innerHeight`. Keeps `overlays-content` intent without idle rubber-band.
2. **Tabs:** On phone, non-grid tab lists use `flex-wrap` + `overscroll-behavior: none` instead of horizontal `overflow-x-auto` rubber-banding.
3. **Delivery OG:** New `GET /api/ibrahim/delivery-og/{token}` returns minimal HTML. Caddy matches bot User-Agents on `/g/*` and rewrites to that route. Image URL uses existing `/api/ibrahim/delivery-file/...`.
4. **Feedback:** After-create notifies when query token is present, regardless of auth; skip only for Studio creates without token.
5. **Push:** After subscribe/save, re-post secret via `navigator.serviceWorker.ready` + `controller`/`active`; ensure `showNotification` always runs on push (already does). Surface last push error on notices settings when enqueue fails.
6. **Favicon:** File field on `brand_settings`; public layout reads brand record (already public listRule) and sets icon link.

## Risks / Trade-offs

- [Risk] Bot UA list incomplete → Mitigation: include WhatsApp, facebookexternalhit, Twitterbot, Slackbot, TelegramBot, Discordbot, LinkedInBot, Applebot; humans still get SPA.
- [Risk] Flex-wrap makes Settings tabs two lines → Acceptable vs horizontal drag.
- [Risk] Favicon SVG/ICO mime variance → Accept png/jpeg/webp/svg/ico in schema mimeTypes.
