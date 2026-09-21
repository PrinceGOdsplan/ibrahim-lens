## MODIFIED Requirements

### Requirement: Upload flow clarity
Library upload SHALL present a straightforward add-photos flow with plain-language errors (size/type) suitable for phone use.

Upload is the most-used action in the hub and SHALL be presented as a designed affordance rather than an unstyled system control. On pointer devices the photographer SHALL be able to drop files onto a visible target, and that target SHALL indicate when a dragged file is over it. Choosing files through a picker SHALL remain available, since drag-and-drop is not usable on touch.

The control SHALL NOT require a review step before allowed files begin landing in the destination pile. Accepted formats and the size ceiling SHALL be stated when a file is rejected, and SHALL NOT occupy the hub header before anything is chosen. The control SHALL NOT rely on browser-generated text such as a no-file-selected label to communicate its state.

#### Scenario: Upload from phone
- **WHEN** the photographer uploads allowed images from a phone
- **THEN** images enter the Library with clear success or error feedback

#### Scenario: Dropping files onto the target
- **WHEN** the photographer drags image files over the upload target on a pointer device
- **THEN** the target indicates it will accept them, and dropping begins the upload

#### Scenario: Constraints stated on rejection
- **WHEN** the photographer chooses a file that is the wrong type or over the size ceiling
- **THEN** the rejection names the accepted formats or the size ceiling, without those rules sitting as header copy beforehand

#### Scenario: Picker still available on touch
- **WHEN** the photographer uses Library on a touch device
- **THEN** they can open a file picker, since dragging is unavailable
