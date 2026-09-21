## MODIFIED Requirements

### Requirement: About page content
The system SHALL display the photographer’s about content on `/about`.

Where About copy refers the visitor to another surface — the Portfolio, Work, booking, or WhatsApp — that reference SHALL be navigable rather than plain text naming a destination the visitor has to find for themselves. About SHALL offer at least one way onward from its body content, so the page is not a terminus whose only exit is the header.

#### Scenario: Visitor opens about
- **WHEN** a visitor opens `/about`
- **THEN** they see the about content managed via the Website hub

#### Scenario: Copy refers to another surface

- **WHEN** About copy tells the visitor to browse the portfolio, see Work, or book a session
- **THEN** those references are navigable to the surfaces they name

#### Scenario: Onward path from About

- **WHEN** a visitor finishes reading About
- **THEN** at least one route onward is available from the page body, not only from the header
