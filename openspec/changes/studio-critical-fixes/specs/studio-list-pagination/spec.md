## Purpose

Studio hubs load CRM and CMS records in bounded pages so Bookings, Clients, Website, Dashboard, and Library secondary lists stay responsive as the catalogue grows.

## ADDED Requirements

### Requirement: Studio list hubs page their primary collections

Studio Bookings, Clients (people, deliveries, inbox, feedback), Website CMS lists, Dashboard pulse inputs, and Library secondary lists (albums, Work, tags, id lookups) SHALL load records in bounded pages rather than a single unbounded full collection read. When more rows exist than the first page, the photographer SHALL be able to load the next page from the hub UI (or the Dashboard SHALL use a bounded recent window sufficient for the pulse).

#### Scenario: Bookings hub with more than one page

- **WHEN** the photographer opens Bookings and more bookings exist than the first page size
- **THEN** the first page renders promptly and a control loads additional bookings without reloading the whole hub

#### Scenario: Dashboard pulse stays bounded

- **WHEN** the photographer opens the Dashboard
- **THEN** pulse data is computed from bounded list fetches (not an unbounded full dump of every historical row in one request)
