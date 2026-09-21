## Why

The photographer already runs the whole desk from Studio, but every verb is a hub tap. A signed-in Assistant that can brief Needs-you, plan in one thread, and act through the same operations as the buttons would cut that hunting — without a new backend, a GPU, or a public chatbot.

## What Changes

- Add a bottom-corner chat labelled **Assistant** on every signed-in Studio hub (Resend-style launcher). It opens a phone-friendly panel over the current hub — not a new nav hub, not a header icon, not a badge, not voice input.
- One PocketBase-backed thread (phone and laptop share it). Opens with a welcome that asks for instructions, then waits. History folds for the model; raw turns are kept.
- Chat, plan, and act across Dashboard, Gallery, Website, Clients/Bookings, and Settings. Hidden OpenRouter router picks a cheap vs mid model; the photographer never sees a model name or a token meter.
- Reads use existing Studio lib functions. **Every write** goes through an authenticated PocketBase hook. Money, deletes, Website/public, and outbound mail wait on Confirm. Photo sets use the shared **Pick photos** modal (pre-filtered / pre-ticked); the model never receives image bytes.
- Navigate Studio by URL when the point is to look at a hub; do not use the Gallery page as a picker.
- Warn when OpenRouter credit is low (Send still works). Empty credit fails with a plain line. No daily turn cap, no hard stop from us.
- Privacy default copy mentions that Studio Assistant may send a name, last-four phone digits, and booking or message text to the reply service. Digests use name + last four digits unless a write needs the full phone.

## Capabilities

### New Capabilities

- `studio-assistant`: Signed-in Studio Assistant — thread, tools, hidden model routing, hook writes, photo picker confirm, credit warn, untrusted-content rules.

### Modified Capabilities

- `studio-app-shell`: Bottom-corner Assistant chat on every Studio hub; no Assistant badge; night/light and 44px targets.
- `admin-settings`: No Assistant block in Settings.
- `public-legal`: Privacy default includes a short Studio Assistant sentence about data sent for replies.

## Impact

- `src/components/studio/StudioLayout.tsx` — bottom-corner chat on every hub.
- New Studio UI for the thread, Confirm cards, working/offline/timeout copy.
- `src/lib/*` — read tools wrap existing functions; navigation helper; picker open with proposed ids.
- `deploy/pb_hooks/` — `POST /api/ibrahim/assistant` (chat turn) and authenticated write actions; OpenRouter `$http.send`; in-flight lock; credit check; long timeout on this route.
- PocketBase schema: `assistant_thread` (and light usage/warn fields as needed). Backup `pb_data` before `ensure-schema`.
- Env on PocketBase: `OPENROUTER_API_KEY`, cheap/mid model ids, credit-warn floor. Never `VITE_*`.
- Caddy: longer timeout for `/api/ibrahim/assistant` only. CSP `connect-src` stays same-origin.
- `deploy/.env.example`, README, Privacy default body, seed/schema scripts.
- Optional SaaS is OpenRouter only (same class as Resend). Stack stays PocketBase + Compose.

## Non-goals

- Voice input, vision / image bytes to the model, Think harder, model picker, header badges, numeric turn meter, daily hard cap.
- Public-site chatbot, unauthenticated access, GPU / Ollama on the VPS, extra Compose services.
- Multi-thread sidebar, second Studio login’s own thread, assistant-specific audit table (writes look like the login, same as a button).
- Auto-curating Featured or “best frames”; using the Gallery hub as the photo picker.
- Streaming tokens, prompt-body logs, Undo for Website/Library deletes.
