## Why

The Assistant already sits in every Studio hub, but large parts of the photographer’s real desk are still out of reach: full Website editing, Settings, uploads, richer money and website reads, and several Clients/Library verbs. The photographer wants an assistant that lives on the site — same authority as the signed-in operator, via stable tools, not fragile UI clicking — so ordinary English can drive the whole desk.

## What Changes

- Expand the Assistant capability contract so every meaningful photographer verb is either executable (read / auto-write / Confirm write / pick-handoff) or an honest handoff to the right Studio sheet.
- Grow read tools over Website (globals, SEO, testimonials, contact/booking fields, lanes) and Settings (profile, tags, notice matrix, brand) plus richer money and delivery digests.
- Grow write tools (Confirm) for full Website content the Studio already edits, Settings-safe fields, tags, deliveries metadata, albums/Work text fields, and Accept/decline flows already implied by bookings.
- Add an **upload handoff** (navigate + open upload sheet) rather than browser file-picker automation; keep Pick photos for curated sets.
- Keep authority model: safe auto, consequential Confirm, never claim Done unless the write ran; no DOM puppetry.
- Sync `docs/Capability-Contract.txt`, Production system prompt, and runtime digest so the model and the app agree.
- Chat UI already shows media previews; photo “see” stays in-chat unless the photographer asks to open Gallery.
- **Assistant identity:** photographer can set Assistant display name and profile picture in Settings; the chat shows that name and avatar (default name “Assistant”; quiet avatar fallback). Still no model name, token meter, or credit line in Settings.

## Capabilities

### New Capabilities

- `studio-assistant`: Signed-in Studio Assistant as full-desk operator — every photographer verb as read / auto-write / Confirm write / pick or upload handoff; truthful Done; ordinary English; no DOM puppetry; configurable name and avatar in chat.

### Modified Capabilities

- `studio-app-shell`: Assistant may open Studio sheets/modals via handoff paths (upload, Settings tab, Website tab) without becoming a new hub; overlay chrome shows configured Assistant name and avatar.
- `website-content`: Assistant Confirm writes for allowlisted Website hub fields (globals, FAQ, testimonials, SEO, contact/booking copy).
- `admin-settings`: Assistant Confirm/auto for allowlisted Settings (profile display, tags, notice matrix, brand metadata) — password only with Confirm; Settings edits Assistant identity (name + picture) without status/model/credit chrome.

## Impact

- `deploy/pb_hooks/02_assistant.pb.js` — tool defs, classify, writes, digest, prompt hard rules, capability answer.
- `deploy/pb_hooks/assistant-system-prompt.txt` + `docs/Capability-Contract.txt` / Production prompt / Runtime digest.
- Schema / prefs for `assistant_name` + Assistant avatar file (distinct from photographer account photo).
- `src/lib/assistant-tools.ts`, `src/lib/assistant.ts`, Website/Settings/Library/Clients libs as needed.
- `src/components/studio/AssistantDrawer.tsx` — handoff UI hooks (upload sheet, deep links); name + avatar in chat chrome.
- Settings page — Assistant identity editor.
- Studio pages that accept URL handoffs (Gallery upload, Website tab, Settings tab).
- No new Compose services; no vision/image bytes to the model; OpenRouter stays the only LLM path.

## Non-goals

- DOM automation / Playwright / click-the-Studio-UI.
- Sending photograph pixels to the model (vision).
- Silent password changes, silent deletes without Confirm, or public-site chatbot.
- Auto-curating “best” Featured frames by visual judgment.
- Multi-thread sidebar or per-device threads.
- GPU / local LLM / streaming token UI.
