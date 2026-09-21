## Purpose

Public portfolio gallery of curated photographer images, filterable by portfolio tags.

## ADDED Requirements

### Requirement: Portfolio image gallery
The system SHALL display Portfolio-membered images on `/portfolio` as a browseable gallery.

#### Scenario: Visitor browses portfolio
- **WHEN** a visitor opens `/portfolio`
- **THEN** they see Portfolio images only (not storage-only Library images)

### Requirement: Tag filtering
The system SHALL allow visitors to filter portfolio images by tag when tags exist.

#### Scenario: Filter by tag
- **WHEN** a visitor selects a portfolio tag
- **THEN** only Portfolio images with that tag are shown

### Requirement: Distinct from Work
Portfolio SHALL present curated photographer images and SHALL remain distinct from Work case-study pages.

#### Scenario: Portfolio does not replace Work
- **WHEN** a visitor is on `/portfolio`
- **THEN** Work remains available as a separate public nav section
