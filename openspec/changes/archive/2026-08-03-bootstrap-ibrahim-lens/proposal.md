## Why

Ibrahim Lens needs a clean greenfield foundation so Studio and the public site share one shell, routing, and photographer auth — on a stack that runs locally now and on a VPS later without replacement.

## What Changes

- Scaffold React + Vite + TypeScript + Tailwind with locked luxury design tokens
- Docker Compose + PocketBase for local backend (same core for future VPS)
- Seed script to create the photographer Studio account from env
- Document Compose ports and `pb_data` backup
- Public chrome: Home, About, Portfolio, Work, Contact + Privacy/Terms routes
- Studio at `/studio` with five hubs; email/password via PocketBase; post-login Dashboard
- Reserve `/g/:token` for deliveries

## Capabilities

### New Capabilities
- `app-shell`: Public and Studio shell, routing, branding, design tokens, legal routes placeholders
- `admin-auth`: Photographer email/password auth (PocketBase), Studio protection, seedable first user

### Modified Capabilities
- (none)

## Impact

- New application + Compose/PocketBase local runtime
- Non-goals: feature CRUD, SaaS backends, email provider, watermarks
