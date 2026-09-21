# public-contact Specification

## Purpose
Contact page combining FAQ, contact details, and a booking request section that shares the Home booking form definition.

## Requirements

### Requirement: Contact page shows booking, not a separate hello form
The public Contact page SHALL present two visitor intents: **Write** (a short message) and **Book** (the shared booking request form). Page H1 and intro still come from Website Contact & booking (default H1 “Let’s shoot”). Reach-me details and FAQ remain on the page. The page SHALL NOT add a third intake form or a primary-nav `/book` route.

#### Scenario: Visitor opens Contact
- **WHEN** a visitor opens `/contact`
- **THEN** they can send a Write message, submit a booking request, and see displayed reach-me details when configured

### Requirement: Contact voice from Contact and booking
`/contact` SHALL use Contact H1 and intro from Website Contact & booking when set, defaulting H1 to “Let’s shoot”.

#### Scenario: Default Let’s shoot
- **WHEN** Contact H1 is unset
- **THEN** `/contact` still shows Let’s shoot

### Requirement: Booking before contact details
The Contact page SHALL present Write, then Book (`#booking`), then displayed contact details, then FAQ when present. Header Book SHALL still target `#booking`. Hash `#write` SHALL bring Write into view.

#### Scenario: Contact stack order
- **WHEN** a visitor opens `/contact`
- **THEN** they encounter the page voice, then Write, then Book, then contact details, then FAQ when present

#### Scenario: Header Book lands on Book
- **WHEN** a visitor follows `/contact#booking`
- **THEN** the booking form is brought into view

### Requirement: WhatsApp under booking submit
When a public phone number is configured, Contact SHALL offer WhatsApp as a quiet secondary control associated with the booking form (under or immediately after primary submit), in addition to listing WhatsApp with contact details. WhatsApp SHALL NOT use solid brass primary styling or official green WhatsApp chrome.

#### Scenario: WhatsApp always with form
- **WHEN** contact phone is configured and a visitor views the Contact booking form
- **THEN** a WhatsApp option is available without replacing the booking submit control

### Requirement: Booking is sole public intake channel
Incoming visitor messages from the public frontend SHALL enter Studio as either a Write inquiry (`form_inquiries` kind `contact`) or a booking request (Person + Booking `needs_contact`). Displayed reach-me details remain available. The public site SHALL NOT create a Booking from the Write form.

#### Scenario: Write creates a contact inquiry
- **WHEN** a visitor submits a valid Write form
- **THEN** Studio Inbox shows a message and no Booking is created from that submit

#### Scenario: Book still creates a request
- **WHEN** a visitor submits a valid booking request from Contact
- **THEN** Studio Inbox shows a booking request in `needs_contact`

### Requirement: FAQ on contact
The system SHALL display FAQ content on the contact page when FAQ entries exist.

#### Scenario: FAQ present
- **WHEN** FAQ content is published
- **THEN** visitors can read it on `/contact` without a separate FAQ primary nav page

### Requirement: Contact details
The system SHALL display configured public contact details on `/contact` below the booking section, sourced from Website Contact & booking reach-me fields.

A published email address SHALL be actionable as an email link, and a published phone number SHALL be actionable as a dial link, so a visitor on a phone can act on them directly instead of selecting and copying the text by hand. The displayed phone number SHALL be readable as a grouped number rather than an unbroken digit string, while the underlying dial target uses the stored international form.

#### Scenario: Details configured
- **WHEN** public contact details are set in Contact & booking
- **THEN** those details appear on `/contact` under the booking section

#### Scenario: Visitor taps the phone number

- **WHEN** a visitor on a phone taps the published phone number
- **THEN** their dialler opens with that number

#### Scenario: Visitor taps the email address

- **WHEN** a visitor taps the published email address
- **THEN** their mail client opens addressed to it

#### Scenario: Phone number readability

- **WHEN** a published phone number is displayed
- **THEN** it is grouped for reading rather than shown as a single run of digits

### Requirement: Booking section
The Contact page SHALL include a booking request section using the same form definition as the Home Book CTA scroll target, including custom questions (max 8) and a request calendar for any date/time.

On Contact, the booking section SHALL NOT repeat a heading and lead paragraph beneath the page's own H1 and lead, since the page exists for booking and the two pairs would say overlapping things. The shared form SHALL be able to render without its own heading block so the host page controls the heading hierarchy.

#### Scenario: Submit booking request
- **WHEN** a visitor submits a valid booking request from Contact
- **THEN** the request appears in Clients → Inbox as a request, not in the Bookings hub, until the photographer accepts it

#### Scenario: Pick any date time
- **WHEN** a visitor uses the booking calendar
- **THEN** they may select any preferred date and time as a request without auto-confirmation

#### Scenario: Contact heading hierarchy

- **WHEN** a visitor opens `/contact`
- **THEN** they read one heading and one lead for the page, not a second heading and lead immediately beneath them

#### Scenario: Home booking section keeps its heading

- **WHEN** a visitor reaches the booking section on Home
- **THEN** that section still carries its own heading, because Home is not otherwise about booking

### Requirement: Contact booking mobile submit comfort
The Contact booking section SHALL use the shared booking form’s small-screen submit comfort behavior (primary Request booking easy to reach; WhatsApp secondary when configured). Contact H1 SHALL remain “Let’s shoot”.

#### Scenario: Contact booking on phone
- **WHEN** a visitor fills the Contact booking form on a narrow viewport
- **THEN** Request booking remains the primary Soft night action and stays easy to reach while completing the form

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
