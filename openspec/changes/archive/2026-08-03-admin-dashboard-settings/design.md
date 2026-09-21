## Context

Dashboard is Studio home after login. Portfolio tags live in Settings. Email deferred.

## Goals / Non-Goals

**Goals:** Rich operator console; account + portfolio tags; later email extension only.  
**Non-Goals:** Resend UI, charts farm, watermarks, action logs, PWA.

## Decisions

- Activity preview shares Inbox event stream
- Needs you hero; expiring soon = Deliveries within last 24h before 7-day end (display threshold only)
- Settings hub includes Portfolio tags

## Risks / Trade-offs

- Empty-safe zeros when hubs have no data

## Migration Plan

N/A

## Open Questions

- None material
