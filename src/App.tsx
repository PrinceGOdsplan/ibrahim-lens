import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/public/PublicLayout'
import { ScrollReset } from '@/components/ScrollReset'
import { RequireAuth } from '@/components/studio/RequireAuth'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { AuthProvider } from '@/lib/auth'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { HomePage } from '@/pages/public/HomePage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { PortfolioPage } from '@/pages/public/PortfolioPage'
import { WorkDetailPage } from '@/pages/public/WorkDetailPage'
import { WorkPage } from '@/pages/public/WorkPage'

// Split by route group, not per page: a public visitor should never download
// the Studio, and cross-navigation within the public site stays instant.
const StudioLayout = lazy(() =>
  import('@/components/studio/StudioLayout').then((m) => ({ default: m.StudioLayout })),
)
const StudioLoginPage = lazy(() =>
  import('@/pages/studio/StudioLoginPage').then((m) => ({ default: m.StudioLoginPage })),
)
const StudioDashboardPage = lazy(() =>
  import('@/pages/studio/StudioHubPages').then((m) => ({ default: m.StudioDashboardPage })),
)
const StudioLibraryPage = lazy(() =>
  import('@/pages/studio/StudioHubPages').then((m) => ({ default: m.StudioLibraryPage })),
)
const StudioWebsitePage = lazy(() =>
  import('@/pages/studio/StudioHubPages').then((m) => ({ default: m.StudioWebsitePage })),
)
const StudioBookingsPage = lazy(() =>
  import('@/pages/studio/StudioHubPages').then((m) => ({ default: m.StudioBookingsPage })),
)
const StudioClientsPage = lazy(() =>
  import('@/pages/studio/StudioHubPages').then((m) => ({ default: m.StudioClientsPage })),
)
const StudioSettingsPage = lazy(() =>
  import('@/pages/studio/StudioHubPages').then((m) => ({ default: m.StudioSettingsPage })),
)
const StudioNotFoundPage = lazy(() =>
  import('@/pages/studio/StudioHubPages').then((m) => ({ default: m.StudioNotFoundPage })),
)
const DeliveryPage = lazy(() =>
  import('@/pages/public/DeliveryPage').then((m) => ({ default: m.DeliveryPage })),
)
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('@/pages/public/TermsPage').then((m) => ({ default: m.TermsPage })))

/** Same visual language as a data load, so waiting always looks the same. */
function RouteFallback() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Skeleton className="h-9 w-56" />
      <SkeletonText lines={3} className="mt-6 max-w-xl" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollReset />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="work" element={<WorkPage />} />
              <Route path="work/:slug" element={<WorkDetailPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="g/:token" element={<DeliveryPage />} />

            <Route path="studio/login" element={<StudioLoginPage />} />
            <Route
              path="studio"
              element={
                <RequireAuth>
                  <StudioLayout />
                </RequireAuth>
              }
            >
              <Route index element={<StudioDashboardPage />} />
              <Route path="gallery" element={<StudioLibraryPage />} />
              <Route path="library" element={<Navigate to="/studio/gallery" replace />} />
              <Route path="website" element={<StudioWebsitePage />} />
              <Route path="bookings" element={<StudioBookingsPage />} />
              <Route path="clients" element={<StudioClientsPage />} />
              <Route path="settings" element={<StudioSettingsPage />} />
              <Route path="*" element={<StudioNotFoundPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
