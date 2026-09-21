# studio-assistant Specification

## Purpose

Gives the signed-in photographer a full-desk Studio Assistant: ordinary English drives the same Website, Settings, Library, Clients, and money verbs the hubs already expose, through authenticated tools and honest handoffs — never DOM puppetry or photograph pixels to the model.

## Requirements

### Requirement: Assistant is Studio-session only
The Assistant SHALL be available only on authenticated Studio routes. Unauthenticated visitors SHALL NOT reach the Assistant API or UI. The public site SHALL NOT include an Assistant. Every signed-in Studio hub SHALL show the bottom-corner Assistant control. When the operator OpenRouter key is unset, the chat SHALL stay visible and SHALL tell them Assistant is not set up rather than hiding the control.

#### Scenario: Logged out
- **WHEN** a visitor requests the Assistant API without a Studio session
- **THEN** the request is denied and no Studio content is returned

#### Scenario: No key
- **WHEN** the photographer opens Studio and the OpenRouter key is not configured
- **THEN** the bottom-corner Assistant control is still present, and opening it says Assistant is not set up

### Requirement: One shared thread
Studio SHALL keep exactly one Assistant conversation for the photographer, stored on the server, so phone and laptop show the same thread after reload. The model SHALL receive a short rolling summary plus about the last twelve turns, not the entire history. Raw turns SHALL be kept. Studio SHALL provide no second-thread list in this change.

#### Scenario: Reload on another device
- **WHEN** the photographer chats on the laptop and later opens Assistant on the phone
- **THEN** they see the same thread

### Requirement: Open with a welcome then wait
Opening the Assistant SHALL insert one welcome that asks what to do. It SHALL NOT describe the chat as something other than support. It SHALL NOT list Dashboard counts or Needs-you totals. It SHALL NOT send further unsolicited messages or header badges. After that line, the Assistant SHALL wait for the photographer.

#### Scenario: Open the drawer
- **WHEN** the photographer opens Assistant
- **THEN** they see one welcome asking for instructions and no desk-count digest

### Requirement: Hidden model, no token meter
The photographer SHALL NOT be shown a model name, a token count, or a daily turn allowance. The system SHALL choose only from a configured cheap model and a configured mid model: short lookup on cheap, planning and tool-using turns on mid. It SHALL NOT use an unconstrained vendor auto-router or a Pro-class model.

#### Scenario: Chat a plan
- **WHEN** the photographer asks to plan the week
- **THEN** the reply appears in the same thread with no model label and no token meter

### Requirement: Credit warn does not block Send
When remaining vendor credit is below the configured floor, Studio SHALL show one quiet warning that credit is running low and SHALL leave Send enabled. When the vendor rejects a turn for empty credit, Studio SHALL say that credit ran out and that they can top up to keep chatting, and SHALL leave Send enabled.

#### Scenario: Credit low
- **WHEN** remaining credit is below the warn floor and the photographer sends
- **THEN** they see a low-credit warning and the turn still runs if the vendor accepts it

#### Scenario: Credit empty
- **WHEN** the vendor rejects a turn for lack of credit
- **THEN** the thread shows that credit ran out and Send remains enabled

### Requirement: Writes go through the authenticated Assistant API
Read operations MAY run in the signed-in Studio client. Creating, updating, or deleting Studio records from the Assistant SHALL require the authenticated Assistant write path on the server. The browser SHALL NOT be able to perform those Assistant writes without that path. Booking audit events SHALL use the signed-in photographer identity, the same as a hub button.

