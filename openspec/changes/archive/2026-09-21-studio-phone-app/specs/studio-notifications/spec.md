## ADDED Requirements

### Requirement: Mobile push subscribe is a tap in installed Studio
The system SHALL request Web Push permission and create a push subscription only after the photographer taps an explicit control in Settings while this window is the installed Studio app. A page load, route change, or login SHALL NOT be the sole path that requests permission on platforms that ignore non-tap prompts. Until that tap succeeds, Mobile SHALL NOT be treated as deliverable on that device.

#### Scenario: Allow phone notices
- **WHEN** Studio is standalone, VAPID is configured, and the photographer taps Allow phone notices
- **THEN** the browser permission prompt can appear and, if granted, that device can receive Mobile notices for events that have Mobile on

#### Scenario: Load is not enough on iOS
- **WHEN** the photographer opens installed Studio and does not tap Allow phone notices
- **THEN** iOS is not expected to grant push from that load alone, and Settings still offers the tap control

### Requirement: Mobile notices need VAPID in production
Web Push SHALL NOT be offered as working when the application has no VAPID public key. Settings SHALL NOT imply that Mobile is available if subscribe cannot run because the key is missing. Production deploy SHALL provide the VAPID pair to PocketBase and the public key to the Studio client.

#### Scenario: Key missing
- **WHEN** the Studio client has no VAPID public key and the photographer is in standalone Studio
- **THEN** Allow phone notices cannot complete a subscription, and the UI explains that phone notices are not configured rather than failing silently

#### Scenario: Key present
- **WHEN** production has VAPID configured and the photographer allows phone notices in standalone Studio
- **THEN** a push subscription can be stored for that device

### Requirement: iOS receives the Mobile ping
A Mobile send SHALL wake the installed Studio worker on iOS such that a visible system notice can appear. If an empty Web Push body is dropped by Apple, the send path SHALL use a payload Apple will deliver, then show the pending Studio notice as today.

#### Scenario: Booking while the app is closed
- **WHEN** Mobile is on for new booking, a subscription exists, and a visitor completes booking submit successfully while Studio is not open
- **THEN** the photographer’s iPhone can show a Studio notice for that booking

### Requirement: Home-screen badge follows unread in-app notices
While Studio is installed and the platform supports app badges, the system SHALL set the home-screen badge to the current unread in-app notice count and SHALL clear it when that count is zero. Badge updates SHALL NOT replace Mobile push or the in-app notice list.

#### Scenario: New notice while installed
- **WHEN** an in-app notice arrives and the unread count becomes greater than zero on a supporting installed Studio
- **THEN** the home-screen icon badge reflects that count

#### Scenario: Cleared notices
- **WHEN** the photographer clears all in-app notices
- **THEN** the badge is cleared
