## Purpose

Simple portfolio tags to separate or group similar picture types on the public Portfolio, managed from Settings.

## ADDED Requirements

### Requirement: Tag list in Settings
Authenticated photographers SHALL manage a simple list of portfolio tags (create, rename, delete) under Settings, not as a primary Library hub tab.

#### Scenario: Manage tags in Settings
- **WHEN** the photographer adds a tag in Settings → Portfolio tags
- **THEN** that tag becomes available to assign to Portfolio images

### Requirement: Assign tags to portfolio images
Authenticated photographers SHALL assign tags to Portfolio images for public filtering.

#### Scenario: Filterable tag assignment
- **WHEN** the photographer assigns a tag to a Portfolio image
- **THEN** visitors can filter `/portfolio` by that tag when filters are shown
