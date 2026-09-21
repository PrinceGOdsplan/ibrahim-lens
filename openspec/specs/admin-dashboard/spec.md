# admin-dashboard Specification

## Purpose
Rich Studio Dashboard that helps the photographer see what needs attention and jump into the right hub.

## Requirements

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

### Requirement: Dashboard photographer greeting
Dashboard SHALL show the signed-in photographer’s identity at the top of the desk: the Studio display name when set, otherwise the login email. When a profile photo is set, Dashboard SHALL show that photograph next to the name. When no photo is set, Dashboard SHALL show initials derived from the same identity, not a broken image. Activating the greeting SHALL open Settings → Profile. The greeting SHALL NOT list client names or booking detail.

#### Scenario: Name and photo set
- **WHEN** the photographer has saved a Studio name and a profile photo and opens Dashboard
- **THEN** they see that name and photograph above the earnings plane

#### Scenario: Name only
- **WHEN** the photographer has a Studio name and no profile photo and opens Dashboard
- **THEN** they see that name and initials, and no missing-image placeholder

#### Scenario: No name yet
- **WHEN** the photographer has not saved a Studio name and opens Dashboard
- **THEN** they see the login email as the greeting label

#### Scenario: Open profile from greeting
- **WHEN** the photographer activates the greeting
- **THEN** they land on Settings → Profile
