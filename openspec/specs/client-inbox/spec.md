# client-inbox Specification

## Purpose
One Studio Inbox for contact inquiries, booking requests, feedback, and delivery-related events.

## Requirements

### Requirement: Unified inbox
The system SHALL present public **Write** messages and unaccepted **booking requests** in Clients → Inbox. Feedback remains reachable from Clients → Feedback; delivery download/created events SHALL NOT be a first-class Inbox folder in this change. Public contact messages are in scope.

#### Scenario: Booking arrives
- **WHEN** a visitor submits the public booking form
- **THEN** the photographer sees a request in Inbox, not a row in the Bookings hub, until they accept it

#### Scenario: Write arrives
- **WHEN** a visitor submits the public Write form
- **THEN** the photographer sees a message in Inbox

### Requirement: Deep links to focused tabs
Inbox items SHALL allow navigation to the relevant Bookings (after accept), Feedback, or Deliveries detail where applicable. Switching Inbox / Deliveries / People / Feedback SHALL keep deep-link query params that still apply (`person`, `booking`, `delivery`, `feedback`) rather than wiping the search string.

#### Scenario: Open booking from inbox
- **WHEN** the photographer accepts a booking request
- **THEN** they reach that booking in the Bookings hub (`pending`)

#### Scenario: Tab switch keeps person id
- **WHEN** the address includes `person` and the photographer switches from Inbox to People
- **THEN** `person` remains in the address and that person is shown

### Requirement: Inbox is Requests and Messages
Inbox SHALL offer Requests (unaccepted `needs_contact` bookings) and Messages (unread and read Write inquiries). It SHALL NOT require an Everything/Activity folder to complete intake.

#### Scenario: Two folders
- **WHEN** the photographer opens Inbox
- **THEN** they can list booking requests separately from Write messages

### Requirement: Accept is the door to Bookings
Accepting a request SHALL set status to `pending` and open that booking in the Bookings hub. Until Accept, the Bookings hub SHALL NOT list that web request.

#### Scenario: Accept
- **WHEN** the photographer accepts a request
- **THEN** Inbox no longer treats it as a request and Bookings shows it

### Requirement: Accept or delete unaccepted booking requests
Inbox SHALL present each unaccepted website booking request with an Accept action and a Delete action. Feedback items SHALL NOT offer Accept. Unaccepted requests SHALL remain in Inbox until one of those actions.

#### Scenario: Accept moves to the hub
- **WHEN** the photographer accepts a booking request in Inbox
- **THEN** that booking leaves Inbox and appears in the Bookings hub as `pending`

#### Scenario: Delete never becomes a hub booking
- **WHEN** the photographer deletes a booking request in Inbox
- **THEN** that request is removed and does not appear in the Bookings hub

#### Scenario: Unaccepted remains
- **WHEN** the photographer neither accepts nor deletes a booking request
- **THEN** it remains in Inbox as unconfirmed mail

### Requirement: In-app notices use Inbox as the record
Photographer in-app notices SHALL deep-link to Clients → Inbox or the existing hub for that event. The system SHALL NOT present a separate notification inbox that duplicates Inbox items.

#### Scenario: Open notice
- **WHEN** the photographer activates an in-app notice for client feedback
- **THEN** they reach Inbox or Feedback for that item rather than a second list of the same event
