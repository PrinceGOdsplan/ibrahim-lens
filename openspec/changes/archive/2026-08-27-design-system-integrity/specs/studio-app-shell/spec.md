## ADDED Requirements

### Requirement: One tab idiom across Studio hubs

Tab navigation SHALL use a single visual idiom across every Studio hub. A photographer moving between Clients, Gallery, and Website SHALL see the same treatment for the same kind of control, so tabs are recognisable as tabs rather than appearing to be a different mechanism per hub.

Where a hub separates primary tabs from secondary ones, that separation SHALL be legible — a visible grouping, a gap, or a label — rather than a divider glyph whose contrast against the surface leaves it invisible.

#### Scenario: Moving between hubs

- **WHEN** the photographer moves from Clients to Gallery to Website
- **THEN** the tab strips use one consistent treatment for selected and unselected tabs

#### Scenario: Primary and secondary tab groups

- **WHEN** a hub separates primary from secondary tabs
- **THEN** the separation is perceivable rather than carried by a glyph that blends into the background

### Requirement: Numeric presentation in Studio

Numbers that a photographer reads as quantities or money — counts, totals, amounts paid, amounts outstanding — SHALL be set in figures of uniform height that align in columns. Figures with varying heights and descenders SHALL NOT be used for these values, because they are harder to compare and to scan down a column.

Quantities of the same kind SHALL use one typeface throughout Studio, so counts on one screen are not set differently from counts on another. Currency SHALL be formatted once, consistently, wherever it appears.

#### Scenario: Money on the Dashboard

- **WHEN** the photographer views amounts paid and outstanding
- **THEN** the figures are of uniform height and the two amounts align for comparison

#### Scenario: Counts across screens

- **WHEN** the photographer compares counts on the Dashboard with counts elsewhere in Studio
- **THEN** both are set in the same typeface and numeric style

#### Scenario: Amounts in a list

- **WHEN** several rows each show an amount
- **THEN** the amounts align vertically rather than shifting with each digit

### Requirement: One date and time format in Studio

A given date or time SHALL be presented in one format everywhere in Studio. The same booking's preferred date SHALL NOT appear as a machine timestamp on one screen and a locale-formatted string on another.

Dates and times SHALL be rendered for a reader rather than emitted raw: a stored timestamp SHALL NOT be shown in its transport form. Precision SHALL suit the meaning — a booking time does not need seconds. Day and month order SHALL be unambiguous to the photographer's audience rather than dependent on the browser's default locale.

#### Scenario: Same booking on two screens

- **WHEN** the photographer views a booking's preferred date on the Dashboard and again in Clients
- **THEN** both show the same value in the same format

#### Scenario: Raw timestamp never shown

- **WHEN** any Studio surface presents a stored date or time
- **THEN** it is formatted for reading rather than shown in its stored transport form

#### Scenario: Booking time precision

- **WHEN** a booking's preferred time is displayed
- **THEN** it shows the time to the minute without seconds

### Requirement: Studio has its own accent

Studio SHALL define its own accent colour within its light token set for the cases that need emphasis beyond the foreground, muted, border, and danger roles it already has. Studio surfaces SHALL NOT borrow the public brass accent: that colour is chosen to sit on the public warm-dark ground and does not carry sufficient contrast on the Studio light surface.

Any accent Studio uses SHALL meet the text contrast requirement against the Studio surface it sits on.

#### Scenario: Emphasis on a Studio surface

- **WHEN** a Studio control needs emphasis beyond the muted and foreground roles
- **THEN** it uses the Studio accent token rather than the public accent

#### Scenario: Accent contrast on the Studio ground

- **WHEN** the Studio accent is used for text
- **THEN** it meets the contrast requirement against the Studio surface behind it
