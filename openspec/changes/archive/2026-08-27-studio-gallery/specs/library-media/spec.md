## ADDED Requirements

### Requirement: Two photo piles Gallery and Portfolio
Media SHALL live in two piles: Gallery (everyday uploads) and Portfolio (one-way copies for public use). Sending a Gallery photo to Portfolio SHALL create a Portfolio copy without replacing the Gallery original.

#### Scenario: Send to Portfolio
- **WHEN** the photographer sends a Gallery photo to Portfolio
- **THEN** a Portfolio copy is created and the Gallery original remains

### Requirement: Delete Gallery with Portfolio copy prompt
Deleting a Gallery photo that has one or more Portfolio copies SHALL prompt the photographer to delete Gallery only or delete both. Deleting Gallery only SHALL leave Portfolio copies available.

#### Scenario: Delete Gallery only
- **WHEN** the photographer chooses Gallery only on delete
- **THEN** the Gallery photo is removed and Portfolio copies remain

#### Scenario: Delete both
- **WHEN** the photographer chooses delete both
- **THEN** the Gallery photo and its Portfolio copies are removed

### Requirement: Website may pick either pile
Website image pickers SHALL allow selecting photos from Gallery or Portfolio.

#### Scenario: Pick Featured from Gallery
- **WHEN** the photographer picks a Featured image from Gallery
- **THEN** that Gallery photo may be used on the public Home featured slideshow
