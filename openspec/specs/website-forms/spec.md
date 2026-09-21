# website-forms Specification

## Purpose
Single Contact-style editor for public contact inquiry fields and booking request questions, with a capped question set.

## Requirements

### Requirement: Booking questions builder (no contact inquiry builder)
The Website Contact & booking tab SHALL let the photographer edit booking questions (max 8) and related booking help/calendar toggles together with Contact page voice, a short Write blurb, and reach-me fields. It SHALL NOT expose a public contact-question builder or `contact_fields` intake path. Write fields stay name, phone, and message.

#### Scenario: Booking questions still editable
- **WHEN** the photographer updates booking questions in Contact & booking
- **THEN** the public booking form reflects those questions

#### Scenario: No contact inquiry builder for intake
- **WHEN** the photographer opens Contact & booking
- **THEN** they do not configure extra Write questions; they may edit a short Write blurb only

### Requirement: Contact page voice in booking editor
Contact & booking SHALL allow editing Contact H1 (default “Let’s shoot”) and a short intro line used on `/contact` above the booking form.

#### Scenario: Custom Contact intro
- **WHEN** the photographer saves a Contact intro
- **THEN** `/contact` shows that intro above booking

### Requirement: Booking questions max entries
Booking questions SHALL support a photographer-defined set with a maximum of 8 questions.

#### Scenario: Cap booking questions
- **WHEN** the photographer already has 8 booking questions
- **THEN** the system prevents adding another until one is removed

### Requirement: Request calendar configuration
Booking form configuration SHALL include a request calendar where clients pick any preferred date and time (not photographer availability slots).

#### Scenario: Calendar is request-any-time
- **WHEN** booking form settings are enabled
- **THEN** clients can pick any date/time as a request without auto-confirmed availability

### Requirement: Booking submit creates ops records
Public booking form submission SHALL upsert/match a Person and create a Booking in `needs_contact` with answers and preferred date/time. Write is a separate intake and SHALL NOT create a Booking. A single completed booking form SHALL create at most one Person match and one Booking: while a submission is in flight the form SHALL prevent further submissions.

The Person match SHALL be performed by the server from the submitted name and phone. The visitor SHALL NOT list or create People through the People API. The visitor SHALL NOT set booking status, source, fee, amount paid, or studio notes; the server SHALL force `needs_contact` and `website` and SHALL store those money and note fields empty.

#### Scenario: Form creates needs_contact booking
- **WHEN** a visitor completes booking submit successfully
- **THEN** Clients → Inbox shows a new `needs_contact` request for that Person

#### Scenario: Repeated submit activation
- **WHEN** a visitor activates the submit control repeatedly while a submission is in flight
- **THEN** only one Booking is created

#### Scenario: Guest cannot choose operator fields
- **WHEN** a visitor submits a booking create that includes a confirmed status, a non-website source, or money fields
- **THEN** the stored booking is still `needs_contact` with source `website` and empty money and studio notes

### Requirement: Booking submit resists automated bulk create
Public booking form submission SHALL reject automated bulk creates (hidden trap fields and/or origin rate limiting) so a script cannot fill Inbox with requests. A genuine visitor completing the visible fields SHALL still create at most one Person match and one unaccepted Booking per successful submit. The form SHALL NOT require an account.

The guest booking rate limit SHALL count every unauthenticated booking create in the window, regardless of the source value sent in the request.

The photographer SHALL NOT be asked to moderate a CAPTCHA as the default path. A visible challenge MAY be added only if trap fields and rate limits are insufficient.

#### Scenario: Hidden trap filled
- **WHEN** a submit includes a filled hidden trap field that a visitor does not see
- **THEN** no Person or Booking is created

#### Scenario: Genuine visitor
- **WHEN** a visitor completes the visible booking fields and submits once
- **THEN** Inbox shows a new unaccepted booking request for that Person

#### Scenario: Rapid automated repeats
- **WHEN** the same origin submits many booking creates in a short window
- **THEN** later creates in that window are rejected and do not each become a Booking

#### Scenario: Non-website source does not skip the window
- **WHEN** an unauthenticated create sends a source other than website
- **THEN** it still counts toward the guest booking rate limit and is still stored as website

### Requirement: Nigeria phone input on booking form
The public booking phone field SHALL present a fixed **`+234` prefix** with an editable national number segment. If the user enters a leading `0` on that segment (immediately after the country code), the system SHALL strip that `0` before save/match.

The phone control SHALL carry the same visual treatment as the form's other fields. It SHALL NOT be the heaviest element in the form: the field with the most visual weight is read as the most important, and on a booking form that is the submit control, not the phone. The `+234` prefix SHALL be presented as a quiet part of the same field rather than as a separately bordered element.

#### Scenario: Strip trunk zero after +234
- **WHEN** a visitor enters national digits starting with `0` (e.g. `08031234567`) with prefix `+234`
- **THEN** the stored phone is normalized as `+2348031234567` (not `+2340803…`)

#### Scenario: Placeholder guides local digits
- **WHEN** the booking form phone control is shown
- **THEN** the prefix reads `+234` and the input placeholder indicates the remaining local digits

#### Scenario: Phone field matches its siblings

- **WHEN** a visitor views the booking form
- **THEN** the phone field shares the treatment used by the name, email, and location fields rather than presenting as a different kind of control

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

### Requirement: Booking field width suits its answer

Booking form fields SHALL be sized in proportion to the answer they expect rather than all spanning the full width of the form. Short answers — a count, a city, a date — SHALL NOT be given the same line length as free-text notes, since an input far wider than its content invites uncertainty about what is wanted.

On narrow viewports fields MAY all span the available width, because there is no room to do otherwise.

#### Scenario: Short answers on a wide form

- **WHEN** a visitor views the booking form on a desktop-width viewport
- **THEN** short-answer fields occupy less than the full form width, while free-text fields may span it

#### Scenario: Narrow viewport

- **WHEN** a visitor views the booking form on a phone
- **THEN** fields may each span the available width

### Requirement: Public Write submit
Public Write SHALL create one `form_inquiries` record with `kind` `contact` (name, phone, message, trap). The server MAY upsert a Person from the phone so the photographer can reach them. The visitor SHALL NOT create or list People through the People API. Write SHALL NOT create a Booking.

Unauthenticated clients SHALL NOT create `form_inquiries` with a kind other than `contact`.

#### Scenario: Write lands in Inbox
- **WHEN** a visitor submits Write successfully
- **THEN** Inbox Messages shows that inquiry

#### Scenario: Guest cannot write a download event
- **WHEN** an unauthenticated client creates a form inquiry whose kind is not `contact`
- **THEN** the create is rejected

### Requirement: Choice question options
When a booking question type is Choice, the photographer SHALL be able to add, edit, and remove the choice options. Changing a question to Choice SHALL seed usable options so the public select is not empty. A required flag SHALL be editable per question and honored on the public booking form.

#### Scenario: Configure choices
- **WHEN** the photographer sets a question to Choice and saves two options
- **THEN** the public booking select lists those options

#### Scenario: Mark required
- **WHEN** the photographer marks a question required
- **THEN** the public booking form requires an answer for that question
