## Context

See proposal.md for motivation. The Assistant already runs through `deploy/pb_hooks/02_assistant.pb.js` with OpenRouter tools, Confirm cards, Pick photos, navigate, appearance, money reads, and a thin `website_write` surface. Studio hubs already own the real mutators for Website and Settings; this change grows the Assistant tool contract to call the same PocketBase collections and open the same sheets the hubs use.

## Goals / Non-Goals

**Goals:**
- One capability map: every photographer verb → read | auto | Confirm | pick | upload/sheet handoff.
- Expand server tools + Confirm kinds for Website allowlist and Settings allowlist.
- Upload handoff via Gallery/Settings sheet open, not file-picker automation.
- Keep docs (Capability-Contract, Production prompt, runtime digest) aligned with live tools.
- Preserve no-vision, no-DOM-puppetry, truthful Done.

**Non-Goals:**
- Playwright / click chrome; vision bytes to the model; public chatbot; multi-thread UI; new LLM vendor.

## Decisions

### 1. Grow PocketBase Assistant tools, not a second write API
**Choice:** Extend `02_assistant.pb.js` tool defs, classify, and Confirm executors to mutate the same collections Website/Settings already use (`site_globals`, FAQ, testimonials, SEO, contact fields, tags, notice matrix, profile display).  
**Why:** Auth, audit identity, and Confirm already live on that path; duplicating mutators in the Vite app would bypass Confirm.  
**Alternatives:** Client-only writes after model suggestion — rejected (browser could skip Confirm). DOM automation — rejected (fragile, out of scope).

### 2. Handoff kinds for files and complex sheets
**Choice:** Add navigate/handoff actions such as `open_upload`, `open_settings_tab`, `open_website_tab` that the drawer turns into route + sheet state. Uploads and profile/brand file picks never go through the model.  
**Why:** Browser file inputs cannot be filled by the Assistant; the existing upload UX is the product.  
**Alternatives:** Base64 attach in chat — rejected (vision + size). Pretend upload Done after navigate — rejected (false Done).

### 3. Website write kinds expand under Confirm
**Choice:** Broaden `website_write` (or sibling tools) kinds to cover FAQ CRUD, testimonials, SEO, contact/booking copy, services text, and globals fields the hub edits — all Confirm. Featured/media attach stays `pick_photos_then_write`.  
**Why:** Matches “same authority as the operator” without inventing a second content model.  
**Alternatives:** Free-form JSON patch of entire globals — rejected (too easy to wipe fields).

### 4. Settings: Confirm for matrix/tags/profile text; password Confirm; files handoff
**Choice:** New read (`get_settings_digest` or similar) + Confirm writes for tags and notice matrix and non-secret profile fields; password only via Confirm with current-password rules the Settings page already enforces; photo/brand → handoff.  
**Why:** Password and files are high-risk; tags/matrix are consequential enough for Confirm.  
**Alternatives:** Auto-write tags — possible later; start Confirm for consistency with public-facing tag effects.

### 5. Capability surface is the contract
**Choice:** Single source: tool registry in the hook drives Capability-Contract text, production system prompt hard rules, and the short-circuit “what can you do” answer. Sync docs on every tool add.  
**Why:** Prior bugs came from prompt promising more than tools could do.  
**Alternatives:** Free-form prompt only — rejected.

### 6. In-chat media preview stays client-side
**Choice:** Keep thumb/preview URLs in the drawer; model only sees ids/captions/dates from `search_media`. Lightbox only on explicit navigate or Open in Gallery.  
**Why:** Already decided with the photographer; avoids false “opened Gallery” claims.

### 7. Assistant identity stored on the server
**Choice:** Persist `assistant_name` (text) and an Assistant avatar file on the Studio operator prefs / settings record the session already loads — distinct fields from the photographer’s account profile photo. Settings is the editor; the Assistant drawer only displays. Default display name is “Assistant”; empty avatar uses a quiet fallback. Avatar bytes never go to the LLM; the display name MAY appear in UI and optionally in the system greeting.  
**Why:** Phone and laptop must share the same persona; localStorage alone would drift.  
**Alternatives:** Reuse photographer avatar for Assistant — rejected (user wants a separate Assistant face). Client-only prefs — rejected (multi-device).

## Risks / Trade-offs

- **[Risk] Tool sprawl / model calls wrong kind** → Mitigation: tight enums, classify table, capability short-circuit, prompt forbids naming tools.  
- **[Risk] Partial Website update overwrites sibling fields** → Mitigation: patch only named fields; re-read before Confirm apply.  
- **[Risk] Handoff claimed as Done** → Mitigation: handoff actions return `handoff` not `written`; strip Done language in summaries.  
- **[Risk] Concurrent studio-assistant change overlap** → Mitigation: implement atop current hook; archive order merges `studio-assistant` baseline then this delta, or fold baseline into main specs first.  
- **[Risk] Password Confirm phishing-style copy** → Mitigation: Confirm card shows only “change password” intent, never echoes new password in thread logs beyond the Confirm payload lifetime.  
- **[Risk] Confusing Assistant avatar with photographer profile** → Mitigation: separate Settings fields and labels (“Assistant name / picture”).

## Migration Plan

1. Ensure schema fields for Assistant name + avatar; ship hook + frontend handoff URL/sheet hooks behind the existing Assistant feature (no flag required if already gated by OpenRouter key).  
2. Deploy `pb_hooks` with Compose restart; reuse existing collections where possible.  
3. Update Capability-Contract + prompts in the same deploy.  
4. Rollback: revert hook + drawer handoff + identity UI; hubs remain authoritative.

## Open Questions

_(none — allowlist field lists are taken from current Website/Settings editors at implement time)_
