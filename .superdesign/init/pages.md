# Page dependency trees

## /studio (Dashboard)
Entry: src/pages/studio/DashboardPage.tsx
Dependencies:
- src/components/studio/StudioHubHeader.tsx
- src/components/studio/StudioHubShell.tsx
- src/components/ui/alert.tsx
- src/components/ui/skeleton.tsx
- src/lib/dashboard.ts (data only — strip for visual)
- src/lib/format.ts
- src/lib/utils.ts (cn)
- src/lib/pb-error.ts
- src/lib/studio-record-sync.ts
Shell (parent layout, not imported by page):
- src/components/studio/StudioLayout.tsx
  - src/components/ui/surface.tsx
  - src/components/studio/AssistantDrawer.tsx
  - src/components/studio/StudioIconButton.tsx
  - src/lib/studio-brand.ts
  - src/lib/studio-appearance.ts
  - src/index.css (tokens)

## /studio/bookings
Entry: src/pages/studio/BookingsPage.tsx
- StudioHubHeader, StudioHubShell, StudioWorkSurface, ui/*

## /studio/clients
Entry: src/pages/studio/ClientsPage.tsx

## /studio/gallery
Entry: src/pages/studio/LibraryPage.tsx

## /studio/settings
Entry: src/pages/studio/SettingsPage.tsx

## /studio/website
Entry: src/pages/studio/WebsitePage.tsx
