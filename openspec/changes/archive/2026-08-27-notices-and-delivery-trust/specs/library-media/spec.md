## REMOVED Requirements

### Requirement: No watermarks in v1
**Reason**: Delivery gallery view now carries a quiet wordmark. Stored Library originals and public pages stay unmarked.
**Migration**: Follow the new “Stored originals remain unmarked” requirement here and the Delivery view-mark requirement in `client-gallery`. Public Home featured remains unmarked.

## ADDED Requirements

### Requirement: Stored originals remain unmarked
Uploaded Library originals SHALL NOT be stamped with a watermark in storage. Public listings that use those originals or their thumbnails SHALL remain unmarked. A quiet view mark MAY appear only on Delivery gallery viewing, not on the stored file and not on download originals.

#### Scenario: Original remains unmarked
- **WHEN** an image is stored in the Library or shown on a public page
- **THEN** the stored file is not stamped with a watermark overlay

#### Scenario: Delivery download still unmarked
- **WHEN** a client downloads an image from a valid Delivery
- **THEN** the downloaded file is the unmarked original-resolution asset
