## Purpose

Gives developers a local-only way to fill PocketBase with enough photos and CMS/operator rows to walk Studio pagination, crowded forms, and long pickers — without changing the curated demo seed or touching a remote install.

## ADDED Requirements

### Requirement: Volume seed refuses non-local PocketBase
The volume seed and its teardown SHALL refuse to run when the configured PocketBase URL is not a local address (localhost, 127.0.0.1, or equivalent loopback). They MUST NOT create, update, or delete records on a remote or production host.

#### Scenario: Local PocketBase
- **WHEN** an operator runs the volume seed against a loopback PocketBase URL
- **THEN** the seed proceeds and inserts volume records

#### Scenario: Remote PocketBase
- **WHEN** an operator runs the volume seed or teardown against a non-loopback PocketBase URL
- **THEN** the command exits with a clear error and makes no API writes

### Requirement: Volume seed is separate from curated demo
The existing demo seed path (`npm run seed`, FORCE demo, Instagram seed-assets) SHALL keep its current behavior. Volume seed MUST be a separate optional command and MUST NOT replace or rewrite the curated identity/demo copy.

#### Scenario: Demo seed after volume
- **WHEN** an operator runs the curated demo seed after volume seed (without FORCE)
- **THEN** existing non-empty sections still skip as today; volume rows already present are not treated as a reason to skip creating curated demo if those sections were empty

#### Scenario: Distinct command
- **WHEN** an operator lists project seed scripts
- **THEN** volume seed is a distinct command from `seed` and `seed:ig`

### Requirement: Counts cross UI page and form thresholds
When volume seed completes successfully, the local install SHALL contain at least enough records to: page the Studio Library Gallery wall (more than one page of 48), page the Studio Library Portfolio wall, crowd album/Work collection lists, crowd people/bookings/inquiries lists, crowd Website testimonial and FAQ editors, wrap Settings tag chips, and fill booking questions up to the product maximum of 8.

#### Scenario: Gallery wall pages
- **WHEN** a photographer opens Studio Library Gallery after a successful volume seed
- **THEN** the wall has more than 48 Gallery photos so infinite scroll can load a further page

#### Scenario: Portfolio wall pages
- **WHEN** a photographer opens Studio Library Portfolio wall after a successful volume seed
- **THEN** the wall has more than 48 Portfolio photos so infinite scroll can load a further page

#### Scenario: Operator and Website lists
- **WHEN** a photographer opens Studio Clients, Bookings, Website Testimonials, Website FAQ, and Settings tags after a successful volume seed
- **THEN** each of those lists shows many more rows than the curated demo (tens of people, bookings, inquiries, testimonials, FAQ items, and more than three tags)

#### Scenario: Booking questions at cap
- **WHEN** a photographer opens Studio Website Contact booking questions after a successful volume seed
- **THEN** there are 8 extra questions (the product maximum) and Add is disabled; the public Book form shows those questions

### Requirement: Volume media uses local files only
Volume photo uploads SHALL reuse a small set of image files already on disk in the repo or seed-assets. The volume seed MUST NOT download images from the network (no Picsum, no Instagram, no other remote fetch).

#### Scenario: Offline-capable media
- **WHEN** volume seed runs with no outbound image-host access
- **THEN** it still creates the target number of media records from local files, or exits with an error that names the missing local file — it does not fetch placeholders

### Requirement: Volume rows are identifiable and removable
Volume-created records SHALL be marked or named so teardown can select them. Teardown SHALL delete volume media, Work, albums, people, bookings, inquiries, testimonials, FAQ items, and tags created by the volume seed, and SHALL restore booking questions if the seed overwrote them. Teardown MUST NOT delete the photographer account, website identity copy, SEO rows, or curated demo media/Work/testimonials that were not created by volume seed.

#### Scenario: Clear volume only
- **WHEN** an operator runs volume teardown on a local install that has both curated demo and volume rows
- **THEN** volume rows are gone and curated demo photos, Work, and testimonials remain

#### Scenario: Backup reminder
- **WHEN** an operator reads the documented volume-seed instructions
- **THEN** they are told to back up local `pb_data` before first run
