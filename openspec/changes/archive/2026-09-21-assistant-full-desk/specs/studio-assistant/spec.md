## Purpose

Gives the signed-in photographer a full-desk Studio Assistant: ordinary English drives the same Website, Settings, Library, Clients, and money verbs the hubs already expose, through authenticated tools and honest handoffs — never DOM puppetry or photograph pixels to the model.

## ADDED Requirements

### Requirement: Full-desk verb coverage
Every meaningful photographer verb available in Studio hubs SHALL map to exactly one of: a read tool, a safe auto-write, a Confirm write, a Pick-photos handoff, or an upload / sheet handoff. The Assistant SHALL NOT invent a verb that has no path, and SHALL NOT claim Done for a path that only opened a sheet.

#### Scenario: Fix FAQ from chat
- **WHEN** the photographer asks to change a live FAQ answer
- **THEN** Assistant applies the FAQ write (safe text auto-write) and reports the new question/answer in the thread

#### Scenario: Unknown desk verb
- **WHEN** the photographer asks for something Studio cannot do (for example visual auto-curation of Featured)
- **THEN** Assistant says it cannot and offers the nearest honest hub or handoff

### Requirement: Website and Settings reads match the hubs
Assistant read tools SHALL cover Website globals, SEO, FAQ, testimonials, contact and booking copy, Home lanes metadata, Settings profile display fields, portfolio tags, notice matrix, and brand metadata at the same fidelity the hubs load for editing. Money and Delivery digests SHALL include earned, unpaid, and period summaries the Dashboard Study surface already uses.

#### Scenario: Ask what the Contact Write blurb says
- **WHEN** the photographer asks what the Write message blurb currently says
- **THEN** Assistant answers from a Website read tool, not from memory alone

#### Scenario: Ask notice matrix
- **WHEN** the photographer asks which booking notices are on
- **THEN** Assistant answers from a Settings read that includes the notice matrix rows

### Requirement: Safe text writes may auto-apply; consequential writes Confirm
Safe Studio text edits (photo captions including bulk rename, album/Work create and rename, FAQ and Website globals text, tags, Accept/notes/schedule on bookings, Assistant display name) SHALL apply without a Confirm card. Consequential writes (money fields, decline/cancel, deletes, outbound mail, password, login email, Delivery revoke/restore, people create) SHALL require Confirm. Multiple Confirm items SHALL queue with Confirm-all. Password change SHALL NOT run as a safe auto-write. File uploads SHALL use a sheet handoff.

#### Scenario: Bulk caption rename
- **WHEN** the photographer asks to rename many Portfolio photos with catchy phrases
- **THEN** Assistant invents phrases and applies them in one bulk write without one Confirm per photo

#### Scenario: Change password via Assistant
- **WHEN** the photographer asks Assistant to change the Studio login password
- **THEN** a Confirm card is required, and no password write runs as auto

#### Scenario: Confirm queue
- **WHEN** Assistant proposes two deletes in one turn
- **THEN** Studio shows a Confirm queue with Confirm all and applies both after approval

### Requirement: Write outcomes name what changed
After a successful Assistant write, the thread SHALL report the field or record and the new value (or a short quote), not only “Done” or “Updated”.

#### Scenario: FAQ update outcome
- **WHEN** an FAQ answer is saved via Assistant
- **THEN** the reply includes the question and a short quote of the new answer

### Requirement: Upload handoff without file automation
When the photographer asks to upload photographs, Studio SHALL navigate to Gallery (or the relevant Library room) and open the existing upload sheet. The Assistant SHALL NOT drive the browser file picker, SHALL NOT receive file bytes, and SHALL NOT claim the upload finished until Studio reports files saved.

#### Scenario: Upload today’s shoot
- **WHEN** the photographer says upload today’s shoot
- **THEN** Gallery opens with the upload sheet and chat says to pick files there, without claiming Done for the upload

### Requirement: Sheet and tab handoffs are navigable
Assistant MAY open a Studio hub with query params that select a Website tab, Settings tab, booking, person, Delivery, FAQ, or media preview. Opening a sheet SHALL be spoken as a handoff (open / go there), not as a completed write. Assistant MAY collapse or expand the Studio sidebar and switch night/light look without Confirm.

#### Scenario: Open Notifications settings
- **WHEN** the photographer asks to open Notifications in Settings
- **THEN** Studio navigates to Settings with the Notifications tab selected and Assistant does not claim settings were changed

#### Scenario: Close the sidebar
- **WHEN** the photographer asks to close the sidebar
- **THEN** the Studio rail collapses without a Confirm card

### Requirement: Capability answers stay truthful
When asked what Assistant can do, the reply SHALL describe a Studio desk partner (look up, act, Confirm when consequential), not a brittle fixed menu of tools. It SHALL NOT list internal tool names, and SHALL NOT promise DOM clicking, vision over photographs, or silent deletes of protected records.

#### Scenario: What can you do
- **WHEN** the photographer asks what Assistant can do on the desk
- **THEN** the answer covers Website, Settings, money, Clients, and Library paths that exist, and names Confirm or handoff where required

### Requirement: In-chat media preview without forced Gallery modal
When the photographer asks to see a photograph and a media id is known, Studio MAY show that frame’s thumb or preview inside the Assistant thread. Studio SHALL NOT auto-open the Gallery lightbox unless the photographer asks to open Gallery or taps an Open in Gallery control.

#### Scenario: Show the last upload
- **WHEN** the photographer asks to see the last photograph uploaded
- **THEN** the thread shows an in-chat preview and Gallery lightbox stays closed

#### Scenario: Take me to it
- **WHEN** the photographer asks to open that photograph in Gallery
- **THEN** Studio navigates to Gallery with that media selected

### Requirement: Chat shows Assistant identity
The Assistant overlay SHALL show the configured Assistant display name and profile picture in the chat header and on assistant message chrome. When the name is unset, Studio SHALL use “Assistant”. When the picture is unset, Studio SHALL use a quiet fallback mark or initial — not the photographer’s Studio account profile photo unless that file was explicitly set as the Assistant picture. The Assistant avatar file SHALL NOT be sent to the language model.

#### Scenario: Custom name in chat
- **WHEN** the photographer has set Assistant name to “Lens” and opens the chat
- **THEN** the header and assistant bubbles show Lens

#### Scenario: Default name
- **WHEN** no Assistant name is stored
- **THEN** the chat shows Assistant
