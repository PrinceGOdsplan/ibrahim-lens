# client-feedback Specification

## Purpose
Collect client feedback on Deliveries and allow the photographer to edit and promote feedback into Website testimonials.

## Requirements

### Requirement: Submit feedback on delivery
Clients viewing a valid Delivery SHALL be able to submit feedback and/or mark image selections. The create SHALL require the live Delivery token in the request. A Delivery id alone SHALL NOT be enough. Guests SHALL NOT set reviewed or promoted; those flags SHALL start false.

#### Scenario: Client leaves feedback
- **WHEN** a client submits feedback on a Delivery gallery
- **THEN** the feedback is stored and visible in Clients → Feedback and Inbox

#### Scenario: Token required
- **WHEN** an unauthenticated client creates feedback with a Delivery id and no valid token
- **THEN** the create is rejected

#### Scenario: Guest cannot mark reviewed
- **WHEN** a client submits feedback with reviewed or promoted set true
- **THEN** the stored row is still unreviewed and not promoted

### Requirement: Review feedback in Studio
Authenticated photographers SHALL review feedback tied to Deliveries.

#### Scenario: Photographer opens feedback
- **WHEN** the photographer opens Clients → Feedback
- **THEN** they see feedback entries linked to the relevant Delivery

### Requirement: Edit and promote to testimonial
Authenticated photographers SHALL edit feedback before publishing it as a Website testimonial.

#### Scenario: Promote after edit
- **WHEN** the photographer edits feedback and confirms publish as testimonial
- **THEN** a testimonial becomes available for the Home testimonials section
