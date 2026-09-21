## ADDED Requirements

### Requirement: Assistant sheet handoffs stay on the current desk
When Assistant requests an upload sheet, Website tab, Settings tab, or Pick photos modal, Studio SHALL open that surface on the authenticated Studio shell without adding a sixth hub and without leaving the photographer on a blank route. Closing the sheet SHALL return them to the hub they were viewing.

#### Scenario: Upload sheet from Assistant
- **WHEN** Assistant requests the Gallery upload handoff
- **THEN** Gallery is active and the upload sheet is open, and the bottom-corner Assistant control remains available

#### Scenario: Settings tab from Assistant
- **WHEN** Assistant navigates to Settings Notifications
- **THEN** Settings shows the Notifications tab and no separate Assistant hub appears in the rail

### Requirement: Assistant overlay uses configured identity
The Assistant overlay chrome SHALL present the configured Assistant display name and avatar (or their defaults) so the photographer recognizes who they are chatting with. The bottom-corner control MAY keep a compact Assistant affordance; identity detail lives in the open overlay.

#### Scenario: Open overlay with custom avatar
- **WHEN** an Assistant profile picture is set and the photographer opens Assistant
- **THEN** the overlay header shows that avatar beside the configured name
