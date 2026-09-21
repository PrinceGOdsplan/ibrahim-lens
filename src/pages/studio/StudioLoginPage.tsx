import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { SurfaceProvider } from '@/components/ui/surface'
import { useAuth } from '@/lib/auth'
import { useStudioAppearance } from '@/lib/studio-appearance'
import { STUDIO_PRODUCT_NAME } from '@/lib/studio-brand'
import { pb } from '@/lib/pocketbase'
import { pbErrorMessage } from '@/lib/pb-error'
import { useStudioPwaSurface } from '@/lib/studio-pwa'

export function StudioLoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { appearance } = useStudioAppearance()
  useStudioPwaSurface(appearance)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  const from = (location.state as { from?: string } | null)?.from
  const target = from && from.startsWith('/studio') ? from : '/studio'

  if (user) {
    return <Navigate to={target} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      if (resetMode) {
        try {
          await pb.collection('users').requestPasswordReset(email.trim())
          setInfo('If that address has a Studio account, a reset link was sent.')
        } catch (e) {
          const msg = pbErrorMessage(e, 'Could not send a reset email.')
          if (/smtp|mail|not enabled|failed to send/i.test(msg)) {
            setError('Could not send a reset email. Sign in and change the password in Settings.')
          } else {
            setInfo('If that address has a Studio account, a reset link was sent.')
          }
        }
        return
      }
      await login(email, password)
      navigate(target, { replace: true })
    } catch (e) {
      const status = (e as { status?: number } | null)?.status
      setError(
        status === 400
          ? 'Invalid email or password.'
          : pbErrorMessage(e, 'Could not reach the studio. Check your connection and try again.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SurfaceProvider surface="studio">
      <div
        className="studio-shell flex min-h-screen items-center justify-center bg-studio-bg px-6 text-studio-fg"
        data-studio-appearance={appearance}
      >
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm space-y-5 rounded-lg border border-studio-border bg-studio-panel p-8 shadow-sm"
        >
          <div>
            <p className="font-display text-2xl leading-none tracking-tight text-studio-fg">{STUDIO_PRODUCT_NAME}</p>
            <h1 className="mt-3 text-sm font-medium text-studio-muted">{resetMode ? 'Reset password' : 'Sign in'}</h1>
            <p className="mt-2 text-sm text-studio-muted">
              {resetMode
                ? 'We email a reset link to your Studio login address.'
                : 'Photographer access only.'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studio-login-email">Email</Label>
            <Input
              id="studio-login-email"
              type="email"
              autoComplete="username"
              required
              aria-invalid={error ? true : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {!resetMode ? (
            <div className="space-y-2">
              <Label htmlFor="studio-login-password">Password</Label>
              <Input
                id="studio-login-password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={error ? true : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          ) : null}

          {error ? <Alert variant="error">{error}</Alert> : null}
          {info ? <Alert variant="success">{info}</Alert> : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Working…' : resetMode ? 'Send reset link' : 'Sign in'}
          </Button>

          <button
            type="button"
            className="w-full text-center text-sm text-studio-muted hover:text-studio-fg"
            onClick={() => {
              setResetMode((v) => !v)
              setError(null)
              setInfo(null)
            }}
          >
            {resetMode ? 'Back to sign in' : 'Forgot password?'}
          </button>

          {resetMode ? (
            <p className="text-center text-xs text-studio-muted">
              Or open <Link to="/studio/login" className="underline">sign in</Link> after you reset.
            </p>
          ) : null}
        </form>
      </div>
    </SurfaceProvider>
  )
}
