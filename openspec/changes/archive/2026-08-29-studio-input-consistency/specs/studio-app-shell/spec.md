## ADDED Requirements

### Requirement: Studio field helpers stay one language
Studio search, Nigerian phone, and naira amount fields SHALL use the shared Studio field chrome. Search in Gallery and Clients SHALL be the same search input pattern. Phone studio tone SHALL read as one control with neighboring underline fields. Amount fields SHALL show a persistent ₦ prefix and use a numeric input mode on phone.

Settings notice checkboxes SHALL offer at least a 44 by 44 CSS pixel hit on touch-capable viewports (padding on the cell or label).

#### Scenario: Search is the same control
- **WHEN** the photographer searches Gallery photos and Clients people
- **THEN** both fields are search inputs using the shared Studio text field chrome

#### Scenario: Phone sits with name and email
- **WHEN** the photographer adds a person on Bookings or Clients
- **THEN** the +234 phone control aligns visually with the name and email fields rather than a separate boxed family

#### Scenario: Fee shows naira
- **WHEN** the photographer edits a booking fee or amount paid
- **THEN** ₦ is visible without relying on placeholder text alone

#### Scenario: Notice checkbox on phone
- **WHEN** the photographer toggles a Settings notice channel on a phone-width viewport
- **THEN** the hit target is at least 44 by 44 CSS pixels
