## Context

Library is the media spine. Deliveries UI lives in Clients but selects Library entities.

## Goals / Non-Goals

**Goals:** One upload pool; size limits; originals+thumbnails; Portfolio/albums/Work; tags in Settings; Work private by default.  
**Non-Goals:** Delivery tokens UI; CMS; watermarks; email.

## Decisions

- Max upload: env `MAX_UPLOAD_MB` default **25**
- Store original + generate thumbnails
- **No watermarks in v1**
- Tags: **Settings → Portfolio tags**
- Work: `showOnWebsite` default false
- Image files in PocketBase `pb_data` (backup with volume)

## Risks / Trade-offs

- Without watermarks, leaked Portfolio/Delivery images are unmarked — accepted for v1
- Multi-membership needs clear badges/filters

## Migration Plan

N/A

## Open Questions

- Allowed MIME types default: jpeg, png, webp (finalize at apply)
