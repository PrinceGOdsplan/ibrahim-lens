import { pb } from '@/lib/pocketbase'

export type StudioIdentity = {
  id?: string
  name?: unknown
  email?: unknown
  avatar?: unknown
} | null | undefined

export function profileLabel(user: StudioIdentity) {
  const name = typeof user?.name === 'string' ? user.name.trim() : ''
  if (name) return name
  const email = typeof user?.email === 'string' ? user.email.trim() : ''
  return email || 'Studio'
}

export function initials(user: StudioIdentity) {
  const name = typeof user?.name === 'string' ? user.name.trim() : ''
  if (name) {
    const parts = name.split(/\s+/).slice(0, 2)
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'S'
  }
  const email = typeof user?.email === 'string' ? user.email : ''
  return email[0]?.toUpperCase() || 'S'
}

export function profilePhotoUrl(user: StudioIdentity, thumb = '200x200') {
  if (!user?.id || typeof user.avatar !== 'string' || !user.avatar) return null
  try {
    return pb.files.getURL(user as never, user.avatar, { thumb })
  } catch {
    return null
  }
}
