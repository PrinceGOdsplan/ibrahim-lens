# booking-finance Specification

## Purpose
NGN money tracking on bookings: fee for the work, amount paid, payment state, and simple Studio reports.
## Requirements
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

### Requirement: Unpaid balance without a Collect surface
Studio SHALL show unpaid / outstanding NGN on the booking in the Bookings hub and as a Dashboard total. It SHALL NOT provide a separate Collect page, tab, or Needs-you chase list for unpaid bookings.

#### Scenario: Balance on the booking
- **WHEN** a hub booking has a fee greater than amount paid
- **THEN** the booking detail shows the outstanding amount

#### Scenario: Dashboard total
- **WHEN** confirmed or completed bookings have outstanding NGN
- **THEN** Dashboard shows that outstanding total without listing each debtor as a Collect task

### Requirement: Unpaid is a Bookings hub view
Outstanding balances SHALL be reviewable as the Unpaid view of the Bookings hub. Studio SHALL NOT introduce a Collect page or Needs-you chase list for those bookings.

#### Scenario: Open unpaid from the hub
- **WHEN** the photographer opens the Unpaid view
- **THEN** they see hub bookings that still have outstanding NGN, with payment lines on the rows

