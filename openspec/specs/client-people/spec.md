# client-people Specification

## Purpose
Phone-first People directory for the Nigerian studio market: durable client identity shared by bookings and deliveries.

## Requirements

### Requirement: People records
Authenticated photographers SHALL create and edit People with required display name, required phone number, optional email, and optional Studio-only notes.

#### Scenario: Create person
- **WHEN** the photographer saves a new person with name and phone
- **THEN** the person appears in Clients → People

#### Scenario: Email optional
- **WHEN** the photographer saves a person without an email
- **THEN** the record remains valid

### Requirement: +234 phone entry and normalization
Phone entry in Studio and on the public booking form SHALL use a fixed **`+234` prefix** plus national digits. A leading `0` typed on the national segment after `+234` SHALL be stripped. Matching SHALL use normalized digits (typically `234` + national number without trunk zero).

#### Scenario: Match existing by phone on intake
- **WHEN** a booking form is submitted with a phone that normalizes to an existing Person’s phone
- **THEN** the new booking links to that existing Person rather than creating a duplicate by default

#### Scenario: Strip zero after country code
- **WHEN** national input is `08031234567` with prefix `+234`
- **THEN** the Person phone is stored as `+2348031234567`

### Requirement: Person history
Opening a Person SHALL show their linked bookings (and deliveries when linked) for operational context.

#### Scenario: View booking history on person
- **WHEN** the photographer opens a Person who has bookings
- **THEN** those bookings are listed with status and key money fields

### Requirement: Removing an unreferenced person
Removing a booking SHALL NOT remove the person it was linked to, because a person can hold other bookings and deliveries. When removing a booking leaves that person with no bookings and no deliveries, Studio SHALL offer to remove the person as a separate, declinable step.

A person that is still referenced by any booking or delivery SHALL NOT be removable.

#### Scenario: Person left with nothing
- **WHEN** removing a booking leaves its person with no bookings and no deliveries
- **THEN** Studio offers to remove that person, and declining leaves the person in the directory

#### Scenario: Person still has other bookings
- **WHEN** removing a booking leaves its person with at least one other booking
- **THEN** the person is retained and no removal is offered

#### Scenario: Referenced person cannot be removed
- **WHEN** the photographer attempts to remove a person that a booking or delivery references
- **THEN** the removal does not run and the reference is identified

### Requirement: Directory phone saves when editing finishes
When editing an existing Person’s phone in Clients → People, Studio SHALL persist the number when the photographer leaves the field (or saves), not on each keystroke.

#### Scenario: Type a phone
- **WHEN** the photographer changes digits in an existing person’s phone and leaves the field
- **THEN** one update is stored with the completed number

### Requirement: Person query opens that person
Opening Clients → People with a person id in the address SHALL select that person in the directory.

#### Scenario: View client from a booking
- **WHEN** the photographer follows View client from a booking to People with that person’s id
- **THEN** that person is selected, not an empty directory

### Requirement: People API is Studio-only
Unauthenticated clients SHALL NOT list, view, or create People. Phone match on public Book and Write SHALL happen on the server and SHALL NOT expose another Person’s name, email, or notes to the visitor.

#### Scenario: Phone query is rejected
- **WHEN** an unauthenticated client lists People filtered by phone digits
- **THEN** no People records are returned

#### Scenario: Guest create is rejected
- **WHEN** an unauthenticated client POSTs a People record
- **THEN** the create is rejected

#### Scenario: Book still matches
- **WHEN** a visitor submits Book with a phone that already belongs to a Person
- **THEN** the new booking links to that Person and the visitor is not shown that Person’s notes
