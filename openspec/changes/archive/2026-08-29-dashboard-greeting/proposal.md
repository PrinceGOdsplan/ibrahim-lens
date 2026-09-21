## Why

`admin-dashboard` already requires a photographer greeting (name and profile photo when set) as part of the pulse desk. Dashboard still opens as a generic “Dashboard” header over earnings — the signed-in name and avatar never appear on the pane, even after Settings → Profile is filled.

## What Changes

- Show the photographer’s Studio name on Dashboard, with the profile photo when one is set.
- If name is empty, fall back to the login email (same identity the header profile menu already uses). If there is no photo, show initials — do not leave a broken image.
- Greeting is a quiet identity line on the desk, not a second nav. Tapping it opens Settings → Profile so a missing name or photo is one click away.
- Period control, earnings, Coming up, Pulse, and count stacks stay as they are.

## Capabilities

### New Capabilities

### Modified Capabilities

- `admin-dashboard`: Dashboard greeting is visible and uses the signed-in profile; photo is optional.

## Impact

- `src/pages/studio/DashboardPage.tsx` — greeting row in the hub pane.
- Shared identity helpers already in `StudioLayout.tsx` / Settings (`name`, `avatar` URL) should be reused or extracted so header and desk stay consistent.
- No PocketBase schema, hooks, or seed change. No new notice events.

## Non-goals

- Time-of-day copy (“Good morning”).
- A Needs-you roster, client names, or diary on Dashboard.
- Changing Settings Profile save, crop, or account email.
- Generating missing PWA icons/splashes or other production ops from the launch checklist.
