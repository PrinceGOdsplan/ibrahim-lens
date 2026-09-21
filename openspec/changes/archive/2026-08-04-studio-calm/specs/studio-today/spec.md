## Purpose

A calm daily “Today” queue so the photographer handles reply and payment tasks without opening the full Booking Manager cockpit.

## ADDED Requirements

### Requirement: Today queue as primary ops surface
Studio SHALL provide a Today (or equivalent) queue listing actionable bookings: at least (1) needs a reply (`needs_contact`) and (2) collect payment (confirmed with unpaid or partial payment). This queue SHALL be the default Clients landing when no deeper tab is requested.

#### Scenario: Open Clients default
- **WHEN** the photographer opens Clients without a specific deep-link tab that overrides Today
- **THEN** they see the Today queue before create forms, filters, or full directory chrome

#### Scenario: Needs a reply item
- **WHEN** a booking is in `needs_contact`
- **THEN** it appears under Needs a reply with primary actions such as mark pending or confirm — without requiring fee fields first

#### Scenario: Collect payment item
- **WHEN** a booking is `confirmed` and payment state is unpaid or partial
- **THEN** it appears under Collect with a clear path to record amount paid

### Requirement: One next action
Today items SHALL emphasize one or two primary actions per row/card, not the full booking editor.

#### Scenario: Act without full form
- **WHEN** the photographer marks a Needs a reply item as pending or confirmed from Today
- **THEN** the status updates without opening money, notes, and history panels first
