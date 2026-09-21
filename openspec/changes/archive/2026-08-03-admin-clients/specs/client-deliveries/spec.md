## Purpose

Create and manage private Delivery links that send Library images, albums, or Work projects to named clients.

## ADDED Requirements

### Requirement: Create deliveries from Library selections
Authenticated photographers SHALL create Delivery links from selected images, one or more albums, or a Work project.

#### Scenario: Deliver albums or Work
- **WHEN** the photographer selects albums or a Work project and creates a Delivery with a client name
- **THEN** the system issues a tokenized `/g/:token` link for those contents

#### Scenario: Deliver hidden Work
- **WHEN** the photographer creates a Delivery from a Work project not shown on the website
- **THEN** the Delivery can include that project’s images without publishing the Work publicly

### Requirement: Client name required
Each Delivery SHALL require a client name so Studio lists and Inbox remain identifiable.

#### Scenario: Missing client name blocked
- **WHEN** the photographer tries to create a Delivery without a client name
- **THEN** the system rejects creation until a client name is provided

### Requirement: Seven-day expiry
A Delivery SHALL expire 7 days after creation.

#### Scenario: Expire after seven days
- **WHEN** seven days pass since Delivery creation
- **THEN** the Delivery link no longer grants access

### Requirement: Manage deliveries
Authenticated photographers SHALL list, revoke, and inspect Deliveries from Clients → Deliveries, including expiry status and client name.

#### Scenario: Revoke delivery
- **WHEN** the photographer revokes a Delivery
- **THEN** the tokenized link no longer grants access

#### Scenario: Studio expiry messaging
- **WHEN** the photographer views a Delivery in Studio
- **THEN** they see the client name and when the 7-day access ends
