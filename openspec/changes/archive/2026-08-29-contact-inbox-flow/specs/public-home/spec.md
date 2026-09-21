## MODIFIED Requirements

### Requirement: Brand-forward home
The system SHALL present Ibrahim Lens branding as the primary first-viewport signal with a short rotating supporting message, Soft night primary Book CTA targeting Contact booking (`/contact#booking`), and Portfolio secondary CTA linking to `/portfolio`, without Studio dashboard chrome.

#### Scenario: Visitor lands on home
- **WHEN** a visitor opens `/`
- **THEN** they see Ibrahim Lens branding, a short supporting message, Book and Portfolio CTAs, and no Studio dashboard chrome

### Requirement: Hero CTAs Soft night Book and Portfolio
The Home first viewport SHALL offer Book (to `/contact#booking`) as the primary Soft night CTA (solid brass or equivalent primary treatment) and Portfolio (to `/portfolio`) as a quieter secondary control. The hero SHALL NOT include WhatsApp. The hero SHALL NOT mount the booking form.

#### Scenario: Hero CTA row
- **WHEN** a visitor views the Home hero
- **THEN** they see a primary Book control and a secondary Portfolio control and do not see WhatsApp in the hero CTA group

### Requirement: Book CTA scrolls to booking form
Home SHALL provide a Book CTA that navigates to the Contact booking form (`/contact#booking`), the same form definition used on Contact. Home SHALL NOT include an on-page booking form.

#### Scenario: Home book CTA
- **WHEN** a visitor activates the Home Book CTA
- **THEN** they reach the booking request form on Contact

## REMOVED Requirements

### Requirement: WhatsApp under Home booking form
**Reason**: Home no longer mounts the booking form; WhatsApp stays under Contact booking and in the footer.
**Migration**: Use Contact booking WhatsApp and footer WhatsApp.

### Requirement: Home booking mobile submit comfort
**Reason**: There is no Home booking section.
**Migration**: Contact booking mobile submit comfort remains.

## ADDED Requirements

### Requirement: Home load failure is visible
If Home cannot load Website or media sources, the page SHALL present an error with a way to retry rather than rendering as an empty finished site.

#### Scenario: PocketBase unreachable
- **WHEN** Home’s content fetch fails
- **THEN** the visitor sees an error and can retry
