## Purpose

First-class Booking Manager: intake from the website, manual books, status lifecycle, notes, and People assignment.

## ADDED Requirements

### Requirement: Booking is system of record
Studio Bookings SHALL manage first-class booking records linked to a Person — not treat raw form rows as the only long-term record.

#### Scenario: Manual booking
- **WHEN** the photographer creates a booking manually with a Person (or new name+phone)
- **THEN** a booking exists in the Booking Manager without a public form submission

### Requirement: Auto-create from public booking form
Submitting the public booking form SHALL create or match a Person (via +234-normalized phone) and create a Booking in `needs_contact` status with the requested date/time and answers preserved. This is the only public frontend message intake.

#### Scenario: Web request becomes booking
- **WHEN** a visitor submits a valid booking request
- **THEN** Studio shows a booking in `needs_contact` linked to that Person

### Requirement: Status lifecycle
Each booking SHALL have exactly one status from: `needs_contact`, `pending`, `confirmed`, `completed`, `declined`, `cancelled`. Status is chosen in the manager (not a separate “needs contact” action button).

#### Scenario: Needs contact means unreplied / must talk
- **WHEN** a booking is in `needs_contact`
- **THEN** it appears in Needs-you style queues until the photographer changes status

#### Scenario: Pending means no contact needed yet, not confirmed
- **WHEN** the photographer sets status to `pending`
- **THEN** the booking is tracked as waiting confirmation without implying an outstanding contact task

#### Scenario: Confirm booking
- **WHEN** the photographer sets status to `confirmed`
- **THEN** the booking is treated as locked-in work for ops and finance tracking

### Requirement: Photographer notes
Authenticated photographers SHALL attach Studio-only notes on a booking.

#### Scenario: Save note
- **WHEN** the photographer saves a note on a booking
- **THEN** it persists in Studio and is not shown on the public site

### Requirement: Editable with history
Bookings SHALL remain editable (status, schedule fields, notes, Person link, money) while every material change is recorded in the audit log capability.

#### Scenario: Edit after confirm
- **WHEN** the photographer changes a confirmed booking’s preferred time
- **THEN** the booking updates and an audit event is recorded
