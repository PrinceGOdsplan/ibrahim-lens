import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useConfirm } from '@/components/ui/confirm'
import { Bell, Bot, Image, Tag, User, UserCircle } from 'lucide-react'
import { StudioTabs } from '@/components/studio/StudioTabs'
import { StudioHubHeader } from '@/components/studio/StudioHubHeader'
import { StudioHubShell, StudioScrollPane, StudioWorkSurface } from '@/components/studio/StudioHubShell'
import { useAuth } from '@/lib/auth'
import { profilePhotoUrl } from '@/lib/studio-identity'
import { useUrlTab } from '@/lib/useUrlTab'
import { getMaxUploadMb } from '@/lib/config'
import { pb } from '@/lib/pocketbase'
import { pbErrorMessage } from '@/lib/pb-error'
import {
  type BrandRecord,
  type TagRecord,
  brandFaviconUrl,
  brandLogoUrl,
  createTag,
  deleteTag,
  getBrandSettings,
  listTags,
  renameTag,
  upsertBrandFavicon,
  upsertBrandLogo,
} from '@/lib/library'
import {
  type NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  sendTestNotice,
} from '@/lib/notifications'
import {
  PHOTOGRAPHER_NOTICE_EVENTS,
  defaultNoticeChannels,
  isStudioStandalone,
  type NoticeChannels,
} from '@/lib/notice-channels'
import { useFadeNotice } from '@/lib/useFadeNotice'
import { subscribeStudioPush, loadStudioVapidPublicKey } from '@/lib/studio-pwa'
import {
  assistantAvatarUrl,
  assistantDisplayName,
  loadAssistantThread,
  saveAssistantIdentity,
  type AssistantThreadRecord,
} from '@/lib/assistant'
import { ProfilePhotoField } from '@/components/studio/ProfilePhotoField'
import { formatDateTime } from '@/lib/format'

type SettingsTab = 'profile' | 'account' | 'tags' | 'brand' | 'notifications' | 'assistant'

const SETTINGS_TABS: readonly SettingsTab[] = [
  'profile',
  'account',
  'tags',
  'brand',
  'notifications',
  'assistant',
]

