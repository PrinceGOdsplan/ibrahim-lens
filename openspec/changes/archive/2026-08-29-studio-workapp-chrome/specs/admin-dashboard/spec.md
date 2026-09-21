## ADDED Requirements

### Requirement: Dashboard is the Needs you surface
The Dashboard hub SHALL present Needs you as its primary surface under the hub toolbar. A single quiet Today line MAY sit above that list (next confirmed shoot and outstanding money). The Dashboard SHALL NOT restack other hubs as cards, pulse grids, activity feeds, or always-on quick-action buttons.

#### Scenario: Work waiting
- **WHEN** actionable items exist
- **THEN** Needs you lists them and each row opens the hub that can finish the job

#### Scenario: Clear day
- **WHEN** nothing needs the photographer
- **THEN** Dashboard says they are clear and does not fill the pane with Gallery counts or Upload shortcuts

#### Scenario: Today line
- **WHEN** a next confirmed shoot or outstanding balance exists
- **THEN** Dashboard may show that as one line that links into Bookings, not as a card grid of pipeline totals

## MODIFIED Requirements

### Requirement: Needs-you attention queue
The Dashboard SHALL surface actionable items such as bookings in `needs_contact`, unpaid/partial confirmed work, unread feedback, and deliveries nearing expiry. Public contact-form messages are not an intake source. That queue SHALL be the main body of the Dashboard, not one section among many.

#### Scenario: Photographer opens dashboard with pending work
- **WHEN** actionable items exist
- **THEN** the Dashboard Needs you area lists them with navigation to the relevant hub

#### Scenario: Needs contact bookings appear
- **WHEN** bookings exist in `needs_contact`
- **THEN** they appear in Needs you until status changes

## REMOVED Requirements

### Requirement: Pipeline snapshots
**Reason**: Those counts belong on Bookings and Clients, where the photographer already filters by view. Repeating them on Dashboard turned the hub into a status page.
**Migration**: Use Bookings views and Clients tabs for pipeline counts. Dashboard may keep a single Today line for next shoot / outstanding.

### Requirement: Booking pipeline counts
**Reason**: Same as pipeline snapshots — Bookings is the book.
**Migration**: Bookings hub view counts.

### Requirement: Library pulse
**Reason**: Gallery is the wall for photos. Dashboard should not summarise Gallery.
**Migration**: Open Gallery.

### Requirement: Last few activity items
**Reason**: Inbox already holds that stream. A second feed on Dashboard duplicated Clients.
**Migration**: Clients → Inbox.

### Requirement: Quick actions
**Reason**: Upload, create Delivery, and open Bookings already have homes. Always-on Dashboard buttons were landing-page chrome.
**Migration**: Use Gallery Add, Clients Deliveries, and the Bookings hub.
