## ADDED Requirements

### Requirement: New booking notices point at Inbox
Photographer notices for a new public booking request SHALL describe it as mail to handle in Inbox (Accept or Delete), not as a booking that needs a reply in the Bookings hub. In-app notice deep links SHALL open Clients → Inbox.

#### Scenario: In-app notice for a website request
- **WHEN** In-app notices are on for new booking and a visitor submits a booking request
- **THEN** the notice leads to Inbox, where the request can be accepted or deleted

#### Scenario: Email copy does not send them to the hub
- **WHEN** photographer email is sent for a new booking request
- **THEN** the message does not claim the request already lives in the Bookings hub as a job that needs a reply
