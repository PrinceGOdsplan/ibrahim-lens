## Purpose

NGN money tracking on bookings: fee for the work, amount paid, payment state, and simple Studio reports.

## ADDED Requirements

### Requirement: NGN amounts on booking
Each booking SHALL support a work fee amount and an **amount paid** amount, both in **NGN** (naira). Currency is fixed for this product; no multi-currency picker in this change.

#### Scenario: Set fee and amount paid
- **WHEN** the photographer enters a fee of ₦150,000 and amount paid of ₦50,000
- **THEN** those values persist on the booking and display as NGN

### Requirement: Payment state
The system SHALL expose payment state as unpaid, partial, or paid (and optionally waived) based on fee vs amount paid, and allow the photographer to filter bookings accordingly.

#### Scenario: Partial payment
- **WHEN** amount paid is greater than zero and less than the fee
- **THEN** the booking is treated as partial

#### Scenario: Paid in full
- **WHEN** amount paid is greater than or equal to the fee and fee is greater than zero
- **THEN** the booking is treated as paid

### Requirement: Simple financial report
Authenticated photographers SHALL see a simple Studio finance summary for bookings (at least: amount paid in a period, outstanding balances on open books).

#### Scenario: Outstanding total
- **WHEN** confirmed or completed bookings have fee greater than amount paid
- **THEN** the report shows outstanding NGN for those bookings
