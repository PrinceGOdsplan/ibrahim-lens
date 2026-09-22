## 1. Server proxy

- [x] 1.1 Env: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_RUM_SITE_TAG` in deploy compose + `.env.example`
- [x] 1.2 PocketBase `GET /api/ibrahim/site-analytics` (auth) → GraphQL rumPageloadEventsAdaptiveGroups; filter public paths; soft-fail when unset

## 2. Dashboard UI

- [x] 2.1 Fetch site analytics with Dashboard period; show Visits + top paths strip in Overview
- [x] 2.2 Quiet empty / unavailable states (no token or zero data)

## 3. Verify

- [x] 3.1 Signed-in request returns visits/top paths; guest 401; Dashboard strip renders without breaking desk pulse
