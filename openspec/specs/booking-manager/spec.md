# booking-manager Specification

## Purpose
First-class Booking Manager: intake from the website, manual books, status lifecycle, notes, and People assignment.
## Requirements
### Requirement: Booking is system of record
Studio Bookings SHALL manage first-class booking records linked to a Person — not treat raw form rows as the only long-term record.

#### Scenario: Manual booking
- **WHEN** the photographer creates a booking manually with a Person (or new name+phone)
- **THEN** a booking exists in the Booking Manager without a public form submission

### Requirement: Auto-create from public booking form
Submitting the public booking form SHALL create or match a Person (via +234-normalized phone) and create a Booking in `needs_contact` status with the requested date/time and answers preserved. Public Write is a separate intake and SHALL NOT create a Booking.

#### Scenario: Web request becomes booking
- **WHEN** a visitor submits a valid booking request
- **THEN** Studio Inbox shows a `needs_contact` booking linked to that Person, and the Bookings hub does not list it until Accept

### Requirement: Status lifecycle
Each booking SHALL have exactly one status from: `needs_contact`, `pending`, `confirmed`, `completed`, `declined`, `cancelled`. `needs_contact` means unaccepted website mail and is not chosen in the Bookings hub. Accept from Inbox SHALL set status to `pending`. Hub status is chosen among `pending`, `confirmed`, `completed`, `declined`, and `cancelled`. Studio SHALL NOT present a “Needs a reply” queue.

#### Scenario: Accept lands as pending
- **WHEN** the photographer accepts a website booking request
- **THEN** the booking status is `pending` and the booking appears in the Bookings hub

#### Scenario: Pending means in the book, not locked
- **WHEN** a booking is `pending`
- **THEN** it is tracked as accepted work that is not yet locked-in, without implying an outstanding Inbox task

#### Scenario: Confirm booking
- **WHEN** the photographer sets status to `confirmed`
- **THEN** the booking is treated as locked-in work for ops and finance tracking

### Requirement: Hub lists only accepted bookings
The Booking Manager hub SHALL list bookings that have been accepted into the book (status is not the unaccepted website-request state). Unaccepted website requests SHALL NOT appear in the hub list.

#### Scenario: Website request is not in the hub
- **WHEN** a visitor submits a booking request and the photographer has not accepted it
- **THEN** that request does not appear in the Bookings hub list

#### Scenario: Accepted booking appears
- **WHEN** the photographer accepts a website request
- **THEN** that booking appears in the Bookings hub with status `pending`

### Requirement: Incomplete details alert
When a hub booking has no work fee set, Studio SHALL show a subtle, persistent alert on that booking that amounts and other studio details have not been filled in. The alert SHALL NOT be a separate Collect or “Needs a reply” queue. It SHALL clear when a fee greater than zero is saved.

#### Scenario: Newly accepted booking
- **WHEN** a booking is accepted into the hub and fee is unset
- **THEN** the booking detail shows a quiet alert that details are not filled in yet

#### Scenario: Fee saved
- **WHEN** the photographer saves a fee greater than zero
- **THEN** that incomplete-details alert is not shown

### Requirement: Bookings hub route
Authenticated photographers SHALL manage bookings at the Studio Bookings hub (`/studio/bookings`), not as a Clients tab and not as Website ops.

#### Scenario: Open Bookings hub
- **WHEN** the photographer opens the Bookings hub
- **THEN** they can list, open, create, update, and remove accepted bookings

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

### Requirement: Permanent booking removal
Studio SHALL provide an action that permanently removes a booking record. Removal is distinct from the status lifecycle: a status of `cancelled` records that an engagement will not happen, whereas removal is for records that should not exist at all, such as test submissions, spam, and duplicates.

Removal SHALL require an explicit confirmation that names the person the booking belongs to and states that the booking and its history will be removed and cannot be recovered. Removal SHALL NOT be offered as the primary action on a booking, so it cannot be reached by mistake while working through the queue.

#### Scenario: Remove a junk booking
- **WHEN** the photographer confirms removal of a booking
- **THEN** that booking no longer appears in Bookings, and the counts that included it are reduced

#### Scenario: Cancel the confirmation
- **WHEN** the photographer dismisses the removal confirmation
- **THEN** the booking is unchanged

#### Scenario: Removal is separate from cancelling
- **WHEN** the photographer sets a booking's status to `cancelled`
- **THEN** the booking remains in the Booking Manager with its history intact

### Requirement: Removal is blocked by a referencing delivery
A booking SHALL NOT be removable while a delivery references it. The photographer SHALL be told which delivery blocks the removal, so they can revoke or reassign it first.

#### Scenario: Booking has a delivery
- **WHEN** the photographer attempts to remove a booking that a delivery references
- **THEN** the removal does not run and the blocking delivery is identified

#### Scenario: Delivery removed first
- **WHEN** the referencing delivery no longer points at the booking and the photographer retries
- **THEN** the removal proceeds

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

### Requirement: Bookings views use shared hub tabs
The Bookings hub SHALL present its views as tabs in the hub toolbar using the same tab idiom as other Studio hubs. Each view MAY show a count. The hub SHALL NOT use a separate filled-pill control style for those views.

#### Scenario: Switch Bookings view
- **WHEN** the photographer opens Unpaid on Bookings
- **THEN** Unpaid is selected as a tab in the hub toolbar, and the book list follows that view

