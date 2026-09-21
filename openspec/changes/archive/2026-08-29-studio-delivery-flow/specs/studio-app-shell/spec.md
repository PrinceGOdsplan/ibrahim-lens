## ADDED Requirements

### Requirement: Studio content icons share one treatment
Lucide marks inside Studio hub **content** (lists, create panels, inbox folders, row actions) SHALL use the same icon treatment as Gallery content: one stroke, one size family, wrapped so raw Lucide defaults are not mixed in. Content section switches (Inbox folders, Delivery source Photos / Albums / Work) SHALL use the shared underline tab idiom rather than filled Button pills. Boolean settings (Published, On the website, notice checkboxes) MAY keep a native checkbox.

#### Scenario: Inbox folders match hub tabs
- **WHEN** the photographer is on Clients → Inbox
- **THEN** Messages / Activity / Everything use the same underline tab treatment as other Studio tabs, not a filled pill row

#### Scenario: Delivery source matches hub tabs
- **WHEN** the photographer is choosing what to put in a Delivery
- **THEN** Photos / Albums / Work use the shared tab idiom with the same icon treatment as Gallery rooms

#### Scenario: Content action icons match Gallery
- **WHEN** the photographer uses Copy link, Revoke, or Add on Deliveries
- **THEN** those actions use the same line-icon treatment as Gallery Add / Arrange, not a different stroke or a third button language
