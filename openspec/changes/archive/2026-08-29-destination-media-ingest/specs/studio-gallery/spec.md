## ADDED Requirements

### Requirement: Room-local ingest
Each Gallery hub room SHALL offer adding photos in that room. The Gallery room compact Add and wall drop SHALL upload into the Gallery pile only. The Portfolio room SHALL upload into the Portfolio pile. Albums and Work SHALL upload into the selected album or project (held). Studio SHALL NOT use one header Add as the ingest for Portfolio, albums, and Work.

#### Scenario: Add in Portfolio
- **WHEN** the photographer is in the Portfolio room and adds image files
- **THEN** those files enter the Portfolio pile without switching them to the Gallery room as Gallery originals

#### Scenario: Add on an album
- **WHEN** the photographer is in Albums with an album selected and adds image files
- **THEN** those files attach to that album

#### Scenario: Gallery header Add stays Gallery
- **WHEN** the photographer uses Add photos in the Gallery room chrome
- **THEN** the files enter the Gallery pile only
