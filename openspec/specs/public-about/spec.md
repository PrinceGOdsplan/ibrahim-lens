# public-about Specification

## Purpose
Shows photographer biography and about information for Ibrahim Lens visitors.

## Requirements

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

### Requirement: About page Street Plain continuity
The About page SHALL keep photographer about content from Website globals and MAY use Soft night chrome (quiet eyebrows, Syne/Sora). It SHALL NOT require the Home tease headline to be duplicated as the only About H1—About may lead with brand/name while Home tease uses Less talk / More visuals.

#### Scenario: Visitor opens about with Soft night chrome
- **WHEN** a visitor opens `/about`
- **THEN** they see about content managed via the Website hub with Soft night public chrome

### Requirement: Artist portrait from Library flag
`/about` SHALL display the Library image flagged as Artist portrait when present, not an image selected only by caption text “Artist”.

#### Scenario: Flagged portrait on About
- **WHEN** a Library image is flagged as Artist portrait
- **THEN** `/about` shows that image in the artist slot

### Requirement: About subtitle from CMS
`/about` SHALL show an optional subtitle from Website About when set; otherwise Soft night default identity line MAY appear.

#### Scenario: Custom About subtitle
- **WHEN** About subtitle is saved in Website
- **THEN** `/about` shows that subtitle
