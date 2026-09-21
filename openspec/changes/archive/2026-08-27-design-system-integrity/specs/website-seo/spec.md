## ADDED Requirements

### Requirement: Work story document identity

Each Work story SHALL present its own document title, so a visitor with several tabs open can tell the stories apart and a shared link names the story rather than the section. A story's share preview title and description SHALL likewise describe that story, falling back to its own title and summary when no per-story SEO fields are configured.

Work stories SHALL NOT all resolve to a single section-level title.

#### Scenario: Two stories open in tabs

- **WHEN** a visitor opens two different Work stories in separate tabs
- **THEN** each tab shows a title naming that story rather than both showing the same section title

#### Scenario: Story link shared

- **WHEN** a Work story link is shared into a messaging app
- **THEN** the preview title names that story

#### Scenario: Story without configured SEO fields

- **WHEN** a Work story has no per-story SEO title or description configured
- **THEN** its own title and summary are used rather than the section-level values
