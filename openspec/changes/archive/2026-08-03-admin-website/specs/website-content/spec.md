## Purpose

CMS for public marketing and site copy, including a capped custom services package builder and Portfolio-sourced Home featured picks.

## ADDED Requirements

### Requirement: Editable website sections
Authenticated photographers SHALL edit Home, About, Services, Testimonials, FAQ, and global site content from the Website hub.

#### Scenario: Update services packages
- **WHEN** the photographer updates Services packages in Website → Services
- **THEN** the public Home services teaser reflects the updated packages

### Requirement: Custom services packages with max entries
Services SHALL be managed as a custom package list with a maximum number of entries (default 12).

#### Scenario: Cap reached
- **WHEN** the photographer already has the maximum number of service packages
- **THEN** the system prevents adding another package until one is removed

### Requirement: No public services page
Services content SHALL be presented on the Home teaser only and SHALL NOT require a standalone `/services` public page.

#### Scenario: Services only on Home
- **WHEN** a visitor looks for services
- **THEN** services appear as a Home section without a dedicated services route in main nav

### Requirement: Home featured from Portfolio
Home featured/highlight images SHALL be chosen only from Library images that are in Portfolio.

#### Scenario: Select Home featured images
- **WHEN** the photographer configures Home featured images
- **THEN** only Portfolio images are selectable

### Requirement: Contact details in globals
Authenticated photographers SHALL edit public contact details in Website globals for display on Contact.

#### Scenario: Update phone or email display
- **WHEN** the photographer saves new public contact details
- **THEN** `/contact` shows the updated details

### Requirement: Testimonials manual and promoted
Authenticated photographers SHALL create testimonials manually and SHALL be able to publish testimonials promoted from client feedback after editing.

#### Scenario: Save a testimonial
- **WHEN** the photographer saves a testimonial (manual or edited promotion)
- **THEN** it can appear in the Home testimonials teaser
