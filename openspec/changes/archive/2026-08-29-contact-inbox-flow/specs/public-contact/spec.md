## MODIFIED Requirements

### Requirement: Contact page shows booking, not a separate hello form
The public Contact page SHALL present two visitor intents: **Write** (a short message) and **Book** (the shared booking request form). Page H1 and intro still come from Website Contact & booking (default H1 “Let’s shoot”). Reach-me details and FAQ remain on the page. The page SHALL NOT add a third intake form or a primary-nav `/book` route.

#### Scenario: Visitor opens Contact
- **WHEN** a visitor opens `/contact`
- **THEN** they can send a Write message, submit a booking request, and see displayed reach-me details when configured

### Requirement: Booking before contact details
The Contact page SHALL present Write, then Book (`#booking`), then displayed contact details, then FAQ when present. Header Book SHALL still target `#booking`. Hash `#write` SHALL bring Write into view.

#### Scenario: Contact stack order
- **WHEN** a visitor opens `/contact`
- **THEN** they encounter the page voice, then Write, then Book, then contact details, then FAQ when present

#### Scenario: Header Book lands on Book
- **WHEN** a visitor follows `/contact#booking`
- **THEN** the booking form is brought into view

### Requirement: Booking is sole public intake channel
Incoming visitor messages from the public frontend SHALL enter Studio as either a Write inquiry (`form_inquiries` kind `contact`) or a booking request (Person + Booking `needs_contact`). Displayed reach-me details remain available. The public site SHALL NOT create a Booking from the Write form.

#### Scenario: Write creates a contact inquiry
- **WHEN** a visitor submits a valid Write form
- **THEN** Studio Inbox shows a message and no Booking is created from that submit

#### Scenario: Book still creates a request
- **WHEN** a visitor submits a valid booking request from Contact
- **THEN** Studio Inbox shows a booking request in `needs_contact`

### Requirement: Booking section
The Contact page SHALL include a booking request section using the shared booking form definition, including custom questions (max 8) and a request calendar for any date/time. On Contact, the booking section SHALL NOT repeat a heading and lead paragraph beneath the page's own H1 and lead. The shared form SHALL be able to render without its own heading block so the host page controls the heading hierarchy.

#### Scenario: Submit booking request
- **WHEN** a visitor submits a valid booking request from Contact
- **THEN** the request appears in Clients → Inbox as a request, not in the Bookings hub, until the photographer accepts it

#### Scenario: Pick any date time
- **WHEN** a visitor uses the booking calendar
- **THEN** they may select any preferred date and time as a request without auto-confirmation

#### Scenario: Contact heading hierarchy
- **WHEN** a visitor opens `/contact`
- **THEN** they read one page heading and one page lead, then Write and Book as two intents, not a second booking heading stacked under the page lead

## ADDED Requirements

### Requirement: Write form fields
The Write form SHALL require name, a Nigerian phone (same +234 treatment as booking), and a message. It SHALL use the same hidden trap and origin rate-limiting approach as booking. It SHALL NOT expose extra CMS questions.

#### Scenario: Valid write
- **WHEN** a visitor submits name, a valid Nigerian phone, and a message
- **THEN** the inquiry is stored and Inbox shows it as a message

#### Scenario: Trap filled
- **WHEN** a Write submit includes a filled hidden trap field
- **THEN** no inquiry is created

### Requirement: Write does not become a booking
Submitting Write SHALL NOT create a Booking. Studio SHALL NOT offer a convert-to-booking action on that message in this change.

#### Scenario: Message stays a message
- **WHEN** the photographer opens a Write message in Inbox
- **THEN** they can read it and mark it read, and there is no control that creates a Booking from it
