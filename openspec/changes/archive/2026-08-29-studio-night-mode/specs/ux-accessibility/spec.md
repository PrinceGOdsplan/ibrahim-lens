## MODIFIED Requirements

### Requirement: Native controls match the surface theme
Surfaces rendered on the warm-dark public palette SHALL declare a dark colour scheme so browser-supplied control chrome — date and time pickers, select indicators, checkboxes, and scrollbars — renders legibly rather than as dark chrome on a dark background.

Studio surfaces on the light desk SHALL declare a light colour scheme. When Studio night mode is active, Studio surfaces SHALL declare a dark colour scheme so the same native control chrome stays legible on the Soft-night–related desk.

#### Scenario: Preferred date and time control
- **WHEN** a visitor views the booking form preferred date and time control on the public site
- **THEN** the browser-supplied picker affordance is legible against the warm-dark surface

#### Scenario: Delivery favourite checkbox
- **WHEN** a client views the favourite checkbox on the Delivery page
- **THEN** the checkbox is legible against the warm-dark surface

#### Scenario: Studio night native controls
- **WHEN** the photographer views a Studio form control while night mode is active
- **THEN** browser-supplied control chrome is legible against the night Studio surface
