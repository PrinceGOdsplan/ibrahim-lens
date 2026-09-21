## Context

Dashboard already has a hybrid instrument (Collected SVG series, chips, week blotter, frames) from `studio-product-language`. It still feels thin on busy weeks. Explore locked: Study first, Radar second; more chart types (volume, mix, funnel); Needs-you with name + time + one-line reason; no chart npm package; frontend-only aggregation.

## Goals / Non-Goals

**Goals:**
- Dense Study-first first viewport that rewards lingering and comparison.
- Morning Radar with a short actionable Needs-you list plus blotter.
- Handmade SVG charts only; reuse existing loads (`listBookings`, money events, deliveries, inquiries, feedback, media).

**Non-Goals:**
- Schema/seed/`pb_data` work.
- Chart libraries.
- Message/feedback body text on Dashboard.
- Restoring greeting / lifetime stacks as the lead.

## Decisions

1. **Layout** — Single scroll: Study block (hero + micro-stats + collected series + volume series + mix + funnel), then Radar (Needs-you + blotter), then frames. Desktop may use a 2-col Study grid for mix|funnel; phone stacks.
2. **Vs-prior** — For 7d/30d, compute collected in the equal prior window; show ▲/▼ % or absolute ₦. For All, omit delta.
3. **Volume** — Bucket hub bookings by `created` (demand) daily/monthly same as money series; label “Bookings”.
4. **Mix** — Live counts: pending, confirmed, unpaid (among hub bookings). Horizontal bar or segmented bar SVG.
5. **Funnel** — Period counts: needs_contact created; hub bookings created; money_changed or amount_paid>0; deliveries created; feedback inquiries created. Simple step bars.
6. **Needs-you** — Cap ~6 rows; priority unpaid → requests → expiring → unread messages → unread feedback; href into hubs; reason one short phrase.
7. **Chips** — Fold into Study micro-stats; drop the loose chip row or keep only if redundant after micro-stats (prefer micro-stats).
8. **Config** — Update Product IA Dashboard line in `openspec/config.yaml`.

## Risks / Trade-offs

- Denser page can feel busy — mitigate with clear Study/Radar section labels and one visual language.
- Funnel definitions are approximate (created-in-period, not true state transitions) — acceptable for v1; label honestly.
- Prior-period for All is awkward — omit delta rather than invent a window.
