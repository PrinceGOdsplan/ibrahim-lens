## MODIFIED Requirements

### Requirement: Success is confirmed only after a settled write
A success confirmation SHALL be presented only after the corresponding write has settled successfully. A pending write SHALL present a pending affordance, and a rejected write SHALL present an error. No surface SHALL report success while a write is still in flight or after it has failed.

Success and failure copy for that write SHALL appear in place on the surface that caused it and MAY fade after a short interval. The system SHALL NOT use a global toast tray for those action receipts, and SHALL NOT send email or photographer in-app/mobile notices for the mere fact that a control succeeded.

Where a write is followed by supporting operations that the actor is not authorised to perform — re-reading the new record, or appending an audit or notification entry — the outcome SHALL be determined by the write itself. A failure in a supporting operation SHALL NOT be reported as a failed submission, because the actor would then repeat a request that already succeeded.

#### Scenario: Caption save succeeds
- **WHEN** the photographer saves a Gallery image caption and the write succeeds
- **THEN** the success confirmation appears in place on that surface only after the write has completed and is not sent as email

#### Scenario: Caption save fails
- **WHEN** the photographer saves a Gallery image caption and the write fails
- **THEN** an error is shown in place and no success confirmation appears

#### Scenario: Upload fails in a Website editor
- **WHEN** an image upload started from a Website editor fails
- **THEN** the photographer is told the upload failed rather than receiving no feedback

#### Scenario: Visitor write succeeds but a supporting read is not permitted
- **WHEN** a visitor's booking request is written successfully but the follow-up read of that record is not permitted for an unauthenticated visitor
- **THEN** the visitor is told the request was received, and no error is shown
