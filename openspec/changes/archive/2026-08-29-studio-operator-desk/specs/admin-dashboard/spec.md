## REMOVED Requirements

### Requirement: Needs-you attention queue
**Reason**: Named Needs-you rows exposed client names, shoot times, and message previews on Dashboard. Those belong in Bookings and Clients hubs.
**Migration**: Waiting work appears as lifetime and period count stacks that open the relevant hub; the bell and Inbox hold inbound detail.

### Requirement: Pipeline snapshots
**Reason**: Replaced by lifetime · period count stacks on the pulse desk.
**Migration**: Use Dashboard count stacks and Bookings/Clients hubs.

### Requirement: Booking pipeline counts
**Reason**: Same as pipeline snapshots.
**Migration**: Bookings hub views; Dashboard shows aggregate booking counts only.

### Requirement: Library pulse
**Reason**: Replaced by Photos lifetime · period count on the pulse desk.
**Migration**: Dashboard Photos stack → Gallery.

### Requirement: Last few activity items
**Reason**: Activity previews are privy; Inbox remains the stream.
**Migration**: Clients → Inbox; header notices for inbound events.

### Requirement: Quick actions
**Reason**: Always-on Upload / Delivery / Bookings chrome is not part of the pulse desk.
**Migration**: Use Gallery, Clients → Deliveries, and Bookings hubs.

## ADDED Requirements

### Requirement: Dashboard is a pulse desk
The Dashboard SHALL present a single composition: photographer greeting (name and profile photo when set), a shared period control, a money plane, and studio count stacks. It SHALL NOT list client names, preferred shoot times, message or feedback text, unpaid client names, or delivery client names.

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see greeting, period control, earnings figures, and count stacks without a named Needs-you roster

#### Scenario: Quiet stretch
- **WHEN** every in-period intake count is zero
- **THEN** Dashboard still shows lifetime totals and ₦0 / +0 where applicable, with a quiet empty hint rather than a void panel of hub shortcuts

### Requirement: Shared period control
Dashboard SHALL offer period presets of 24 hours, 7 days, 30 days, and All. Changing the period SHALL update both period money figures and in-period count increments. The selected preset SHALL persist across Dashboard visits on that browser.

#### Scenario: Switch period
- **WHEN** the photographer selects 7 days
- **THEN** Collected, Booked, and all +N count increments reflect the last seven days

#### Scenario: All
- **WHEN** the photographer selects All
- **THEN** period money lines match lifetime collected where applicable and +N count lines are omitted or not shown as a duplicate of lifetime

### Requirement: Count stacks without diary detail
Dashboard SHALL show lifetime totals and in-period intake for at least: Photos, Deliveries, Bookings, Requests, Messages, and Feedback. Each stack SHALL navigate to the corresponding Studio hub or filter. Stacks SHALL NOT show per-record private detail.

#### Scenario: Open Messages count
- **WHEN** the photographer activates the Messages stack
- **THEN** they land on Clients → Inbox Messages (or equivalent) without having seen message previews on Dashboard
