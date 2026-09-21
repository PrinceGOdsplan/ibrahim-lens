# Ibrahim Lens

Public website and private Studio for a single photographer. The live site is for booking and viewing work. Studio is where the photographer runs the desk — library, website copy, clients, deliveries, and settings.

**Live site:** [ibrahimlens.com.ng](https://ibrahimlens.com.ng)

## What it is

- **Public site** — Soft night Home, About, Portfolio, Work, and Contact (Write then Book), plus Privacy and Terms
- **Studio** — Dashboard, Library, Website, Clients, and Settings at `/studio`
- **Client deliveries** — private gallery links after a session: view, download originals, feedback, countdown to expiry
- **Studio Assistant** — signed-in chat on every Studio hub that can look up and act on desk work through authenticated tools

## Product shape

Studio hubs stay short: one work surface, shared photo picker, phone-friendly chrome, and optional home-screen install with notices. The public site stays photo-first and bookable; Delivery galleries share the same Soft night language without watermarks on originals.

Outbound mail (bookings, Write messages, feedback, gallery-ready, expiry reminders) is optional. Inbound `hello@ibrahimlens.com.ng` is for people, not the app.

## Stack

React, Vite, TypeScript, and Tailwind CSS on the front. PocketBase for auth, data, and files. Docker Compose for the production-shaped deploy (web + PocketBase; Caddy for HTTPS on the VPS).
