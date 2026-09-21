# admin-dashboard Specification

## Purpose
Rich Studio Dashboard that helps the photographer see what needs attention and jump into the right hub.

## Requirements

### Requirement: Dashboard is Overview then Activity
The Dashboard SHALL present analytics Overview in the first viewport, then an Activity zone for morning ops. Overview SHALL include a Today strip (next shoot today when any, open-request and unpaid counts when > 0, and amount due), a period-bound Revenue hero with time series and a vs-prior-period delta, a Bookings-created series, a Status mix chart, a Conversion chart, and micro-stats (collection rate, Booked ₦, Amount due ₦, and average fee when computable). Activity SHALL include an Action required list and the Upcoming week blotter. Recent Gallery photos MAY appear after Activity and SHALL remain secondary. Labels SHALL use everyday product English (Revenue, Action required, Amount due, Upcoming, Recent photos) rather than slang such as Needs you, Earned, Radar, or Latest frames. Dashboard SHALL NOT lead with a photographer greeting or a lifetime count-stack scoreboard.

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see Overview charts and micro-stats before Action required and the Upcoming blotter

#### Scenario: Quiet money window
- **WHEN** no payments fall in the selected period
- **THEN** Overview still shows ₦0, a flat revenue series, and the other Overview charts with zero or empty states rather than a void of hub shortcuts

#### Scenario: Busy week still dense
- **WHEN** the Upcoming blotter has several shoots
- **THEN** Overview charts and micro-stats remain visible above Activity so the page does not rely on the blotter alone for density

### Requirement: Bookings volume series
Dashboard Overview SHALL show a handmade series of period demand — counts of hub bookings created or preferred shoots bucketed like the Revenue series (daily for 7d/30d, monthly for All). The series SHALL update with the shared period control.

#### Scenario: Switch period updates volume
- **WHEN** the photographer selects 7 days
- **THEN** the Bookings series reflects the last seven days

### Requirement: Status mix
Dashboard Overview SHALL show the current open status mix among at least pending, confirmed, and unpaid hub bookings (counts). Mix reflects live open work and SHALL NOT be filtered by the period control.

#### Scenario: Open mix
- **WHEN** the photographer views Overview
- **THEN** they see relative counts for pending, confirmed, and unpaid open bookings

### Requirement: Conversion
Dashboard Overview SHALL show a period conversion chart with steps for requests (needs_contact), booked into Bookings, paid (any amount paid or fully collected), delivered, and feedback received in the selected period. Steps MAY be zero. Conversion SHALL NOT show message or feedback body text.

#### Scenario: Period conversion
- **WHEN** the photographer selects 30 days
- **THEN** conversion step counts reflect activity in that window

### Requirement: Action required list
Dashboard Activity SHALL show a short list of items that need attention. Each row SHALL show a client first name (or a safe fallback), a time when known, and a one-line reason such as new request, payment due, delivery expiring, unread message, or new feedback. Payment-due rows SHOULD include the outstanding amount. Activating a row SHALL open the matching hub record or filter. The list SHALL be capped (about 5–8 rows) with a path to see more in the hub when truncated. Rows SHALL NOT include message or feedback body text.

#### Scenario: Unpaid row
- **WHEN** a hub booking has an unpaid balance
- **THEN** Action required MAY include a row with the client first name, a relevant time when known, a payment-due reason, the outstanding amount when known, and a link that opens that booking

#### Scenario: No attention items
- **WHEN** nothing needs attention
- **THEN** Action required shows a quiet empty hint rather than inventing rows

### Requirement: Dashboard is a dense instrument
The Dashboard SHALL present Overview first (Today strip, Revenue hero with series and vs-prior delta, Bookings series, Status, Conversion, micro-stats), then Activity (Action required list and Upcoming blotter), then optional Recent photos. Period SHALL drive Overview money, Bookings series, Conversion, and Booked/revenue micro-stats. Period SHALL NOT filter the Upcoming blotter, Action required, Status mix, or photos. Dashboard SHALL NOT restore a photographer greeting or lifetime count stacks as the first glance. Message and feedback body text SHALL NOT appear on Dashboard.

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see Overview first, then Activity, without a large identity greeting or a six-stack of lifetime counts as the first glance

#### Scenario: Quiet money window
- **WHEN** no payments fall in the selected period
- **THEN** Dashboard shows ₦0 and a flat revenue series, not a void of hub shortcuts

#### Scenario: No photos yet
- **WHEN** Gallery has no images
- **THEN** Dashboard omits the Recent photos plane and does not show an Upload call-to-action

### Requirement: Upcoming week blotter
Dashboard SHALL show the next seven days as a spatial week, including empty days. Each upcoming hub booking in that window MAY show the client’s first name, the preferred time, and status. Activating a row SHALL open that booking. The blotter SHALL NOT show message or feedback text.

#### Scenario: Empty Wednesday
- **WHEN** the next seven days include a day with no shoot
- **THEN** that day is still drawn on the blotter

#### Scenario: Open a shoot
- **WHEN** the photographer activates a named row on the blotter
- **THEN** they land on that booking in Bookings

### Requirement: Recent photos
When Gallery has images, Dashboard SHALL show a small set of the most recently created Gallery photographs as thumbs. Activating the plane or a photo SHALL open Gallery. Photos SHALL NOT show client names. When Gallery has no images, the plane SHALL be omitted.

#### Scenario: Recent work
- **WHEN** Gallery has photographs and the photographer opens Dashboard
- **THEN** they see recent Gallery thumbs they can follow into Gallery

### Requirement: Shared period control
Dashboard SHALL offer period presets of 7 days, 30 days, and All time. Changing the period SHALL update Revenue, the Revenue series, the vs-prior delta, the Bookings series, Conversion, Booked, and revenue-related micro-stats. The selected preset SHALL persist across Dashboard visits on that browser. Dashboard SHALL NOT offer a 24-hour preset. Period SHALL NOT filter Upcoming blotter, Action required, Status mix, or photos.

#### Scenario: Switch period
- **WHEN** the photographer selects 7 days
- **THEN** Revenue, its series, Bookings, Conversion, Booked, and related micro-stats reflect the last seven days

#### Scenario: All time
- **WHEN** the photographer selects All time
- **THEN** Revenue matches lifetime earnings, the money series shows a longer shape (monthly buckets are acceptable), and vs-prior MAY be omitted or shown as unavailable
