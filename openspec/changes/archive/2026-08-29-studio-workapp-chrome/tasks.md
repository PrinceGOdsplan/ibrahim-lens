## 1. App chrome

- [x] 1.1 Add `StudioHubHeader` (title, optional tabs slot, optional actions) matching Gallery toolbar spacing
- [x] 1.2 Rebuild `StudioLayout`: full-width header (Studio word, notices, profile menu), collapsible desktop sidebar, phone drawer from the same header
- [x] 1.3 Dock the notices list under the header bell; move install + Log out into the profile menu; persist `studio-nav-collapsed`

## 2. Hub toolbars

- [x] 2.1 Point Gallery toolbar at the shared header pattern (keep rooms / Arrange / Add)
- [x] 2.2 Pin Website, Clients, and Settings behind `StudioHubHeader` + `StudioHubShell`; drop explaining subtitles; add tab icons
- [x] 2.3 Pin Bookings behind `StudioHubHeader`; views as `StudioTabs` with counts; Add on the toolbar

## 3. Dashboard

- [x] 3.1 Replace Dashboard with Needs you wall plus optional Today line; remove CTA row, pipeline cards, Gallery pulse, and activity feed

## 4. Verify

- [x] 4.1 Typecheck and browse Studio: collapse sidebar, notices, profile, each hub toolbar, Dashboard empty and with items
