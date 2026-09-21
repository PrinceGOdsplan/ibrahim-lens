## Context

See proposal.md for why. Today `StudioLayout` stacks a full-width product header (name, appearance, notices, profile) on a white rail and a second hub toolbar. Dashboard is `DashboardPage` + `loadDashboardPulse`: greeting, 24h·7d·30d·All, lifetime earned plane, pulse list, coming-up names, six count stacks. `booking_events` already carries `money_changed`. `listMediaPage` already pages Gallery by `-created`. `studio-phone-app` (in flight) puts hubs on a phone bottom bar and keeps a compact header for notices/profile. Light tokens stay `#F7F7F5` / `#1A1A1A`; night stays Soft-night–related opt-in. No new backend.

## Goals / Non-Goals

**Goals:**

- One desktop chrome tree: rail + page. One phone tree: compact operator strip + page + bottom bar.
- Shared page recipe and a breathing content width so every hub wears the same furniture.
- Dashboard instrument from data we already load or can page (events, upcoming shoots, Gallery thumbs).
- Map stored `24h` desk period to `7d` without a migration script.

**Non-Goals:**

- New PocketBase collections, seed, or `pb_data` backup changes.
- Chart npm package, boxed field language, or public / Delivery restyle.
- Replatforming Website or Gallery internals beyond the shell and one surface.

## Decisions

### 1. Desktop: fold the product header into the rail

**Choice:** Remove the desktop full-width header. `StudioLayout` aside owns hubs (top) and appearance / notices / profile (foot). Collapse still persists. Product name is not a second title bar; document title and the page H1 remain the hub.

**Why:** Light Resend is rail + page. The stacked white bars are the CMS tell.

**Alternatives considered:** Keep the header and only restyle it (rejected — still three chromes). Dark-first canvas (rejected — photographer uses Resend on light; spec default stays light).

### 2. Phone: compose with the bottom bar, do not fight it

**Choice:** Phone keeps a compact operator strip (appearance, notices, profile) that does not name the hub. Hubs stay on the bottom bar from `studio-phone-app`. Do not restore a hamburger. If that change is not merged yet, implement the strip so it can sit above a bottom bar and does not assume a drawer.

**Why:** Phone has no rail; operator chrome still needs a home. A hamburger would undo the phone-app work.

**Alternatives considered:** Phone-only product header that still says “Ibrahim Lens” (rejected — names the product, not the hub, and eats height). Putting notices only in Settings (rejected — buried).

### 3. Page recipe lives in existing hub chrome

**Choice:** Keep `StudioHubHeader` as the pinned title / tabs / actions row. Switch the H1 from `font-display` to Figtree. `StudioScrollPane` inner width caps on wide desktop (e.g. `max-w-6xl` + horizontal auto margins) so the surface can breathe. Other hubs wrap their existing body in one rounded work surface (`bg-studio-panel`, ~12–16px radius, hairline). Gallery wall is the surface — do not wrap thumbs in a second card. Website accordion stays, inside the surface.

**Why:** Spec is one recipe, not a rewrite of every hub. Website is still a CMS.

**Alternatives considered:** New layout primitives per hub (rejected — churn). Recharts / a card grid for every hub (rejected — cages again).

### 4. Tokens stay; rail is the painted light sidebar

**Choice:** Do not retune `#F7F7F5` / panel / accent. On light, the rail uses `studio-panel` (or the page ground if the page is panel — the split must be visible: painted rail, quieter page). Night token ladder unchanged. No mint. Chart stroke uses `studio-fg` or `studio-accent` so it holds on both modes.

**Why:** Studio light is already in Resend-light’s color neighborhood. Structure is the copy.

**Alternatives considered:** Cool gray Radix scale (rejected — fights Soft night kinship). Night as default (rejected).

### 5. Dashboard data: bucket events, keep week and frames off the period

**Choice:** Extend the pulse loader (same `settleAll`) with (a) daily or monthly buckets from existing `money_changed` deltas — 7d and 30d daily, All as monthly points covering the last twelve months while the hero number is lifetime collected; (b) upcoming shoots as a seven-day spatial blotter from local day-start (already `upcomingShoots`, horizon 7d); (c) `listMediaPage` Gallery vault, `sort: date`, 8–12 items. First name = first whitespace token of the person name. Attention chips: Booked and Outstanding always; requests / unpaid / messages / feedback / expiring only when the count is > 0. Persist period in `studio-desk-period`; `parseDeskPeriod('24h')` becomes `7d`.

**Why:** One series matches the hero. Week and frames stay “now” so the page has something to sit with when the week’s money is quiet.

**Alternatives considered:** 24h hourly series (rejected — usually flat). Mon–Sun calendar week (rejected — dead on Sunday). Lifetime earned as the hero (rejected — ignores the period). Two-line Booked+Collected (rejected — sparse). Count stacks under the fold (rejected — third hero).

### 6. Handmade SVG series, no new dependency

**Choice:** One accessible area/line (title, tabular ₦, hover or focus to a day/month + amount). Empty window = ₦0 + flat baseline. No Recharts/visx.

**Why:** One series does not justify a library; default chart chrome would look rented.

**Alternatives considered:** CSS bars (rejected — weaker linger). New npm chart (rejected — proposal non-goal).

### 7. Sequence in the tree: shell, then instrument, then wrap

**Choice:** Land rail + page recipe + title type first so Bookings/Clients already feel like the product. Then rewrite Dashboard. Then wrap remaining hubs in the one surface if they still read as a pile of cages.

**Why:** A mega rewrite of every hub plus the instrument stalls. The shell is the language; Dashboard is the first page that uses it fully.

### 8. Config Design / IA follow the desk

**Choice:** On implement, edit `openspec/config.yaml` Design and Product IA: Studio light product language (rail + page, Figtree titles); Dashboard is the hybrid instrument; night remains opt-in; header toggle wording becomes rail / phone strip.

**Why:** The next change will otherwise re-assert pulse desk and Cormorant titles.

## Risks / Trade-offs

- **[Risk] `studio-phone-app` still in flight** → Implement phone chrome so a bottom bar can exist; do not reintroduce a drawer. Merge order: phone-app first if both land, or this change’s phone strip is compatible either way.
- **[Risk] Sparse series looks empty** → Flat ₦0 is specified; week and frames carry the glance. All-time monthly buckets give shape when 7d does not.
- **[Risk] First names on Dashboard vs old privacy rule** → Spec allows first name + time on the blotter only; still no inbox body or unpaid roster.
- **[Risk] Extra Gallery page on every Dashboard load** → One `listMediaPage` of 8–12 thumbs; join `failed` like other pulse reads.
- **[Risk] Stale `24h` in localStorage** → Parser maps it to `7d`.
- **[Trade-off] Website still feels like a CMS inside the surface** → Accepted; IA rewrite is a non-goal.

## Migration Plan

1. Frontend-only. No schema, seed, or `pb_data` backup step.
2. Deploy the Studio web image. Stored `studio-desk-period=24h` reads as 7d.
3. Rollback: previous frontend dist. No PocketBase rollback.

## Open Questions

None that block specs or tasks. Frame count in the 8–12 band can be tuned at implement.
