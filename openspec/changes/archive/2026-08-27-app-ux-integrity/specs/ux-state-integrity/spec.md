## Purpose

Guarantees that the interface never asserts a fact it cannot support: loading, empty, and error are distinguishable states, success is confirmed only after a write settles successfully, failures are surfaced with a way to recover, and destructive actions are confirmed before they run.

## ADDED Requirements

### Requirement: Loading is distinguishable from empty

Any surface that fetches data SHALL distinguish "not yet loaded" from "loaded and empty". Empty-state copy — including reassurance copy such as "You're clear for now", "No photos yet", "No public Work projects yet", and "No Portfolio images published yet" — SHALL NOT render before the first fetch for that surface has settled. While a first fetch is in flight the surface SHALL present a loading affordance that reserves approximately the space the loaded content will occupy.

#### Scenario: Clients hub before first fetch settles

- **WHEN** the photographer opens Clients → Today and the first fetch has not settled
- **THEN** a loading affordance is shown and the copy "You're clear for now" is NOT shown

#### Scenario: Public Portfolio before first fetch settles

- **WHEN** a visitor opens Portfolio and the media fetch has not settled
- **THEN** a loading affordance is shown and "No Portfolio images published yet" is NOT shown

#### Scenario: Genuinely empty after load

- **WHEN** a fetch settles successfully with zero records
- **THEN** the empty state is shown with copy naming the next useful action

### Requirement: Failure is distinguishable from empty

A failed read SHALL NOT be presented as a successful empty result. Surfaces that aggregate several reads SHALL indicate when the data shown is partial. The Studio Dashboard SHALL NOT report zero counts or an empty "Needs you" console when the underlying reads failed.

#### Scenario: Dashboard read failure

- **WHEN** one or more Dashboard reads fail
- **THEN** the Dashboard indicates that data could not be loaded rather than displaying zeros and an empty console

#### Scenario: Partial load on a Studio hub

- **WHEN** some reads for a Studio hub succeed and others fail
- **THEN** the hub indicates that the view is incomplete

### Requirement: Error states offer recovery

A surface showing a read failure SHALL offer a control that retries the failed operation without requiring a full page reload. Error text presented to a person SHALL be human-readable; raw backend error strings SHALL NOT be the primary message shown to a public visitor.

#### Scenario: Retry after failed load

- **WHEN** a read fails and the visitor or photographer activates the retry control
- **THEN** the operation is attempted again and the surface reflects the new outcome

#### Scenario: Public visitor sees a readable message

- **WHEN** a public page fails to load its content
- **THEN** the message describes what failed in plain language rather than exposing backend internals

### Requirement: Success is confirmed only after a settled write

A success confirmation SHALL be presented only after the corresponding write has settled successfully. A pending write SHALL present a pending affordance, and a rejected write SHALL present an error. No surface SHALL report success while a write is still in flight or after it has failed.

Where a write is followed by supporting operations that the actor is not authorised to perform — re-reading the new record, or appending an audit or notification entry — the outcome SHALL be determined by the write itself. A failure in a supporting operation SHALL NOT be reported as a failed submission, because the actor would then repeat a request that already succeeded.

#### Scenario: Caption save succeeds

- **WHEN** the photographer saves a Gallery image caption and the write succeeds
- **THEN** the success confirmation appears only after the write has completed

#### Scenario: Caption save fails

- **WHEN** the photographer saves a Gallery image caption and the write fails
- **THEN** an error is shown and no success confirmation appears

#### Scenario: Upload fails in a Website editor

- **WHEN** an image upload started from a Website editor fails
- **THEN** the photographer is told the upload failed rather than receiving no feedback

#### Scenario: Visitor write succeeds but a supporting read is not permitted

- **WHEN** a visitor's booking request is written successfully but the follow-up read of that record is not permitted for an unauthenticated visitor
- **THEN** the visitor is told the request was received, and no error is shown

### Requirement: Destructive actions are confirmed

An action that permanently deletes a record, or that revokes client access, SHALL require an explicit confirmation step before it runs. The confirmation SHALL name what is affected and state the consequence. Confirmation SHALL be presented in-app; native browser dialogs SHALL NOT be used. The confirming control SHALL be visually distinguished as destructive.

#### Scenario: Delete an album

- **WHEN** the photographer activates delete on an album
- **THEN** a confirmation naming that album is shown and nothing is deleted until it is confirmed

#### Scenario: Revoke a delivery

- **WHEN** the photographer activates revoke on a delivery
- **THEN** a confirmation naming the client and stating that the link will stop working is shown before the revoke runs

#### Scenario: Cancel a destructive confirmation

- **WHEN** the photographer dismisses a destructive confirmation
- **THEN** no change is made

### Requirement: Transient success feedback does not linger

Success confirmations for in-place edits SHALL either clear on their own or clear when the related content changes, so a stale confirmation cannot be mistaken for the result of a later action. Save affordances SHALL reflect a saved state rather than disappearing without acknowledgement.

#### Scenario: Save bar acknowledges the save

- **WHEN** a Studio section save succeeds
- **THEN** the photographer receives a visible saved acknowledgement before the save affordance returns to its resting state

#### Scenario: Stale confirmation cleared

- **WHEN** a success confirmation is showing and the photographer edits the same content again
- **THEN** the previous confirmation is cleared
