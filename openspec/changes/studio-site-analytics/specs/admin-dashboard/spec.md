## MODIFIED Requirements

### Requirement: Dashboard is Overview then Activity
The Dashboard SHALL present analytics Overview in the first viewport, then an Activity zone for morning ops. Overview SHALL include a Today strip (next shoot today when any, open-request and unpaid counts when > 0, and amount due), a period-bound Revenue hero with time series and a vs-prior-period delta, a Bookings-created series, a Status mix chart, a Conversion chart, and micro-stats (collection rate, Booked ₦, Amount due ₦, and average fee when computable). Overview MAY include a Site visits strip (period visit total and top public paths from Cloudflare Web Analytics) when configured. Activity SHALL include an Action required list and the Upcoming week blotter. Recent Gallery photos MAY appear after Activity and SHALL remain secondary. Labels SHALL use everyday product English (Revenue, Action required, Amount due, Upcoming, Recent photos, Site, Visits) rather than slang such as Needs you, Earned, Radar, or Latest frames. Dashboard SHALL NOT lead with a photographer greeting or a lifetime count-stack scoreboard.

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see Overview charts and micro-stats before Action required and the Upcoming blotter

#### Scenario: Site visits strip when configured
- **WHEN** Cloudflare Web Analytics is configured and the photographer opens Dashboard
- **THEN** Overview MAY show period visits and top public paths without leaving Studio

#### Scenario: Quiet money window
- **WHEN** no payments fall in the selected period
- **THEN** Overview still shows ₦0, a flat revenue series, and the other Overview charts with zero or empty states rather than a void of hub shortcuts

#### Scenario: Busy week still dense
- **WHEN** the Upcoming blotter has several shoots
- **THEN** Overview charts and micro-stats remain visible above Activity so the page does not rely on the blotter alone for density
