## ADDED Requirements

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
