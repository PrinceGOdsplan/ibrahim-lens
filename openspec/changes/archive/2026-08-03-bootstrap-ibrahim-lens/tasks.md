## 1. Scaffold

- [x] 1.1 Create Vite React TypeScript app with Tailwind and locked design tokens (public dark luxury / Studio light)
- [x] 1.2 Add shadcn/ui for Studio primitives
- [x] 1.3 Add env example for PocketBase URL, seed credentials, MAX_UPLOAD_MB (no secrets committed)

## 2. Local runtime (VPS-same core)

- [x] 2.1 Add Docker Compose with PocketBase service and persistent `pb_data` volume
- [x] 2.2 Document local run, Compose ports, and `pb_data` backup/restore in README
- [x] 2.3 Wire app to local PocketBase URL

## 3. Routing and layouts

- [x] 3.1 Public layout with Ibrahim Lens branding and nav (Home, About, Portfolio, Work, Contact)
- [x] 3.2 Placeholder public routes including `/work`, `/work/:slug`, `/g/:token` stub, Privacy, Terms, Not Found
- [x] 3.3 Studio layout at `/studio` with five-hub sidebar (light tool UI)
- [x] 3.4 Placeholder Studio hub routes

## 4. Auth

- [x] 4.1 Wire PocketBase email/password authentication
- [x] 4.2 Add seed script to create photographer account from env
- [x] 4.3 Protect `/studio/*`, login page, redirect to Dashboard, logout

## 5. Verify

- [x] 5.1 README documents stack, OpenSpec workflow, local vs VPS, backup
- [x] 5.2 Verify nav, legal links, Studio auth, seed login, tokens on public/Studio shells
