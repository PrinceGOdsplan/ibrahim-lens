## 1. Shared identity

- [x] 1.1 Add `src/lib/studio-identity.ts` with `profileLabel`, `initials`, and `profilePhotoUrl(user, thumb)` matching today’s header/Settings rules (name → email → `Studio`; no empty `src`)
- [x] 1.2 Switch `StudioLayout` and Settings Profile to those helpers; header avatar still uses a small thumb
- [x] 1.3 Confirm no PocketBase schema, seed, or `pb_data` backup change is required

## 2. Dashboard greeting

- [x] 2.1 On Dashboard, above the earnings plane, render a link to `/studio/settings?tab=profile`: photo at 200×200 when set, otherwise initials, plus `profileLabel`
- [x] 2.2 Keep hub title “Dashboard” and the period control in the header; truncate a long email on a 390-wide viewport
- [x] 2.3 Leave Coming up, Pulse, and count stacks unchanged

## 3. Verify

- [x] 3.1 `npx tsc --noEmit -p tsconfig.app.json`
- [x] 3.2 In the browser: name+photo; name only (initials); no name (email); tap greeting lands on Settings → Profile
