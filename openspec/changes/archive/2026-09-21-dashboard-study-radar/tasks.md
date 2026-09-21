## 1. Data

- [x] 1.1 Extend `loadDashboardPulse` with: `collectedDelta` (vs prior for 7d/30d), `volumeSeries`, `pipelineMix`, `funnel`, `micro` (collectionPct, booked, outstanding, avgFee), `needsYou` rows
- [x] 1.2 Bucket volume series like money (daily 7d/30d, monthly All) from hub booking `created`
- [x] 1.3 Build funnel step counts for the selected period; build live pipeline mix; cap Needs-you (~6) with name, time, reason, href
- [x] 1.4 Keep week blotter + frames behavior; period still does not filter them or mix/Needs-you

## 2. Study UI

- [x] 2.1 Rebuild Dashboard first viewport: Collected hero + vs-prior + micro-stats + collected SVG series
- [x] 2.2 Add volume SVG series and handmade mix + funnel charts (no chart package)
- [x] 2.3 Remove thin chip-only row as the primary attention UI (micro-stats / Needs-you replace it)

## 3. Radar UI

- [x] 3.1 Render Needs-you list (name · time · reason); rows navigate; quiet empty state
- [x] 3.2 Keep week blotter under Needs-you; frames after Radar; omit frames when empty

## 4. Finish

- [x] 4.1 Update assistant `get_desk_pulse` if pulse shape changed
- [x] 4.2 Update `openspec/config.yaml` Dashboard Product IA line
- [x] 4.3 Typecheck; spot-check light/night Dashboard denseness
