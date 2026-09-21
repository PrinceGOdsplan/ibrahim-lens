## Purpose

Rich Studio Dashboard that helps the photographer see what needs attention and jump into the right hub.

## ADDED Requirements

### Requirement: Needs-you attention queue
The Dashboard SHALL surface actionable items such as new bookings, unread contact/feedback, and deliveries nearing expiry.

#### Scenario: Photographer opens dashboard with pending work
- **WHEN** actionable items exist
- **THEN** the Dashboard Needs you area lists them with navigation to the relevant Clients view

### Requirement: Pipeline snapshots
The Dashboard SHALL show count snapshots for Bookings, Deliveries, and Feedback pipelines.

#### Scenario: Pipeline counts visible
- **WHEN** the photographer opens Dashboard
- **THEN** they see pipeline counts that link through to Clients tabs where applicable

### Requirement: Library pulse
The Dashboard SHALL show a lightweight Library pulse such as totals and recent uploads.

#### Scenario: Library pulse visible
- **WHEN** Library data exists
- **THEN** Dashboard shows summary Library signals

### Requirement: Last few activity items
The Dashboard SHALL show the last few activity items from the same operational stream as Inbox (preview, not a separate analytics product).

#### Scenario: Recent activity
- **WHEN** recent events exist
- **THEN** Dashboard shows the last few items

### Requirement: Quick actions
The Dashboard SHALL provide quick actions such as upload to Library, create Delivery, and open bookings.

#### Scenario: Use quick action
- **WHEN** the photographer uses a Dashboard quick action
- **THEN** they are taken to the corresponding Studio flow
