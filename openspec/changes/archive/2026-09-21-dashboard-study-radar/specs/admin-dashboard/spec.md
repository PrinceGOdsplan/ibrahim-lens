## ADDED Requirements

### Requirement: Dashboard is Study first then Radar
The Dashboard SHALL present Study analytics in the first viewport, then a Radar zone for morning ops. Study SHALL include a period-bound Collected hero with time series and a vs-prior-period delta, a volume series for shoots or booking demand in the period, a pipeline mix chart, a funnel chart, and micro-stats (at least collection %, Booked ₦, Outstanding ₦, and average fee when computable). Radar SHALL include a short Needs-you list and the week blotter. Latest Gallery frames MAY appear after Radar and SHALL remain secondary. Dashboard SHALL NOT lead with a photographer greeting or a lifetime count-stack scoreboard.

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see Study charts and micro-stats before Needs-you and the week blotter

#### Scenario: Quiet money window
- **WHEN** no payments fall in the selected period
- **THEN** Study still shows ₦0, a flat collected series, and the other Study charts with zero or empty states rather than a void of hub shortcuts

#### Scenario: Busy week still dense
- **WHEN** the week blotter has several shoots
- **THEN** Study charts and micro-stats remain visible above Radar so the page does not rely on the blotter alone for density

### Requirement: Volume series
Dashboard Study SHALL show a handmade series of period demand — counts of hub bookings created or preferred shoots bucketed like the Collected series (daily for 7d/30d, monthly for All). The series SHALL update with the shared period control.

#### Scenario: Switch period updates volume
- **WHEN** the photographer selects 7 days
- **THEN** the volume series reflects the last seven days

### Requirement: Pipeline mix
Dashboard Study SHALL show the current open pipeline mix among at least pending, confirmed, and unpaid hub bookings (counts). Mix reflects live open work and SHALL NOT be filtered by the period control.

#### Scenario: Open mix
- **WHEN** the photographer views Study
- **THEN** they see relative counts for pending, confirmed, and unpaid open bookings

### Requirement: Funnel
Dashboard Study SHALL show a period funnel with steps for requests (needs_contact), accepted into Bookings, paid (any amount paid or fully collected), delivered, and feedback received in the selected period. Steps MAY be zero. Funnel SHALL NOT show message or feedback body text.

#### Scenario: Period funnel
- **WHEN** the photographer selects 30 days
- **THEN** funnel step counts reflect activity in that window

### Requirement: Needs-you radar list
Dashboard Radar SHALL show a short list of items that need attention. Each row SHALL show a client first name (or a safe fallback), a time when known, and a one-line reason such as request, unpaid, expiring, message, or feedback. Activating a row SHALL open the matching hub record or filter. The list SHALL be capped (about 5–8 rows) with a path to see more in the hub when truncated. Rows SHALL NOT include message or feedback body text.

#### Scenario: Unpaid row
- **WHEN** a hub booking has an unpaid balance
- **THEN** Needs-you MAY include a row with the client first name, a relevant time when known, and an unpaid reason that opens that booking

#### Scenario: No attention items
- **WHEN** nothing needs attention
- **THEN** Needs-you shows a quiet empty hint rather than inventing rows

## MODIFIED Requirements

### Requirement: Dashboard is a hybrid instrument
The Dashboard SHALL present Study first (Collected hero with series and vs-prior delta, volume series, pipeline mix, funnel, micro-stats), then Radar (Needs-you list and week blotter), then optional latest Gallery frames. Period SHALL drive Study money, volume, funnel, and Booked/collection micro-stats. Period SHALL NOT filter the week blotter, Needs-you, pipeline mix, or frames. Dashboard SHALL NOT restore a photographer greeting or lifetime count stacks as the first glance. Message and feedback body text SHALL NOT appear on Dashboard.

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see Study analytics first, then Radar, without a large identity greeting or a six-stack of lifetime counts as the first glance

#### Scenario: Quiet money window
- **WHEN** no payments fall in the selected period
- **THEN** Dashboard shows ₦0 and a flat collected series, not a void of hub shortcuts

#### Scenario: No frames yet
- **WHEN** Gallery has no images
- **THEN** Dashboard omits the frames plane and does not show an Upload call-to-action

### Requirement: Shared period control
Dashboard SHALL offer period presets of 7 days, 30 days, and All. Changing the period SHALL update Collected, the Collected series, the vs-prior delta, the volume series, the funnel, Booked, and collection-related micro-stats. The selected preset SHALL persist across Dashboard visits on that browser. Dashboard SHALL NOT offer a 24-hour preset. Period SHALL NOT filter week blotter, Needs-you, pipeline mix, or frames.

#### Scenario: Switch period
- **WHEN** the photographer selects 7 days
- **THEN** Collected, its series, volume, funnel, Booked, and related micro-stats reflect the last seven days

#### Scenario: All
- **WHEN** the photographer selects All
- **THEN** Collected matches lifetime collected, the money series shows a longer shape (monthly buckets are acceptable), and vs-prior MAY be omitted or shown as unavailable
