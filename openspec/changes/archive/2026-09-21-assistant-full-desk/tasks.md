## 1. Capability inventory

- [x] 1.1 Inventory Website and Settings hub mutators vs current Assistant tools; list allowlisted fields for reads/writes/handoffs
- [x] 1.2 Draft updated Capability-Contract sections for Website, Settings, upload handoff, money/Delivery digests, and Assistant identity

## 2. Server tools and Confirm

- [x] 2.1 Add Website read tools (SEO, testimonials, contact/booking copy, lanes metadata) beside existing globals/FAQ
- [x] 2.2 Expand `website_write` Confirm kinds for allowlisted Website fields; patch-only updates; re-read before apply
- [x] 2.3 Add Settings digest read (profile display, tags, notice matrix, brand metadata, Assistant identity)
- [x] 2.4 Add Settings Confirm writes for tags, notice matrix, non-secret profile fields; password Confirm; never auto password
- [x] 2.5 Add handoff tool results (`open_upload`, `open_settings_tab`, `open_website_tab`) that do not mark Done as written
- [x] 2.6 Wire classify, confirm restore, false-Done guards, and capability short-circuit for new tools/kinds
- [x] 2.7 Sync production system prompt hard rules and tool-name strip list with the new registry
- [x] 2.8 Add schema fields for Assistant display name and avatar (distinct from photographer profile photo)

## 3. Frontend handoffs, identity, and types

- [x] 3.1 Extend `assistant-tools.ts` / `assistant.ts` types for new reads, Confirm kinds, handoff payloads, and identity
- [x] 3.2 Teach `AssistantDrawer` to apply upload/Settings/Website tab handoffs without claiming write Done
- [x] 3.3 Accept Gallery `upload` (or equivalent) and Settings/Website tab query params on the target pages
- [x] 3.4 Keep in-chat media preview; open Gallery lightbox only on explicit navigate or Open in Gallery
- [x] 3.5 Settings UI to edit Assistant name and profile picture
- [x] 3.6 Assistant drawer header and bubbles show configured name and avatar (defaults when unset)

## 4. Docs and verify

- [x] 4.1 Update `docs/Capability-Contract.txt`, Production system prompt, and Runtime digest to match live tools
- [x] 4.2 Smoke: Website FAQ/globals Confirm, Settings tag/matrix Confirm, upload handoff, capability “what can you do,” in-chat last photo, rename + avatar in chat
- [x] 4.3 Restart PocketBase with updated hooks and confirm no false Done on handoff-only turns