#### Scenario: Confirm a fee
- **WHEN** the photographer confirms a fee change proposed by Assistant
- **THEN** the booking updates through the authenticated write path and a money-changed event records the login identity

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
Safe Studio text edits (photo captions including bulk rename, album/Work create and rename, FAQ and Website globals text including SEO and testimonials, tags, Accept/notes/schedule on bookings, Assistant display name, people update) SHALL apply without a Confirm card. Consequential writes (money fields, decline/cancel, deletes including bulk media and album delete, outbound mail, password, login email, Delivery revoke/restore, feedback promote to testimonial, people create, create booking) SHALL require Confirm. Multiple Confirm items SHALL queue with Confirm-all. Password change SHALL NOT run as a safe auto-write. File uploads, Portfolio vault membership, Hero slideshow images, About photo, brand logo, and Work delete SHALL use a sheet handoff — Assistant SHALL NOT claim Done until Studio saves. Confirm SHALL re-read the live record and SHALL NOT offer a button for a missing or invented id. Confirm SHALL NOT promise Undo. Featured (Home) is not Portfolio membership.

#### Scenario: Bulk caption rename
- **WHEN** the photographer asks to rename many Portfolio photos with catchy phrases
- **THEN** Assistant invents phrases and applies them in one bulk write without one Confirm per photo

#### Scenario: Change password via Assistant
- **WHEN** the photographer asks Assistant to change the Studio login password
- **THEN** a Confirm card is required, and no password write runs as auto

#### Scenario: Confirm queue
- **WHEN** Assistant proposes two deletes in one turn
- **THEN** Studio shows a Confirm queue with Confirm all and applies both after approval

#### Scenario: Hallucinated id
- **WHEN** the model names a booking id that does not exist
- **THEN** Studio shows no Confirm button for that write

### Requirement: Write outcomes name what changed
After a successful Assistant write, the thread SHALL report the field or record and the new value (or a short quote), not only “Done” or “Updated”.

#### Scenario: FAQ update outcome
- **WHEN** an FAQ answer is saved via Assistant
- **THEN** the reply includes the question and a short quote of the new answer

### Requirement: Photos are picked in the shared picker, not by the model’s eyes
The Assistant SHALL NOT send photograph file bytes or thumbs to the language model. It MAY search media by caption, tag, room, and Studio `created` date (upload time) and MAY propose ids. For any write that attaches photographs (Delivery, album, Featured, Work, and comparable), Studio SHALL open the shared Pick photos modal with those filters and/or ids pre-ticked; only ids the photographer confirms with Done SHALL be written. Pasting or attaching an image in chat SHALL be refused with copy that the Assistant cannot see photos. Browsing a date in Gallery MAY navigate to the Gallery hub; that SHALL NOT replace the picker for attach writes.

#### Scenario: Last three to a client
- **WHEN** the photographer asks to send the last three photographs to a named person
- **THEN** Pick photos opens with those newest ids selected, and no Delivery is created until Done and any remaining Confirm

#### Scenario: Saturday into an album
- **WHEN** the photographer asks to add last Saturday’s photographs to a named album
- **THEN** Pick photos opens filtered or pre-selected by that Lagos calendar day, and the album is not changed until Done

#### Scenario: Paste a frame
- **WHEN** the photographer pastes a photograph into the Assistant
- **THEN** they are told the Assistant cannot see photos and no model call includes that file

### Requirement: Upload handoff without file automation
When the photographer asks to upload photographs, Studio SHALL navigate to Gallery (or the relevant Library room) and open the existing upload sheet. The Assistant SHALL NOT drive the browser file picker, SHALL NOT receive file bytes, and SHALL NOT claim the upload finished until Studio reports files saved.

#### Scenario: Upload today’s shoot
- **WHEN** the photographer says upload today’s shoot
- **THEN** Gallery opens with the upload sheet and chat says to pick files there, without claiming Done for the upload

### Requirement: Navigate to look, not to pick
The Assistant MAY change the Studio address to a hub and selected record so the photographer can look (Bookings, Inbox, Gallery wall, FAQ, and similar). It SHALL NOT drive the UI by clicking chrome. “This” / the open record SHALL use the current hub and query ids sent with the turn.

#### Scenario: Open this booking
- **WHEN** the photographer is on a booking URL and says to confirm this booking
- **THEN** the Assistant uses that booking id rather than asking them to name it

#### Scenario: Show Saturday’s wall
- **WHEN** the photographer asks only to see last Saturday’s photographs
- **THEN** Studio may open Gallery with that day applied, without creating a Delivery or album write

