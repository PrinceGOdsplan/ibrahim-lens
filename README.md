# Ibrahim Lens

Public website and private Studio for a single photographer. The live site is for booking and viewing work. Studio is where the photographer edits the site, library, clients, and deliveries.

**Live site:** [ibrahimlens.com.ng](https://ibrahimlens.com.ng)

## What you can see

- **Public site** — Home, About, Portfolio, Work, Contact, plus Privacy and Terms
- **Studio** — Dashboard, Library, Website, Clients, and Settings at `/studio`
- **Client deliveries** — private gallery links the photographer sends after a session

## Stack

React, Vite, TypeScript, and Tailwind CSS on the front. PocketBase for auth, data, and files. Docker Compose to run PocketBase locally.

## Run locally

You need Node.js and Docker.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run seed
npm run dev
```

On Windows PowerShell, copy the env file with `Copy-Item .env.example .env`.

Set `SEED_EMAIL` / `SEED_PASSWORD` and `PB_ADMIN_EMAIL` / `PB_ADMIN_PASSWORD` in `.env` before seeding. The example file uses placeholders only — do not commit a real `.env`.

- Public site: http://127.0.0.1:5173/
- Studio: http://127.0.0.1:5173/studio/login

Sign into Studio with the seed email and password you set.
