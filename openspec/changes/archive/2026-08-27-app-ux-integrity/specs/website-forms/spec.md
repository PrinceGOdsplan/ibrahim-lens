## MODIFIED Requirements

### Requirement: Booking submit creates ops records

Public booking form submission SHALL upsert/match a Person and create a Booking in `needs_contact` with answers and preferred date/time. Booking is the sole public message intake — no parallel contact inquiry create. A single completed form SHALL create at most one Person match and one Booking: while a submission is in flight the form SHALL prevent further submissions, so repeated activation of the submit control cannot produce duplicate records.

#### Scenario: Form creates needs_contact booking

- **WHEN** a visitor completes booking submit successfully
- **THEN** Clients → Bookings shows a new `needs_contact` booking for that Person

#### Scenario: Repeated submit activation

- **WHEN** a visitor activates the submit control repeatedly while a submission is in flight
- **THEN** only one Booking is created

## ADDED Requirements

### Requirement: Booking submit affordance reflects progress

The booking submit control SHALL indicate that a submission is in progress and SHALL be unavailable for re-activation until that submission settles. On settling, the outcome SHALL be presented.

#### Scenario: Submission in flight

- **WHEN** a visitor submits the booking form and the request has not settled
- **THEN** the submit control shows a pending state and cannot be activated again

#### Scenario: Submission settles

- **WHEN** the submission settles
- **THEN** the submit control returns to an actionable state and the outcome is presented

### Requirement: Booking outcome is reachable from the submit control

The confirmation or error resulting from a booking submission SHALL be presented where the visitor is looking when they submit. On small viewports, where the submit control is held persistently near the bottom of the viewport, the outcome SHALL NOT be rendered only above a long field set where it can be off screen.

#### Scenario: Submit from the persistent control on a phone

- **WHEN** a visitor submits the booking form from the persistent submit control on a phone-width viewport
- **THEN** the confirmation or error is visible without scrolling back up the form

### Requirement: Field-level booking validation

A booking field that fails validation SHALL be identified at that field, and focus SHALL move to the first failing field. A validation message SHALL NOT be presented only as a form-level message remote from the control it concerns.

#### Scenario: Invalid phone number

- **WHEN** a visitor submits the booking form with a phone number that is not a valid Nigerian number
- **THEN** the phone field is identified as failing with its message at the field, and focus moves to it

### Requirement: Preferred date and time is not in the past

When the request calendar is enabled, the preferred date and time control SHALL NOT accept a moment earlier than the time of submission.

#### Scenario: Past date rejected

- **WHEN** a visitor attempts to submit a preferred date and time earlier than now
- **THEN** the submission is rejected with a message at that field
