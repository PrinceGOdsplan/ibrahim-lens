import { StudioHubHeader } from '@/components/studio/StudioHubHeader'
import { StudioHubShell, StudioScrollPane } from '@/components/studio/StudioHubShell'

export { StudioDashboardPage } from '@/pages/studio/DashboardPage'
export { StudioLibraryPage } from '@/pages/studio/LibraryPage'
export { StudioSettingsPage } from '@/pages/studio/SettingsPage'
export { StudioWebsitePage } from '@/pages/studio/WebsitePage'
export { StudioBookingsPage } from '@/pages/studio/BookingsPage'
export { StudioClientsPage } from '@/pages/studio/ClientsPage'

export function StudioNotFoundPage() {
  return (
    <StudioHubShell>
      <StudioHubHeader title="Not found" />
      <StudioScrollPane>
        <p className="text-sm text-studio-muted">That path does not exist. Use the menu to open a hub.</p>
      </StudioScrollPane>
    </StudioHubShell>
  )
}
