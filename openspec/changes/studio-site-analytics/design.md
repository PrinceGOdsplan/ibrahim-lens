## Context

Web Analytics auto-install is live. Studio Dashboard already has Overview charts from PocketBase. Photographer chose **visits + top pages only** (no Core Web Vitals).

## Goals / Non-Goals

**Goals:** Authenticated server proxy to Cloudflare GraphQL RUM; Dashboard Overview strip with period visits and top public paths; soft-fail without token.

**Non-Goals:** Core Web Vitals; edge Analytics (bandwidth/threats); public analytics; client-side CF token; new Studio hub.

## Decisions

1. **API:** `GET /api/ibrahim/site-analytics?period=7d|30d|all` (Studio auth). PocketBase calls Cloudflare GraphQL `rumPageloadEventsAdaptiveGroups` with `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_RUM_SITE_TAG`.
2. **Metrics:** Total = `sum.visits`. Top paths = `count` (page views) grouped by `requestPath`, public paths only (`/`, `/about`, `/portfolio`, `/work…`, `/contact`, `/privacy`, `/terms`). Exclude `/studio`, `/g/`, `/api`, `/_`, `/assets`.
3. **UI:** One quiet strip under Overview (after Today or after Revenue) — visits number + short top-path list. Same period control as Overview. Link “Open in Cloudflare” optional.
4. **site-health:** Document that this thin marketing strip is allowed; still no APM hub.

## Risks / Trade-offs

- [Risk] Token scopes / rate limits → Mitigation: cache response ~5 minutes in hook memory or soft-fail.
- [Risk] Adaptive sampling makes counts approximate → Mitigation: label quietly (“approx.” not required; CF does the same).
- [Risk] site-health conflict → Mitigation: explicit delta wording.
