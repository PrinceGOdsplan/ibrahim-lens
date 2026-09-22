## MODIFIED Requirements

### Requirement: Standalone Studio frame stays put on phone hubs

On an installed Studio (standalone), the layout frame SHALL stay aligned to the visible viewport without drifting or rubber-banding the hub tab chrome while the photographer browses Clients, Website, Settings, or Gallery. Horizontal tab strips on phone SHALL NOT drag the shell; strips that cannot fit one line may wrap or scroll inside the strip only.

#### Scenario: Clients hub tabs stay put

- **WHEN** the photographer opens Clients on an installed iPhone and switches among Deliveries, Feedback, People, and Inbox
- **THEN** the hub tab chrome does not drift or rubber-band with the shell

#### Scenario: Website and Settings hub tabs stay put

- **WHEN** the photographer opens Website or Settings on an installed iPhone and switches sections
- **THEN** the hub tab chrome does not drift or rubber-band with the shell

#### Scenario: Keyboard overlay does not leave a shifted shell

- **WHEN** the photographer focuses a field on Settings or Clients and then dismisses the keyboard
- **THEN** the shell and tab chrome return to the idle pin without a lasting offset
