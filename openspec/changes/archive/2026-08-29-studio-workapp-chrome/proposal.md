## Why

Studio still feels like a light CMS website: desktop has no app header, notices and profile live in the sidebar footer, and every hub except Gallery titles itself inside a scrolling article. The photographer needs a work-app shell — header, collapsible nav, one title pattern — without adding chrome noise or copying the public Soft night site.

## What Changes

- Add a full-width Studio app header: notices (bell + drawer) and a profile control (display name or initials, Settings, Log out, install). Phone and desktop share this header.
- Make the hub sidebar collapsible on desktop (icon + word expanded, icons only collapsed; preference persisted). Phone keeps the drawer.
- One hub chrome pattern: pinned toolbar with the hub title (one H1), primary actions, and `StudioTabs` (icon + word). No explaining subtitle. The app header does not repeat the hub name.
- Apply that toolbar to Dashboard, Website, Bookings, Clients, and Settings. Gallery already matches; drop any duplicate title on the phone header.
- Redesign Dashboard as a work surface: Needs you is the wall; a single quiet Today line (next shoot / outstanding) may sit above it. Remove the always-on Upload / Create Delivery / Open Bookings row, Gallery pulse, pipeline card grid, and Inbox activity dump.
- Dock the notices list to the header bell. Do not overlay the whole hub pane.
- Sidebar is nav only (hubs + collapse). No email, bell, or Log out in the footer.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `studio-app-shell`: Full-width header, collapsible sidebar, shared hub toolbar (title + tabs + actions), phone/desktop one chrome language
- `admin-dashboard`: Dashboard is Needs you plus an optional Today line; not a restatement of other hubs
- `studio-notifications`: Notices open from the app-header bell into a header-docked drawer
- `booking-manager`: Booking views use the same tab chrome as other hubs (underline tabs with counts), not a third pill style

## Impact

- `StudioLayout.tsx` (header, sidebar, notices, profile)
- New small chrome pieces: hub toolbar wrapper, profile menu, collapse control
- Hub pages: `DashboardPage`, `WebsitePage`, `BookingsPage`, `ClientsPage`, `SettingsPage`; Gallery toolbar stays, phone title duplication removed
- `localStorage` for sidebar collapsed preference
- No PocketBase, public Soft night, or Gallery vault changes

## Non-goals

- Public site restyle, brass, or Syne in Studio
- Rewriting Website IA, Clients four-tab product split, or booking accept/finance logic
- A second icon pack, command palette, or multi-user profile
- Virtual lists, new notice types, or PWA install flow changes beyond moving the control into the profile menu
