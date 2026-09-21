## Context

Public site consumes Library visibility and Website content/forms. Legal pages support contact/booking collection.

## Goals / Non-Goals

**Goals:** Few public routes; Work≠Portfolio; booking on Home (scroll) + Contact; Privacy/Terms.  
**Non-Goals:** Studio editors; watermarks; delivery creation UI.

## Decisions

- Home Book CTA **scrolls** to booking form section on Home (form also on Contact)
- Legal: `/privacy`, `/terms` linked in footer
- No watermarks on public images

## Risks / Trade-offs

- Legal copy may start as editable placeholders in Website globals or static markdown — prefer editable later; v1 can ship placeholder text the photographer replaces

## Migration Plan

N/A

## Open Questions

- Whether legal body copy is CMS-edited in Website or static files (default: Website globals/legal fields)
