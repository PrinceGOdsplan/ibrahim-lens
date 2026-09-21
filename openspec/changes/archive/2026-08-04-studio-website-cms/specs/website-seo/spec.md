## ADDED Requirements

### Requirement: SEO under Site chrome
Per-page SEO fields SHALL be edited from Website Site chrome (tucked), not as a competing primary Website tab. Studio SHALL hint when key pages (at least Home and Contact) are missing a description.

#### Scenario: Missing Home description
- **WHEN** Home SEO description is empty and the photographer views Site chrome SEO
- **THEN** Studio indicates the missing description

## MODIFIED Requirements

### Requirement: Per-page SEO fields
Authenticated photographers SHALL set title, description, and related SEO fields for key public pages including Home, About, Portfolio, Work, and Contact.

#### Scenario: Update portfolio SEO
- **WHEN** the photographer saves SEO fields for Portfolio
- **THEN** the public Portfolio page exposes those metadata values to clients/crawlers
