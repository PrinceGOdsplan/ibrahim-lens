## ADDED Requirements

### Requirement: Dashboard is a hybrid instrument
The Dashboard SHALL present a single composition: a period-bound Collected hero with a time series of collected ₦, chips for Booked in period and Outstanding now plus non-zero attention counts, a rolling next-7-days week blotter, and latest Gallery frames when any exist. Period SHALL drive the hero number, the series, and Booked. Period SHALL NOT filter the week blotter or the frames. Dashboard SHALL NOT restore a Needs-you roster, message or feedback body, an unpaid client list, or delivery client names.

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see the Collected hero and series, chips, the week blotter, and frames when Gallery has images — without a large identity greeting or a six-stack of lifetime counts as the first glance

#### Scenario: Quiet money window
- **WHEN** no payments fall in the selected period
- **THEN** Dashboard shows ₦0 and a flat series, not a void of hub shortcuts

#### Scenario: No frames yet
- **WHEN** Gallery has no images
- **THEN** Dashboard omits the frames plane and does not show an Upload call-to-action

### Requirement: Week blotter
Dashboard SHALL show the next seven days as a spatial week, including empty days. Each upcoming hub booking in that window MAY show the client’s first name, the preferred time, and a Today mark when the shoot is today. Activating a row SHALL open that booking. The blotter SHALL NOT show message or feedback text.

#### Scenario: Empty Wednesday
- **WHEN** the next seven days include a day with no shoot
- **THEN** that day is still drawn on the blotter

#### Scenario: Open a shoot
- **WHEN** the photographer activates a named row on the blotter
- **THEN** they land on that booking in Bookings

### Requirement: Latest frames
When Gallery has images, Dashboard SHALL show a small set of the most recently created Gallery photographs as thumbs. Activating the plane or a frame SHALL open Gallery. Frames SHALL NOT show client names. When Gallery has no images, the plane SHALL be omitted.

#### Scenario: Recent work
- **WHEN** Gallery has photographs and the photographer opens Dashboard
- **THEN** they see recent Gallery thumbs they can follow into Gallery

## MODIFIED Requirements

### Requirement: Shared period control
Dashboard SHALL offer period presets of 7 days, 30 days, and All. Changing the period SHALL update Collected, the Collected series, and Booked. The selected preset SHALL persist across Dashboard visits on that browser. Dashboard SHALL NOT offer a 24-hour preset.

#### Scenario: Switch period
- **WHEN** the photographer selects 7 days
- **THEN** Collected, the series, and Booked reflect the last seven days

#### Scenario: All
- **WHEN** the photographer selects All
- **THEN** Collected matches lifetime collected and the series shows a longer shape (monthly buckets are acceptable)

## REMOVED Requirements

### Requirement: Dashboard is a pulse desk
**Reason**: Replaced by the hybrid instrument (Collected series, chips, week blotter, frames).
**Migration**: Use Dashboard is a hybrid instrument.

### Requirement: Count stacks without diary detail
**Reason**: Lifetime stacks competed with the series, week, and frames. Photos are the frames; bookings are the blotter.
**Migration**: Open Gallery, Bookings, and Clients hubs directly. Non-zero attention remains as chips.

### Requirement: Dashboard photographer greeting
**Reason**: Identity already lives on the rail / phone operator strip. A second large greeting fought the instrument.
**Migration**: Profile remains on the rail or phone strip and in Settings → Profile.
