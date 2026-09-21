## MODIFIED Requirements

### Requirement: Booking questions builder (no contact inquiry builder)
The Website Contact & booking tab SHALL let the photographer edit booking questions (max 8) and related booking help/calendar toggles together with Contact page voice, a short Write blurb, and reach-me fields. It SHALL NOT expose a public contact-question builder or `contact_fields` intake path. Write fields stay name, phone, and message.

#### Scenario: Booking questions still editable
- **WHEN** the photographer updates booking questions in Contact & booking
- **THEN** the public booking form reflects those questions

#### Scenario: No contact inquiry builder for intake
- **WHEN** the photographer opens Contact & booking
- **THEN** they do not configure extra Write questions; they may edit a short Write blurb only

### Requirement: Booking submit creates ops records
Public booking form submission SHALL upsert/match a Person and create a Booking in `needs_contact` with answers and preferred date/time. Write is a separate intake and SHALL NOT create a Booking. A single completed booking form SHALL create at most one Person match and one Booking: while a submission is in flight the form SHALL prevent further submissions.

#### Scenario: Form creates needs_contact booking
- **WHEN** a visitor completes booking submit successfully
- **THEN** Clients → Inbox shows a new `needs_contact` request for that Person

#### Scenario: Repeated submit activation
- **WHEN** a visitor activates the submit control repeatedly while a submission is in flight
- **THEN** only one Booking is created

## ADDED Requirements

### Requirement: Public Write submit
Public Write SHALL create one `form_inquiries` record with `kind` `contact` (name, phone, message, trap). It MAY upsert a Person from the phone so the photographer can reach them. It SHALL NOT create a Booking.

#### Scenario: Write lands in Inbox
- **WHEN** a visitor submits Write successfully
- **THEN** Inbox Messages shows that inquiry

### Requirement: Choice question options
When a booking question type is Choice, the photographer SHALL be able to add, edit, and remove the choice options. Changing a question to Choice SHALL seed usable options so the public select is not empty. A required flag SHALL be editable per question and honored on the public booking form.

#### Scenario: Configure choices
- **WHEN** the photographer sets a question to Choice and saves two options
- **THEN** the public booking select lists those options

#### Scenario: Mark required
- **WHEN** the photographer marks a question required
- **THEN** the public booking form requires an answer for that question
