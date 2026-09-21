## ADDED Requirements

### Requirement: Dashboard photographer greeting
Dashboard SHALL show the signed-in photographer’s identity at the top of the desk: the Studio display name when set, otherwise the login email. When a profile photo is set, Dashboard SHALL show that photograph next to the name. When no photo is set, Dashboard SHALL show initials derived from the same identity, not a broken image. Activating the greeting SHALL open Settings → Profile. The greeting SHALL NOT list client names or booking detail.

#### Scenario: Name and photo set
- **WHEN** the photographer has saved a Studio name and a profile photo and opens Dashboard
- **THEN** they see that name and photograph above the earnings plane

#### Scenario: Name only
- **WHEN** the photographer has a Studio name and no profile photo and opens Dashboard
- **THEN** they see that name and initials, and no missing-image placeholder

#### Scenario: No name yet
- **WHEN** the photographer has not saved a Studio name and opens Dashboard
- **THEN** they see the login email as the greeting label

#### Scenario: Open profile from greeting
- **WHEN** the photographer activates the greeting
- **THEN** they land on Settings → Profile
