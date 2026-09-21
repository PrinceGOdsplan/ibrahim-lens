## ADDED Requirements

### Requirement: Settings has no Assistant chrome
Settings SHALL NOT show Assistant status, model names, or a credit line. Studio hubs SHALL keep working when Assistant is unset, the same way they work without outbound mail. Credit and setup messages SHALL appear only in the Assistant chat.

#### Scenario: Account tab
- **WHEN** the photographer opens Settings → Account
- **THEN** there is no Assistant heading, and other Settings tabs still work
