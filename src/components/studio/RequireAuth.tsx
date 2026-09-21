import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { readStudioAppearance } from '@/lib/studio-appearance'
import { STUDIO_PRODUCT_NAME } from '@/lib/studio-brand'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const appearance = readStudioAppearance()

  if (isLoading) {
    return (
      <div
        className="studio-shell flex min-h-screen items-center justify-center bg-studio-bg text-studio-muted"
        data-studio-appearance={appearance}
      >
        Loading {STUDIO_PRODUCT_NAME}…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/studio/login" replace state={{ from: location.pathname }} />
  }

  return children
}
