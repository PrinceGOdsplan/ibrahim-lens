## MODIFIED Requirements

### Requirement: Mobile push shows in the OS tray

When Mobile is enabled for an event, the device is an installed Studio with an active Web Push subscription, and that event fires, the system SHALL deliver a user-visible OS notification (notification tray / banners), not only update the in-app notice list or home-screen badge. The badge MAY still reflect unread in-app count. A failed push SHALL surface on the Settings notices health path the same way other send errors do.

#### Scenario: Feedback with Mobile on appears in the tray

- **WHEN** Mobile is on for feedback, the photographer has allowed phone notices on the installed Studio, and a client leaves Delivery feedback
- **THEN** the phone shows a tray notification for that feedback in addition to any in-app notice and badge update

#### Scenario: Allow phone notices stores the push secret for the worker

- **WHEN** the photographer taps Allow phone notices (or Save notices with Mobile on) on the installed Studio
- **THEN** the service worker can resolve pending push payloads and show a tray notification on the next successful push