### Requirement: Sheet and tab handoffs are navigable
Assistant MAY open a Studio hub with query params that select a Website tab, Settings tab, booking, person, Delivery, FAQ, or media preview. Opening a sheet SHALL be spoken as a handoff (open / go there), not as a completed write. Assistant MAY collapse or expand the Studio sidebar and switch night/light look without Confirm.

#### Scenario: Open Notifications settings
- **WHEN** the photographer asks to open Notifications in Settings
- **THEN** Studio navigates to Settings with the Notifications tab selected and Assistant does not claim settings were changed

#### Scenario: Close the sidebar
- **WHEN** the photographer asks to close the sidebar
- **THEN** the Studio rail collapses without a Confirm card

### Requirement: Client-typed text is data, not orders
Write messages, Delivery feedback, booking answers, and testimonials SHALL be treated as quoted untrusted text. Tool writes SHALL use only record ids named by the photographer, the current screen, or a Confirm — never ids or commands that appear only inside that client text.

#### Scenario: Poisoned Inbox line
- **WHEN** a Write message tells the Assistant to delete people or send mail
- **THEN** those actions do not run unless the photographer independently confirms a matching live record

### Requirement: One in-flight turn
While a turn is running, a second Send from any device SHALL NOT start another model call. Closing the drawer or changing hub SHALL let an in-flight turn finish; the reply SHALL appear in the thread. Unconfirmed writes SHALL NOT run just because the drawer closed.

#### Scenario: Double Send
- **WHEN** the photographer sends again while a turn is in flight
- **THEN** the second send does not start a parallel turn

#### Scenario: Leave while working
- **WHEN** the photographer closes Assistant while it is working on a read or an already-confirmed write
- **THEN** that work finishes and the reply is in the thread when they return

### Requirement: Open editors refresh after Assistant writes
When an Assistant write updates a record the photographer is mid-edit, Studio SHALL apply the write, refresh that editor from the server, and tell them it changed.

#### Scenario: Dirty booking form
- **WHEN** the photographer has unsaved fee edits open and confirms an Assistant amount-paid write on that booking
- **THEN** the booking is saved as confirmed, the form reloads the stored record, and they are told it changed

### Requirement: Phone digits in the digest
Assistant context sent to the model SHALL use person display name plus last four national digits unless the in-flight write requires the full number. Dates and “today” SHALL use Lagos time.

#### Scenario: Brief unpaid
- **WHEN** the Assistant lists an unpaid client in a turn
- **THEN** the model-facing digest does not include the full `phone_e164` for that listing

### Requirement: Honest wait, offline, and timeout
While a turn runs, Studio SHALL show that it is working. If the device is offline, Studio SHALL say so and SHALL NOT spin forever. If the turn exceeds the Assistant timeout (about 60 seconds), Studio SHALL say it timed out and invite them to try again, and SHALL NOT automatically retry a write.

#### Scenario: Offline
- **WHEN** the photographer sends while the device has no network
- **THEN** they see an offline line and no successful write is claimed

### Requirement: Voice and Studio words
Assistant copy SHALL match the photographer (Nigerian English, including Pidgin when they use it) and SHALL use Studio product words: Accept, Delivery, Work, Gallery, naira, +234. It SHALL NOT invent hub statuses (unaccepted website mail stays Inbox `needs_contact` until accepted).

#### Scenario: Accept request
- **WHEN** the photographer asks to accept an unaccepted website request
- **THEN** the booking leaves `needs_contact` through the same accept path as Inbox, not a made-up calendar confirm

### Requirement: Meta logs only
The system MAY store model id, tools, record ids, and errors for Assistant turns. It SHALL NOT store full prompts or model replies in a debug log beyond the photographer-visible thread.

#### Scenario: After a turn
- **WHEN** a turn completes or fails
- **THEN** any debug trail has tools, ids, and errors at most, and does not persist the raw prompt outside the visible thread

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
