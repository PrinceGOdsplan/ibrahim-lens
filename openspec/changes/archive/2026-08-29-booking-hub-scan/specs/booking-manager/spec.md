## ADDED Requirements

### Requirement: Hub list is scannable without opening a record
Each accepted booking in the Bookings hub list SHALL show the person, preferred date/time (or that none is set), status, and payment line. Rows with no fee set or with an outstanding balance SHALL be distinguishable in the list. The default order SHALL be soonest preferred date first; bookings with no date sort after dated ones.

#### Scenario: Read the book from the list
- **WHEN** the photographer opens the Bookings hub with several accepted bookings
- **THEN** they can see who, when, status, and money for each row without selecting a booking

### Requirement: Hub views of the book
The Bookings hub SHALL offer views Upcoming (default), Incomplete, Unpaid, and All on the same page. Upcoming is pending or confirmed work. Incomplete is accepted bookings with no fee set. Unpaid is accepted bookings with a fee and amount paid less than the fee. All includes declined and cancelled. These views SHALL NOT be a separate Collect or Today surface.

#### Scenario: Upcoming is the default
- **WHEN** the photographer opens `/studio/bookings` with no view in the address
- **THEN** they see the Upcoming view

#### Scenario: Incomplete view
- **WHEN** the photographer opens Incomplete
- **THEN** only accepted bookings with no fee set are listed

#### Scenario: Unpaid view
- **WHEN** the photographer opens Unpaid
- **THEN** only accepted bookings with outstanding NGN are listed

### Requirement: Read-first booking card with next-step actions
Selecting a hub booking SHALL present a read-first card of facts (person, phone, when, status, payment, notes, form answers) and next-step actions appropriate to that booking: Confirm when pending, Complete when confirmed, Record payment when a balance remains, Set fee when fee is unset. Full editors for schedule, money, notes, other statuses, and removal SHALL NOT be the default surface; they SHALL be available behind an Edit details action.

#### Scenario: Pending next step
- **WHEN** the photographer selects a pending booking
- **THEN** they can Confirm it from the card without opening the field editor

#### Scenario: Record payment from the card
- **WHEN** the photographer records a payment amount on a booking with outstanding NGN
- **THEN** amount paid increases (not above the fee) and the card updates

#### Scenario: Edit is secondary
- **WHEN** the photographer needs to change schedule, notes, or decline/cancel
- **THEN** they open Edit details rather than landing in a form of Save buttons

### Requirement: Manual create is a full book
The Bookings hub New booking form SHALL collect person (existing, or name, phone, optional email), date, fee, amount paid, session facts from the website questions, and notes. Labels and placeholders SHALL be photographer-facing (Session, People, Location), not the public question wording. Client prompt questions such as “anything we should know” SHALL NOT appear; notes cover that. The created booking SHALL land as `pending` and skip Inbox.

#### Scenario: Phone book in one pass
- **WHEN** the photographer creates a booking from a call with date, fee, notes, and session details
- **THEN** those fields are on the hub row and card without opening Edit details first
