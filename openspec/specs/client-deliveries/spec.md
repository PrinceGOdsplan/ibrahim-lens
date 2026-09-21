# client-deliveries Specification

## Purpose
Create and manage private Delivery links that send Library images, albums, or Work projects to named clients.
## Requirements
### Requirement: Create deliveries from Library selections
Authenticated photographers SHALL create Delivery links from selected images, one or more albums, or a Work project.

#### Scenario: Deliver albums or Work
- **WHEN** the photographer selects albums or a Work project and creates a Delivery with a client name
- **THEN** the system issues a tokenized `/g/:token` link for those contents

#### Scenario: Deliver hidden Work
- **WHEN** the photographer creates a Delivery from a Work project not shown on the website
- **THEN** the Delivery can include that project’s images without publishing the Work publicly

### Requirement: Client name required
Each Delivery SHALL require a client identity suitable for Studio lists — preferably a linked Person (name + phone), with legacy free-text name only as fallback during migration.

#### Scenario: Missing client blocked
- **WHEN** the photographer tries to create a Delivery without a Person or client name
- **THEN** the system rejects creation

### Requirement: Link delivery to person and optional booking
Authenticated photographers SHALL be able to link a Delivery to a Person and optionally to a Booking for that Person.

#### Scenario: Deliver from a confirmed booking context
- **WHEN** the photographer creates a Delivery from a Booking’s client
- **THEN** the Delivery is linked to that Person (and booking when selected)

### Requirement: Seven-day expiry
A Delivery SHALL expire 7 days after creation.

#### Scenario: Expire after seven days
- **WHEN** seven days pass since Delivery creation
- **THEN** the Delivery link no longer grants access

### Requirement: Manage deliveries
Authenticated photographers SHALL list, revoke, and inspect Deliveries from Clients → Deliveries, including expiry status and client name.

#### Scenario: Revoke delivery
- **WHEN** the photographer revokes a Delivery
- **THEN** the tokenized page no longer grants access and previously issued file URLs for that Delivery no longer serve image bytes

#### Scenario: Studio expiry messaging
- **WHEN** the photographer views a Delivery in Studio
- **THEN** they see the client name and when the 7-day access ends

### Requirement: Delivery file bytes follow the live token
Image bytes served for a Delivery SHALL be reachable only while that Delivery is unexpired and not revoked. After expiry or revoke, a previously copied file URL SHALL stop serving those bytes. Public Portfolio and Work file URLs SHALL remain independent of Delivery revoke.

#### Scenario: Expired file URL
- **WHEN** seven days have passed since Delivery creation and a client reuses a file URL obtained from that Delivery
- **THEN** the image bytes are not served

#### Scenario: Revoke cuts files, not the Library original
- **WHEN** the photographer revokes a Delivery
- **THEN** Delivery file URLs stop serving and the Library originals remain in Studio

### Requirement: Snapshot client email at Delivery create
When creating a Delivery, the system SHALL snapshot a client email if the photographer types one on the create form, or if they select a saved Person who has an email and no override is typed. That snapshotted value SHALL be the only address used for that Delivery’s client mail. A Person without email and a blank form field SHALL create the Delivery with no snapshotted email.

#### Scenario: Typed email
- **WHEN** the photographer enters a client email on Create delivery and saves
- **THEN** that address is stored on the Delivery and later Person edits do not replace it

#### Scenario: Person with email selected
- **WHEN** the photographer selects a saved Person who has an email, leaves the email field empty, and creates the Delivery
- **THEN** the Person’s email at create time is stored on the Delivery

#### Scenario: Person without email
- **WHEN** the photographer selects a saved Person who has no email and does not type an email
- **THEN** the Delivery is created with no snapshotted email

### Requirement: First download is recorded on the Delivery
The first successful client download of an original from a live Delivery SHALL be recorded on that Delivery by the server when it serves that original file. Viewing the gallery SHALL NOT set that record. Subsequent downloads SHALL NOT clear or multiply the first-download record.

A guest SHALL NOT record a download by creating a form inquiry or any other unauthenticated write. Inbox MAY still log the activity; that log SHALL be written by the server after the file is served.

#### Scenario: First file taken
- **WHEN** a client downloads an original from a Delivery that has no first-download record
- **THEN** the Delivery is marked as downloaded and Inbox may still log the activity

#### Scenario: View only
- **WHEN** a client opens `/g/:token` and does not download
- **THEN** the Delivery is not marked as downloaded

#### Scenario: Inquiry cannot stamp download
- **WHEN** an unauthenticated client creates a form inquiry that claims a download
- **THEN** the Delivery’s first-download record does not change

### Requirement: Visual pick for delivery contents
Studio SHALL let the photographer choose Delivery contents by tapping photographs, album covers, or Work covers. It SHALL NOT use a checkbox list of filenames as the photo picker. Photo picks SHALL use the shared Studio image gallery (Gallery and Portfolio). Album and Work picks SHALL show covers. Create SHALL stay disabled until a client name (or Person) and at least one valid source selection exist.

#### Scenario: Pick photographs for a delivery
- **WHEN** the photographer creates a Delivery from photographs
- **THEN** they tap thumbs in the shared image gallery and confirm, rather than ticking a filename checkbox list

#### Scenario: Pick an album or Work
- **WHEN** the photographer creates a Delivery from albums or a Work project
- **THEN** they tap cover tiles for those collections

#### Scenario: Create without a selection
- **WHEN** the photographer has a client name but has not chosen photographs, albums, or Work
- **THEN** Create stays disabled (or is rejected with an error next to the create panel)

### Requirement: Delivery file copy completes with create
When an authenticated photographer creates a Delivery, the system SHALL copy the selected originals into per-delivery files as part of that create. The photographer SHALL NOT be required to download and re-upload those originals in the browser. If the copy cannot complete, the Delivery SHALL NOT remain as a working gallery with missing files.

#### Scenario: Create copies files without a browser re-upload
- **WHEN** the photographer creates a Delivery from selected photographs
- **THEN** the Delivery’s client gallery files exist without the Studio tab fetching each original and posting it again

#### Scenario: Copy failure does not leave a half delivery
- **WHEN** the file copy fails after a Delivery record is inserted
- **THEN** the photographer sees a create error and that Delivery is not left as an active gallery with no files

### Requirement: Inspect and edit a delivery after create
Studio SHALL let the photographer open a Delivery after it is created and see the photographs on it. They SHALL be able to edit client name, email, and studio notes. Changing the photograph set after create is out of scope.

#### Scenario: Open a delivery in Studio
- **WHEN** the photographer selects a Delivery in Clients → Deliveries
- **THEN** they see that Delivery’s photographs and can save a new name, email, or studio notes

### Requirement: Guest gallery shows only that Delivery's files
The tokenized `/g/:token` page SHALL list only `delivery_files` that belong to that Delivery, even when the visitor is also signed in to Studio. Photograph thumbs SHALL use file sizes that exist on those copies.

#### Scenario: Logged-in preview matches the selection
- **WHEN** the photographer opens their own Delivery link while signed in to Studio
- **THEN** the gallery shows only the photographs chosen for that Delivery, and those photographs render

