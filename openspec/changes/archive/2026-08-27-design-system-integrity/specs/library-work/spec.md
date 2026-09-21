## MODIFIED Requirements

### Requirement: Work project management
Authenticated photographers SHALL create, edit, and delete Work projects with metadata such as title, slug, cover, and description, and SHALL attach Library images to each project.

A Work project SHALL additionally carry the fields its public story page presents: narrative body copy, and shoot facts covering the client or subject, the location, and when the shoot took place. These fields SHALL be optional, so a project can be published with only a title and description as it can today, and the public page omits what is not set.

#### Scenario: Create Work from Library images
- **WHEN** the photographer creates a Work project and selects Library images for it
- **THEN** those images form that Work project’s image set

#### Scenario: Add narrative to a project

- **WHEN** the photographer edits a Work project
- **THEN** they can enter narrative body copy and shoot facts for its public story page

#### Scenario: Publish without narrative

- **WHEN** the photographer publishes a Work project having filled only title and description
- **THEN** the project publishes, and its story page omits the unset fields rather than showing empty labels