export function StudioSettingsPage() {
  const { user, refresh } = useAuth()
  const [tab, setTab] = useUrlTab<SettingsTab>('tab', SETTINGS_TABS, 'profile')
  const [tags, setTags] = useState<TagRecord[]>([])
  const [brand, setBrand] = useState<BrandRecord | null>(null)
  const [notices, setNotices] = useState<NotificationSettings | null>(null)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [channels, setChannels] = useState<NoticeChannels>(() => defaultNoticeChannels())
  const [galleryOn, setGalleryOn] = useState(true)
  const [expiringOn, setExpiringOn] = useState(true)
  const [mobileEnabled, setMobileEnabled] = useState(false)
  const [vapidReady, setVapidReady] = useState<boolean | null>(null)
  const [smtpReady, setSmtpReady] = useState<boolean | null>(null)
  const [newTag, setNewTag] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [assistantRow, setAssistantRow] = useState<AssistantThreadRecord | null>(null)
  const [assistantName, setAssistantName] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const { message, setMessage, error, setError } = useFadeNotice()
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const { confirm, dialog: confirmDialog } = useConfirm()

  async function refreshSettings() {
    const [t, b, n, a] = await Promise.all([
      listTags(),
      getBrandSettings(),
      getNotificationSettings(),
      loadAssistantThread().catch(() => null),
    ])
    setTags(t)
    setBrand(b)
    setNotices(n)
    setNotifyEmail(n.notify_email ?? '')
    setChannels(n.channels ?? defaultNoticeChannels())
    setGalleryOn(n.client_gallery !== false)
    setExpiringOn(n.client_expiring !== false)
    setMobileEnabled(isStudioStandalone())
    setAssistantRow(a)
    setAssistantName(a?.assistant_name?.trim() || '')
    setLoaded(true)
    try {
      const key = await loadStudioVapidPublicKey()
      setVapidReady(Boolean(key))
    } catch {
      setVapidReady(false)
    }
    try {
      const health = await pb.send<{ smtp?: boolean }>('/api/ibrahim/mail-health', { method: 'GET' })
      setSmtpReady(Boolean(health?.smtp))
    } catch {
      setSmtpReady(null)
    }
  }

  useEffect(() => {
    refreshSettings().catch((e) => setError(pbErrorMessage(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setError stable
  }, [])

  useEffect(() => {
    const name = typeof user?.name === 'string' ? user.name : ''
    setDisplayName(name)
    setLoginEmail(typeof user?.email === 'string' ? user.email : '')
  }, [user])

  async function onCreateTag(event: FormEvent) {
    event.preventDefault()
    if (!newTag.trim()) return
    setError(null)
    try {
      await createTag(newTag)
      setNewTag('')
      await refreshSettings()
      setMessage('Tag added.')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await pb.collection('users').update(user.id, { name: displayName.trim() })
      await refresh()
      setMessage('Profile saved.')
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not save profile.'))
    } finally {
      setBusy(false)
    }
  }

  async function onSaveAvatar(file: File) {
    if (!user) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const form = new FormData()
      form.append('avatar', file)
      await pb.collection('users').update(user.id, form)
      await refresh()
      setMessage('Photo updated.')
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not update photo.'))
      throw e
    } finally {
      setBusy(false)
    }
  }

  async function onRemoveAvatar() {
    if (!user) return
    const ok = await confirm({
      title: 'Remove profile photo?',
      body: 'The header will show your initials until you add a photo again.',
      confirmLabel: 'Remove',
      destructive: true,
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await pb.collection('users').update(user.id, { avatar: null })
      await refresh()
      setMessage('Photo removed.')
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not remove photo.'))
    } finally {
      setBusy(false)
    }
  }

  async function onSaveLoginEmail(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    const next = loginEmail.trim()
    if (!next) {
      setError('Login email is required.')
      return
    }
    if (!emailPassword) {
      setError('Enter your current password to change login email.')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await pb.collection('users').update(user.id, {
        email: next,
        oldPassword: emailPassword,
      })
      setEmailPassword('')
      await refresh()
      setMessage('Login email updated. Use it next time you sign in.')
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not change login email.'))
    } finally {
      setBusy(false)
    }
  }

  async function onSaveAssistantName(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await saveAssistantIdentity({ name: assistantName })
      setAssistantRow(updated)
      setAssistantName(updated.assistant_name?.trim() || '')
      setMessage('Assistant name saved.')
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not save Assistant name.'))
    } finally {
      setBusy(false)
    }
  }

  async function onSaveAssistantAvatar(file: File) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await saveAssistantIdentity({ avatar: file })
      setAssistantRow(updated)
      setMessage('Assistant picture updated.')
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not update Assistant picture.'))
      throw e
    } finally {
      setBusy(false)
    }
  }

  async function onRemoveAssistantAvatar() {
    const ok = await confirm({
      title: 'Remove Assistant picture?',
      body: 'Chat will use a quiet fallback until you add a picture again.',
      confirmLabel: 'Remove',
      destructive: true,
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await saveAssistantIdentity({ clearAvatar: true })
      setAssistantRow(updated)
      setMessage('Assistant picture removed.')
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not remove Assistant picture.'))
    } finally {
      setBusy(false)
    }
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    if (password.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (password !== passwordConfirm) {
      setError('New password and confirmation do not match.')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await pb.collection('users').update(user.id, {
        oldPassword,
        password,
        passwordConfirm,
      })
      setOldPassword('')
      setPassword('')
      setPasswordConfirm('')
      setMessage('Password updated. Use it next time you log in.')
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not change password.'))
    } finally {
      setBusy(false)
    }
  }

  async function onLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    setMessage(null)
    try {
      const updated = await upsertBrandLogo(file)
      setBrand(updated)
      setMessage('Logo updated. Public chrome can use this asset.')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function onFavicon(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    setMessage(null)
    try {
      const updated = await upsertBrandFavicon(file)
      setBrand(updated)
      setMessage('Favicon updated. Public pages will use it.')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const logo = brandLogoUrl(brand)
  const favicon = brandFaviconUrl(brand)
  const photo = profilePhotoUrl(user, '200x200')
  const assistantPhoto = assistantAvatarUrl(assistantRow)

  return (
    <StudioHubShell>
      <StudioHubHeader title="Settings">
        <div className="mt-3">
          <StudioTabs
            value={tab}
            onChange={setTab}
            aria-label="Settings sections"
            primary={[
              { id: 'profile', label: 'Profile', icon: UserCircle },
              { id: 'account', label: 'Account', icon: User },
              { id: 'assistant', label: 'Assistant', icon: Bot },
              { id: 'tags', label: 'Portfolio tags', icon: Tag },
              { id: 'brand', label: 'Brand', icon: Image },
              { id: 'notifications', label: 'Notifications', icon: Bell },
            ]}
          />
        </div>
      </StudioHubHeader>
      <StudioScrollPane innerClassName="mx-auto max-w-2xl space-y-6">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {message ? <Alert variant="success">{message}</Alert> : null}

        <StudioWorkSurface>
        {tab === 'profile' ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl">Profile</h2>
              </div>
              <ProfilePhotoField
                photoUrl={photo}
                busy={busy}
                onSave={onSaveAvatar}
                onRemove={photo ? onRemoveAvatar : undefined}
              />
            </div>
            <form onSubmit={onSaveProfile} className="space-y-4 border-t border-studio-border pt-8">
              <div className="space-y-2">
                <Label htmlFor="display-name">Your name in Studio</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ibrahim"
                />
              </div>
              <Button type="submit" disabled={busy}>
                Save name
              </Button>
            </form>
          </div>
        ) : null}

        {tab === 'account' ? (
          <div className="space-y-8">
            <form onSubmit={onSaveLoginEmail} className="space-y-4">
              <h2 className="font-display text-xl">Login email</h2>
              <div className="space-y-2">
                <Label htmlFor="settings-account-email">Email</Label>
                <Input
                  id="settings-account-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-password">Current password</Label>
                <Input
                  id="email-password"
                  type="password"
                  autoComplete="current-password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={busy}>
                Save login email
              </Button>
            </form>

            <form onSubmit={onChangePassword} className="space-y-4 border-t border-studio-border pt-8">
              <h2 className="font-display text-xl">Password</h2>
              <div className="space-y-2">
                <Label htmlFor="old-password">Current password</Label>
                <Input
                  id="old-password"
                  type="password"
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={busy}>
                Update password
              </Button>
            </form>
          </div>
        ) : null}

        {tab === 'assistant' ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl">Assistant</h2>
                <p className="mt-1 text-sm text-studio-muted">
                  Name and picture shown in the Studio chat. Separate from your profile photo.
                </p>
              </div>
              <ProfilePhotoField
                photoUrl={assistantPhoto}
                busy={busy}
                onSave={onSaveAssistantAvatar}
                onRemove={assistantPhoto ? onRemoveAssistantAvatar : undefined}
              />
            </div>
            <form onSubmit={onSaveAssistantName} className="space-y-4 border-t border-studio-border pt-8">
              <div className="space-y-2">
                <Label htmlFor="assistant-display-name">Display name</Label>
                <Input
                  id="assistant-display-name"
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  placeholder="Assistant"
                  maxLength={64}
                />
                <p className="text-xs text-studio-muted">
                  Leave blank to show “{assistantDisplayName(null)}”.
                </p>
              </div>
              <Button type="submit" disabled={busy}>
                Save name
              </Button>
            </form>
          </div>
        ) : null}

        {tab === 'tags' ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl">Portfolio tags</h2>
            </div>
            <form onSubmit={onCreateTag} className="space-y-1.5">
              <Label htmlFor="new-tag">Tag name</Label>
              <div className="flex gap-2">
                <Input
                  id="new-tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. Wedding"
                />
                <Button type="submit">Add tag</Button>
              </div>
            </form>
            {tags.length ? (
              <ul className="space-y-2">
                {tags.map((tag) => (
                  <li key={tag.id} className="flex items-center gap-2">
                    <Input
                      key={`${tag.id}-${tag.name}`}
                      defaultValue={tag.name}
                      onBlur={async (e) => {
                        if (e.target.value.trim() && e.target.value !== tag.name) {
                          try {
                            await renameTag(tag.id, e.target.value)
                            await refreshSettings()
                          } catch (err) {
                            setError(err instanceof Error ? err.message : String(err))
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-studio-danger"
                      aria-label={`Delete tag ${tag.name}`}
                      onClick={async () => {
                        const ok = await confirm({
                          title: `Delete tag "${tag.name}"?`,
                          body: 'The tag comes off every photo using it, and off the Portfolio filters. Photos are not deleted.',
                          confirmLabel: 'Delete tag',
                          destructive: true,
                        })
                        if (!ok) return
                        try {
                          await deleteTag(tag.id)
                          await refreshSettings()
                          setMessage(`Tag "${tag.name}" deleted.`)
                        } catch (err) {
                          setError(pbErrorMessage(err))
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            ) : loaded ? (
              <p className="rounded-md border border-dashed border-studio-border px-3 py-4 text-sm text-studio-muted">
                No tags yet.
              </p>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {tab === 'brand' ? (
          <section className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl">Brand logo</h2>
                <p className="mt-1 text-sm text-studio-muted">
                  JPEG, PNG, or WebP, max {getMaxUploadMb()}MB.
                </p>
              </div>
              {logo ? <img src={logo} alt="Site logo" className="h-16 w-auto object-contain" /> : null}
              <div>
                <Label htmlFor="logo-upload">Logo file</Label>
                <Input id="logo-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={onLogo} />
              </div>
            </div>
            <div className="space-y-4 border-t border-studio-border pt-8">
              <div>
                <h2 className="font-display text-xl">Favicon</h2>
                <p className="mt-1 text-sm text-studio-muted">
                  Browser tab icon. ICO, PNG, JPEG, WebP, or SVG, max {getMaxUploadMb()}MB.
                </p>
              </div>
              {favicon ? (
                <img src={favicon} alt="Site favicon" className="h-10 w-10 object-contain" />
              ) : (
                <p className="text-sm text-studio-muted">Using the default /favicon.svg until you upload one.</p>
              )}
              <div>
                <Label htmlFor="favicon-upload">Favicon file</Label>
                <Input
                  id="favicon-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/x-icon,.ico"
                  onChange={onFavicon}
                />
              </div>
            </div>
          </section>
        ) : null}

        {tab === 'notifications' ? (
          <section className="space-y-5 rounded-lg border border-studio-border p-5">
            <div>
              <h2 className="font-display text-xl">Notifications</h2>
              <p className="mt-2 text-sm text-studio-muted">
                {smtpReady === true
                  ? 'Email notices are on.'
                  : smtpReady === false
                    ? 'Email notices are off.'
                    : 'Could not check email notices.'}
                {notices?.last_sent_at ? ` Last sent ${formatDateTime(notices.last_sent_at)}.` : ''}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notify-email">Email for notices</Label>
              <Input
                id="notify-email"
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="Login email"
              />
            </div>
            {vapidReady === false ? (
              <Alert variant="error">Phone notices are unavailable.</Alert>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[20rem] text-left text-sm">
                <thead>
                  <tr className="text-studio-muted">
                    <th className="py-2 pr-2 font-medium">Your notices</th>
                    <th className="py-2 px-2 font-medium">Email</th>
                    <th className="py-2 px-2 font-medium">In-app</th>
                    <th className="py-2 px-2 font-medium">Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {PHOTOGRAPHER_NOTICE_EVENTS.map((row) => (
                    <tr key={row.id} className="border-t border-studio-border">
                      <td className="py-2 pr-2">
                        <span className="font-medium">{row.label}</span>
                        <span className="mt-0.5 block text-studio-muted">{row.hint}</span>
                      </td>
                      {(['email', 'inApp', 'mobile'] as const).map((key) => (
                        <td key={key} className="py-2 px-2">
                          <label className="inline-flex h-11 w-11 items-center justify-center">
                            <input
                              type="checkbox"
                              aria-label={`${row.label} ${key}`}
                              disabled={key === 'mobile' && !mobileEnabled}
                              checked={channels[row.id][key]}
                              onChange={(e) =>
                                setChannels((prev) => ({
                                  ...prev,
                                  [row.id]: { ...prev[row.id], [key]: e.target.checked },
                                }))
                              }
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mobileEnabled ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  subscribeStudioPush()
                    .then(() => setMessage('Phone notices allowed on this device.'))
                    .catch((e) => setError(e instanceof Error ? e.message : String(e)))
                }
              >
                Allow phone notices
              </Button>
            ) : null}
            {Object.values(channels).some((row) => row.mobile) && !mobileEnabled ? (
              <Alert variant="error">
                Mobile is checked, but this browser is not the installed Studio app. Add to Home Screen,
                open that icon, then tap Allow phone notices — the badge alone is not a tray notification.
              </Alert>
            ) : null}
            <div className="space-y-3 border-t border-studio-border pt-4">
              <p className="font-medium">Client mail</p>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0"
                  checked={galleryOn}
                  onChange={(e) => setGalleryOn(e.target.checked)}
                />
                <span>Gallery is ready</span>
              </label>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0"
                  checked={expiringOn}
                  onChange={(e) => setExpiringOn(e.target.checked)}
                />
                <span>Gallery expiring</span>
              </label>
            </div>
            {notices?.last_send_error ? (
              <Alert variant="error">Last send failed: {notices.last_send_error}</Alert>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={busy || !notices}
                onClick={async () => {
                  if (!notices) return
                  setBusy(true)
                  setError(null)
                  setMessage(null)
                  try {
                    const saved = await saveNotificationSettings(notices.id, {
                      notify_email: notifyEmail.trim(),
                      client_gallery: galleryOn,
                      client_downloaded: false,
                      client_expiring: expiringOn,
                      channels,
                    })
                    setNotices(saved)
                    const wantsMobile = PHOTOGRAPHER_NOTICE_EVENTS.some((row) => channels[row.id].mobile)
                    if (wantsMobile) await subscribeStudioPush()
                    setMessage(
                      wantsMobile
                        ? 'Notification settings saved. Phone notices allowed on this device.'
                        : 'Notification settings saved.',
                    )
                  } catch (e) {
                    setError(e instanceof Error ? e.message : String(e))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {busy ? 'Saving…' : 'Save notices'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  setError(null)
                  setMessage(null)
                  try {
                    if (notices) {
                      await saveNotificationSettings(notices.id, {
                        notify_email: notifyEmail.trim(),
                        client_gallery: galleryOn,
                        client_downloaded: false,
                        client_expiring: expiringOn,
                        channels,
                      })
                    }
                    if (PHOTOGRAPHER_NOTICE_EVENTS.some((row) => channels[row.id].mobile)) {
                      await subscribeStudioPush()
                    }
                    const result = await sendTestNotice()
                    await refreshSettings()
                    setMessage(
                      result?.push
                        ? 'Test sent to your phone.'
                        : result?.mail
                          ? 'Test email sent.'
                          : 'Test notice sent. Nothing in Bookings or Deliveries changed.',
                    )
                  } catch (e) {
                    setError(e instanceof Error ? e.message : String(e))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Send test
              </Button>
            </div>
          </section>
        ) : null}

        {confirmDialog}
        </StudioWorkSurface>
      </StudioScrollPane>
    </StudioHubShell>
  )
}
