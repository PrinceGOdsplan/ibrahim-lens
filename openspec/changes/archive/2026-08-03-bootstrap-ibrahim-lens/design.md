## Context

Greenfield Ibrahim Lens. Develop **locally now**; deploy to a **VPS later** without changing the core stack.

## Goals / Non-Goals

**Goals:** App shell, `/studio` IA, PocketBase auth, seed script for photographer, design tokens, Compose runtime.  
**Non-Goals:** Feature CRUD; SaaS backends; email provider; requiring a VPS for development.

## Decisions

### Core stack (stable local → VPS)
- **Frontend:** React + Vite + TypeScript + Tailwind
- **Studio components:** shadcn/ui
- **Backend:** PocketBase (auth, DB, file storage)
- **Orchestration:** Docker Compose (PocketBase + web; Caddy on VPS)
- **First photographer account:** **seed script** creates the Studio user from env (email/password) for local and VPS
- **Local → VPS:** same Compose; domain + Caddy TLS + volumes only

### Ops
- Document Compose ports in README
- **Backup `pb_data`** (database + uploaded files) is mandatory ops guidance

### Product shell
- Studio: `/studio`; hubs Dashboard, Library, Website, Clients, Settings
- Public nav: Home, About, Portfolio, Work, Contact + legal pages (Privacy, Terms)
- Auth: email + password; post-login Dashboard
- `/g/:token` reserved for Deliveries

### Visual design (quiet luxury)
- Public: `#0B0B0C` / `#F4F1EA` / accent `#C4A574`
- Studio: `#F7F7F5` / `#1A1A1A`
- **No watermarks** on public or delivery images in v1 (originals stay clean)
- Library keeps **originals + thumbnails** for performance

## Risks / Trade-offs

- PocketBase is long-term core (intentional)
- Large originals need disk planning; thumbnails mitigate Studio/public grid load
- Skipping watermarks means shared/public images are unprotected visually — accepted for v1 simplicity

## Migration Plan

1. Now: Compose + PocketBase + Vite + seed script locally  
2. Later: same Compose on VPS; DNS; Caddy; persistent `pb_data` volume + backups  
3. No architecture rewrite for hosting move  

## Open Questions

- Exact max upload size default (suggest 25MB per file unless overridden in env) — apply with env `MAX_UPLOAD_MB=25`
- Exact max services package entries (suggest 12) and booking questions (8)
