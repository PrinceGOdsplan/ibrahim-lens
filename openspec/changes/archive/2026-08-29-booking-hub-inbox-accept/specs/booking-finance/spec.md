## ADDED Requirements

### Requirement: Unpaid balance without a Collect surface
Studio SHALL show unpaid / outstanding NGN on the booking in the Bookings hub and as a Dashboard total. It SHALL NOT provide a separate Collect page, tab, or Needs-you chase list for unpaid bookings.

#### Scenario: Balance on the booking
- **WHEN** a hub booking has a fee greater than amount paid
- **THEN** the booking detail shows the outstanding amount

#### Scenario: Dashboard total
- **WHEN** confirmed or completed bookings have outstanding NGN
- **THEN** Dashboard shows that outstanding total without listing each debtor as a Collect task
