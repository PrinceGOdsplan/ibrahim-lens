## MODIFIED Requirements

### Requirement: Nigeria phone input on booking form
The public booking phone field SHALL present a fixed **`+234` prefix** with an editable national number segment. If the user enters a leading `0` on that segment (immediately after the country code), the system SHALL strip that `0` before save/match.

The phone control SHALL carry the same visual treatment as the form's other fields. It SHALL NOT be the heaviest element in the form: the field with the most visual weight is read as the most important, and on a booking form that is the submit control, not the phone. The `+234` prefix SHALL be presented as a quiet part of the same field rather than as a separately bordered element.

#### Scenario: Strip trunk zero after +234
- **WHEN** a visitor enters national digits starting with `0` (e.g. `08031234567`) with prefix `+234`
- **THEN** the stored phone is normalized as `+2348031234567` (not `+2340803…`)

#### Scenario: Placeholder guides local digits
- **WHEN** the booking form phone control is shown
- **THEN** the prefix reads `+234` and the input placeholder indicates the remaining local digits

#### Scenario: Phone field matches its siblings

- **WHEN** a visitor views the booking form
- **THEN** the phone field shares the treatment used by the name, email, and location fields rather than presenting as a different kind of control

## ADDED Requirements

### Requirement: Booking field width suits its answer

Booking form fields SHALL be sized in proportion to the answer they expect rather than all spanning the full width of the form. Short answers — a count, a city, a date — SHALL NOT be given the same line length as free-text notes, since an input far wider than its content invites uncertainty about what is wanted.

On narrow viewports fields MAY all span the available width, because there is no room to do otherwise.

#### Scenario: Short answers on a wide form

- **WHEN** a visitor views the booking form on a desktop-width viewport
- **THEN** short-answer fields occupy less than the full form width, while free-text fields may span it

#### Scenario: Narrow viewport

- **WHEN** a visitor views the booking form on a phone
- **THEN** fields may each span the available width
