## MODIFIED Requirements

### Requirement: Simple financial report
Authenticated photographers SHALL see a Studio finance summary on Dashboard that includes: total earned (lifetime sum of amount paid on hub bookings), collected in the selected period, booked fees in the selected period, and outstanding balances on open confirmed or completed books (current, not period-scoped). Currency remains NGN. The summary SHALL NOT list per-booking client names or fees on Dashboard.

#### Scenario: Outstanding total
- **WHEN** confirmed or completed bookings have fee greater than amount paid
- **THEN** the report shows outstanding NGN for those bookings as a single total

#### Scenario: Lifetime earned
- **WHEN** hub bookings have amount paid recorded
- **THEN** Dashboard total earned equals the sum of those amounts

#### Scenario: Period collected
- **WHEN** amount paid increases on a booking inside the selected period
- **THEN** Collected for that period includes the increase

#### Scenario: Period booked fees
- **WHEN** a hub booking first receives a fee greater than zero inside the selected period (or enters the hub with a fee already set in that window)
- **THEN** Booked for that period includes that fee once, without double-counting later fee edits that do not newly introduce a fee

## ADDED Requirements

### Requirement: Period collected from payment events
Collected in a period SHALL be derived from booking money-change history (payment increases) timestamped in that window, not from filtering current amount-paid by booking created date alone.

#### Scenario: Partial payment mid-week
- **WHEN** the photographer logs an additional payment on an older booking inside the selected 7-day window
- **THEN** that increase counts toward Collected for the window
