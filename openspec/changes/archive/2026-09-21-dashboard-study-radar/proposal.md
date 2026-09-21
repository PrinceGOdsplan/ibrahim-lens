## Why

The hybrid Dashboard looks calm but still feels thin even on busy weeks: one money series, chips, and a blotter do not reward studying the business or checking morning work. The desk needs a denser Study-first composition with more chart types and a short actionable Needs-you radar, while keeping the light product language.

## What Changes

- Rebuild Dashboard as **Study first, Radar second**: period-bound analytics in the first viewport, then morning ops.
- **Study**: Collected hero + series with vs-prior-period delta; volume series (shoots/requests); pipeline mix chart; funnel chart; micro-stats (collection %, booked, outstanding, avg fee).
- **Radar**: short Needs-you list with client first name, time when known, and one-line reason (request / unpaid / expiring / message / feedback); keep week blotter; frames stay secondary.
- Soften the prior “no roster” rule: short actionable rows allowed; still no message or feedback body text on Dashboard.
- Period control continues to drive Study metrics; blotter and Needs-you stay live-now.
- No new chart npm dependency — handmade SVG as today.
- Update `openspec/config.yaml` Product IA Dashboard line to match.

## Non-goals

- No PocketBase schema, seed, or `pb_data` backup work — frontend aggregation only.
- No message/feedback body previews on Dashboard (Inbox owns that).
- No full Looker-style analytics product or chart library.
- No restoring lifetime count stacks as the first glance or the photographer greeting hero.
- No 24h period preset.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `admin-dashboard`: Replace thin hybrid instrument with Study-first + Radar desk (more charts, micro-stats, Needs-you roster, denser composition).

## Impact

- `src/lib/dashboard.ts` — derive volume series, prior-period delta, mix, funnel, micro-stats, Needs-you rows.
- `src/pages/studio/DashboardPage.tsx` — Study + Radar layout and handmade SVG charts.
- Possibly `src/lib/bookings.ts` / clients helpers for prior window and funnel steps.
- `openspec/config.yaml` Design / Product IA Dashboard wording.
- Assistant `get_desk_pulse` may expose week / attention / new study summary shape if it still reads pulse fields.
