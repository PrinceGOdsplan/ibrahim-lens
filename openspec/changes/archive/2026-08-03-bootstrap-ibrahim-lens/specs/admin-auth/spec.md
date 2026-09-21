## Purpose

Provides photographer-only email and password authentication so Studio hubs remain private, including a repeatable seed path for the first account.

## ADDED Requirements

### Requirement: Email and password login
The system SHALL allow the photographer to authenticate with email and password only and obtain an authenticated Studio session.

#### Scenario: Successful login
- **WHEN** the photographer submits valid email and password
- **THEN** the system establishes an authenticated session and grants access to Studio routes

#### Scenario: Failed login
- **WHEN** the photographer submits invalid credentials
- **THEN** the system denies access and shows an authentication error without exposing Studio content

### Requirement: Seed script for first photographer
The system SHALL provide a seed script that creates the photographer Studio account from environment configuration for local and VPS setups.

#### Scenario: Seed photographer account
- **WHEN** an operator runs the seed script with configured email and password env values
- **THEN** a Studio-capable photographer account exists and can log in at `/studio`

### Requirement: Protected Studio routes
The system SHALL prevent unauthenticated users from viewing Studio hub pages under `/studio/*`.

#### Scenario: Unauthenticated Studio access
- **WHEN** an unauthenticated user requests a `/studio` route
- **THEN** the system redirects them to login and does not render Studio content

### Requirement: Logout
The system SHALL allow an authenticated photographer to end their session.

#### Scenario: Photographer logs out
- **WHEN** the photographer chooses logout
- **THEN** the Studio session ends and subsequent Studio requests require login again
