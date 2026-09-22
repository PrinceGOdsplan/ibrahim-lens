## Why

The Studio PWA shell fix stopped at Gallery: Clients, Website, and Settings tabs still drift on an installed iPhone. Delivery share links show no photograph in messengers, guest feedback often never reaches the photographer when Studio is signed in on the same browser, Mobile tray notices stay quiet while the home-screen badge updates, and Brand has a logo control with no matching favicon upload.

## What Changes

- Pin the standalone Studio frame so hub tab chrome on Clients, Website, and Settings no longer rubber-bands with visualViewport offset when the keyboard is closed; keep tab strips from horizontal rubber-band drag on phone.
- Serve crawler-facing Open Graph HTML for `/g/:token` so a Delivery share link can show a gallery photograph preview (not only the marketing default).
- Always create the photographer Feedback inbox + notices when Delivery feedback is submitted with a valid guest token, even if a Studio session cookie is present.
- When Mobile is on and a push subscription exists, Web Push must produce an OS tray notice (not only the in-app badge); tighten subscribe/test path so phone tray is reachable.
- Settings → Brand: upload a site favicon beside the brand logo; public pages use that favicon when set.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `studio-app-shell`: Standalone phone hubs keep tab chrome stable (no viewport drag) on Clients, Website, and Settings as well as Gallery.
- `client-gallery`: Delivery share links expose photograph preview metadata to link unfurlers; guest feedback with a token always notifies Studio.
- `studio-notifications`: Mobile Web Push must show an OS tray notification when Mobile is enabled and the device is subscribed; badge alone is not enough.
- `admin-settings`: Brand settings include a favicon upload beside the logo; public pages use it when set.

## Non-goals

- Capacitor / App Store shell.
- Making `/g/` installable or disabling pinch-zoom on Delivery photographs.
- Per-story OG for Work (already specified separately); this change covers Delivery token links.
- Changing Soft night public craft beyond favicon + Delivery share meta.
- Turning Mobile on by default for every notice event (matrix stays photographer-controlled).

## Impact

- `studio-standalone-viewport.ts`, `StudioTabs.tsx`, Studio hub headers.
- Caddy + PocketBase hook for Delivery OG HTML; delivery_feedback after-create notify path.
- `00_vapid.pb.js` / SW push path / Settings Allow phone notices flow.
- `brand_settings` schema + Settings Brand UI + `index.html` / public layout favicon.
