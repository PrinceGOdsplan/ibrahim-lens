## Purpose

Gives operators a cheap way to know the origin is answering, without turning Studio into a monitoring product. A health URL is enough; there is no in-app status dashboard, APM, or on-call rotation.

## ADDED Requirements

### Requirement: Origin health URL
The deployed origin SHALL expose an unauthenticated health URL that reports whether the application backend is reachable. The response SHALL NOT require a Studio session and SHALL NOT be cached as a long-lived public asset.

#### Scenario: Operator pings health
- **WHEN** an operator or uptime checker requests the origin health URL
- **THEN** a successful response indicates the backend is up, and a failure indicates it is not

#### Scenario: Health is not a Studio screen
- **WHEN** the photographer opens Studio
- **THEN** they are not presented with an observability or uptime dashboard as a hub

### Requirement: Health is operator-owned
Operators SHALL be able to point a third-party HTTP ping at the health URL. The product SHALL NOT require a paid monitoring platform as a core dependency.

#### Scenario: Free ping is enough
- **WHEN** an operator configures a periodic HTTP GET to the health URL
- **THEN** that is a complete health check for this capability
