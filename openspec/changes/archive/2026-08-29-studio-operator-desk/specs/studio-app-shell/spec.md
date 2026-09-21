## ADDED Requirements

### Requirement: Header shows the photographer
The Studio app header profile control SHALL show the photographer’s profile photo when set, otherwise initials from display name or login email. The profile menu SHALL identify them by display name (or email), link to Settings → Profile, and keep Log out and install controls.

#### Scenario: Photo set
- **WHEN** the photographer has a profile photo
- **THEN** the header control shows that photo

#### Scenario: After profile save
- **WHEN** the photographer updates name or photo and returns to any hub
- **THEN** the header reflects the new identity without requiring a full re-login
