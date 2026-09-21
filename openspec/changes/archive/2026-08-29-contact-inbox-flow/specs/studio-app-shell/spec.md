## ADDED Requirements

### Requirement: Clients hub query params survive tab changes
Changing Clients tabs (Inbox, Deliveries, Feedback, People) SHALL keep query keys that still apply to the destination (`person`, `booking`, `delivery`, `feedback`) instead of replacing the search string with only `tab`.

#### Scenario: Keep person when opening People
- **WHEN** the address includes `person` and the photographer opens the People tab
- **THEN** `person` remains in the address

### Requirement: View client reaches the person
A Bookings “View client” link SHALL open Clients → People with that person selected.

#### Scenario: Follow View client
- **WHEN** the photographer activates View client on a booking that has a Person
- **THEN** People shows that Person’s record
