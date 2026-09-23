## Context

See proposal.md for motivation. Delivery guest bytes go through `GET /api/ibrahim/delivery-file/...` because standard `delivery_files` downloads reject guests. That route currently uses `$os.dirFS` only. Photographer booking/Write after-create hooks return early when `e.auth` is set. In-app notices live only in the header bell. CRM list helpers use `getFullList`.

## Goals / Non-Goals

**Goals:**
- One storage-aware serve path for Delivery preview + download
- Public inbound notices that ignore Studio cookies on the request
- Visible in-app toast while Studio is focused
- Bounded list loading with Load more on Bookings/Clients hubs

**Non-Goals:**
- Migrating historical delivery blobs between disks
- Changing notice matrix defaults or SMTP setup
- Infinite-scroll redesign for Website CMS editors

## Decisions

1. **Filesystem serve over local-only `fileFS`**  
   Use `$app.newFilesystem().serve(response, request, fileKey, name)` so local and R2 both work. Try delivery key (and thumb key), then fall back to linked `media` key. Keep `dl=1` → `Content-Disposition: attachment`.  
   Alternative considered: read bytes into `e.blob` — worse for large originals and Range support.

2. **Notify by event shape, not by `!e.auth`**  
   For `bookings` with `source=website` and `form_inquiries` with `kind=contact`, always call `notifyPhotographerEvent` after create. Keep delivery feedback’s guest-token gate.  
   Alternative: strip Studio cookie on public forms — fragile and breaks photographer “try as client” flows.

3. **Toast layer on top of existing bell**  
   `useStudioNotices` exposes the newest undismissed item; `StudioLayout` shows a short-lived banner that links/dismisses like the menu. Bell + badge stay.  
   Alternative: OS `Notification` while focused — noisy and permission-gated; toast matches “show when Studio is open”.

4. **Batched `getList` helper + hub Load more**  
   Shared `listCollected` (page size 100, hard cap for Dashboard). Bookings/Clients hubs keep local page state and a Load more control. Library media wall unchanged.  
   Alternative: server-side search endpoints — out of scope.

## Risks / Trade-offs

- [Missing delivery blob and deleted media] → gallery still 404; mitigated by fallback only when media exists  
- [Toast fatigue] → one banner, auto-hide, respects In-app channel off  
- [Dashboard cap truncates lifetime “all” math] → accept bounded window; period filters still apply client-side on the fetched set

## Migration Plan

Deploy hooks + frontend together. No schema migration. Rollback = previous hook + SPA build. After deploy, verify `/g/:token` thumbs and `?dl=1` on a live Delivery known to use R2.
