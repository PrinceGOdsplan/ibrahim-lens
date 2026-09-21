## Purpose

Phone-first People directory for the Nigerian studio market: durable client identity shared by bookings and deliveries.

## ADDED Requirements

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
