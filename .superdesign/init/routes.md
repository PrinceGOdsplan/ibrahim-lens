# Routes

Framework: React Router v7 (BrowserRouter in src/App.tsx). Vite SPA.

## Public (PublicLayout)
- / — HomePage
- /about, /portfolio, /work, /work/:slug, /contact
- /privacy, /terms

## Delivery
- /g/:token — DeliveryPage

## Studio (RequireAuth + StudioLayout)
- /studio/login — StudioLoginPage
- /studio — StudioDashboardPage (Dashboard) ← design target
- /studio/gallery — StudioLibraryPage
- /studio/website — StudioWebsitePage
- /studio/bookings — StudioBookingsPage
- /studio/clients — StudioClientsPage
- /studio/settings — StudioSettingsPage

Router source: src/App.tsx
