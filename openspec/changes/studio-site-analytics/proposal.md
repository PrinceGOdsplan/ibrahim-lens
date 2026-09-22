## Why

Cloudflare Web Analytics is live for ibrahimlens.com.ng, but the photographer has to leave Studio to see visits. A quiet Dashboard strip for visits and top pages keeps desk pulse and site interest in one place without cloning the Cloudflare UI.

## What Changes

- Add an authenticated Studio API that returns period visit counts and top public paths from Cloudflare Web Analytics (RUM).
- Show a small “Site” strip on Studio Dashboard Overview (visits + top pages) driven by the shared period control.
- Soft-fail when the Cloudflare token is missing or the API errors — Dashboard desk data still loads.
- Document `CLOUDFLARE_API_TOKEN` (and account/zone/site tags) in deploy env examples only — never bake into the Vite client.

## Capabilities

### New Capabilities
- `studio-site-analytics`: Studio surfaces Cloudflare Web Analytics visits and top pages on Dashboard via a server-side proxy.

### Modified Capabilities
- `admin-dashboard`: Overview MAY include a Site visits strip (visits total + top paths) for the selected period.
- `site-health`: Clarify that a thin marketing visits strip on Dashboard is allowed; Studio still MUST NOT become an APM/observability hub.

## Impact

- `deploy/pb_hooks` (new authenticated route)
- Studio Dashboard page + pulse loader
- `deploy/.env.example` / Compose env for Cloudflare token + account/site tags
- No public-site UI change; no Core Web Vitals in this change
