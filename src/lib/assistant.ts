import { pb } from '@/lib/pocketbase'
import { pbErrorMessage } from '@/lib/pb-error'

export type AssistantRoute = { pathname: string; search: string }

export type AssistantMediaPreview = {
  id: string
  label?: string
  thumb: string
  href: string
}

export type AssistantConfirmJob = { action: string; payload: Record<string, unknown> }

export type AssistantUiMessage = {
  role: 'user' | 'assistant'
  text: string
  kind?: string
  day?: string
  creditLow?: boolean
  confirm?: AssistantConfirmJob | null
  confirmQueue?: AssistantConfirmJob[] | null
  pick?: AssistantPick | null
  media?: AssistantMediaPreview | null
}

export type AssistantPick = {
  token: string
  action: string
  selectedIds: string[]
  day?: string
  title?: string
  payload: Record<string, unknown>
}

export type AssistantReadTool = {
  id: string
  name: string
  args: Record<string, unknown>
}

export type AssistantTurn = {
  ok: boolean
  text?: string
  messages?: AssistantUiMessage[]
  readTools?: AssistantReadTool[]
  ui?: {
    navigate?: string
    appearance?: 'night' | 'light'
    shell?: { sidebar?: 'collapse' | 'expand' | 'toggle' }
    autoWrite?: AssistantConfirmJob | null
    autoWrites?: AssistantConfirmJob[] | null
    pick?: AssistantPick | null
    confirm?: AssistantConfirmJob | null
    confirmQueue?: AssistantConfirmJob[] | null
    creditLow?: boolean
  }
  creditLow?: boolean
  creditEmpty?: boolean
  inFlight?: boolean
  stale?: boolean
  cancelled?: boolean
  error?: string
  opened?: boolean
}

export type AssistantWriteResult = {
  ok: boolean
  collection?: string
  id?: string
  deleted?: boolean
  delegate?: string
  summary?: string
  messages?: AssistantUiMessage[]
  nextConfirm?: AssistantConfirmJob
  confirmRemaining?: number
  confirmQueue?: AssistantConfirmJob[]
  continueAgenda?: boolean
  agenda?: string
  batch?: AssistantConfirmJob[]
}

export async function getAssistantStatus() {
  return await pb.send<{ configured: boolean; creditEmpty: boolean }>('/api/ibrahim/assistant-status', {
    method: 'POST',
    body: {},
  })
}

export async function postAssistant(body: {
  text?: string
  open?: boolean
  cancel?: boolean
  route: AssistantRoute
  toolResults?: { id: string; name: string; result: unknown }[]
}): Promise<AssistantTurn> {
  try {
    return await pb.send<AssistantTurn>('/api/ibrahim/assistant', {
      method: 'POST',
      body,
    })
  } catch (error) {
    const err = error as { status?: number; response?: AssistantTurn }
    if (err.status === 409 || err.response?.inFlight) {
      return { ok: false, inFlight: true, error: 'working' }
    }
    throw new Error(pbErrorMessage(error, 'Assistant could not reply.'))
  }
}

export async function cancelAssistantTurn(route: AssistantRoute) {
  try {
    await postAssistant({ cancel: true, route })
  } catch {
    /* best effort */
  }
}

export async function postAssistantWrite(body: {
  action: string
  payload: Record<string, unknown>
  confirm?: boolean
  pickerToken?: string
}) {
  try {
    return await pb.send<AssistantWriteResult>('/api/ibrahim/assistant-write', {
      method: 'POST',
      body,
    })
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not save that change.'))
  }
}

export async function loadAssistantThread() {
  const list = await pb.collection('assistant_thread').getList(1, 1, { filter: 'key="studio"' })
  const row = list.items[0] as AssistantThreadRecord | undefined
  return row ?? null
}

export type AssistantThreadRecord = {
  id: string
  messages?: AssistantUiMessage[] | string
  credit_empty?: boolean
  in_flight?: boolean
  assistant_name?: string
  assistant_avatar?: string
}

export function assistantDisplayName(row: AssistantThreadRecord | null | undefined) {
  const name = typeof row?.assistant_name === 'string' ? row.assistant_name.trim() : ''
  return name || 'Assistant'
}

export function assistantAvatarUrl(row: AssistantThreadRecord | null | undefined, thumb = '200x200') {
  if (!row?.id || typeof row.assistant_avatar !== 'string' || !row.assistant_avatar) return null
  try {
    return pb.files.getURL(row as never, row.assistant_avatar, { thumb })
  } catch {
    return null
  }
}

export async function saveAssistantIdentity(data: { name?: string; avatar?: File | null; clearAvatar?: boolean }) {
  const row = await loadAssistantThread()
  if (!row) throw new Error('Assistant is not set up.')
  if (data.avatar || data.clearAvatar) {
    const form = new FormData()
    if (data.name != null) form.append('assistant_name', data.name.trim().slice(0, 64))
    if (data.avatar) form.append('assistant_avatar', data.avatar)
    if (data.clearAvatar) form.append('assistant_avatar', '')
    return pb.collection('assistant_thread').update<AssistantThreadRecord>(row.id, form)
  }
  return pb.collection('assistant_thread').update<AssistantThreadRecord>(row.id, {
    assistant_name: data.name != null ? data.name.trim().slice(0, 64) : undefined,
  })
}

export async function persistAssistantMessages(messages: AssistantUiMessage[]) {
  const row = await loadAssistantThread()
  if (!row) return
  await pb.collection('assistant_thread').update(row.id, { messages })
}

export function studioLookPath(path: string) {
  return path.startsWith('/studio') ? path : null
}

export function lastPendingConfirm(messages: AssistantUiMessage[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role === 'user') return null
    if (m.kind === 'confirm' && m.confirm?.action) return m.confirm
    if (m.kind === 'reply' || m.kind === 'brief' || m.kind === 'pick' || m.kind === 'error') return null
  }
  return null
}

export function lastPendingPick(messages: AssistantUiMessage[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role === 'user') return null
    if (m.kind === 'pick' && m.pick?.token) return m.pick
    if (m.kind === 'reply' || m.kind === 'brief' || m.kind === 'confirm' || m.kind === 'error') return null
  }
  return null
}

export function confirmPreview(action: string, payload: Record<string, unknown>) {
  if (action === 'update_booking') {
    const bits = []
    if (payload.client_name) bits.push(`rename client to ${payload.client_name}`)
    if (payload.person) bits.push('reassign client')
    if (payload.status) bits.push(`status ${payload.status}`)
    if (payload.fee_ngn != null) bits.push(`fee ₦${payload.fee_ngn}`)
    if (payload.amount_paid_ngn != null) bits.push(`paid ₦${payload.amount_paid_ngn}`)
    if (payload.studio_notes != null) bits.push('update notes')
    if (payload.preferred_at != null) bits.push('update schedule')
    return { title: 'Change this booking?', body: bits.join(' · ') || 'Update booking fields.' }
  }
  if (action === 'people_write') {
    const kind = String(payload.kind || '')
    if (kind === 'create') {
      const link = payload.bookingId ? ' and link to booking' : ''
      return {
        title: 'Create this person?',
        body: `${String(payload.name || 'Person')}${payload.phone ? ` · ${payload.phone}` : ''}${link}`,
      }
    }
    return { title: 'Update this person?', body: String(payload.name || payload.id || 'Person') }
  }
  if (action === 'create_booking') {
    const bits = [
      String(payload.name || payload.personId || 'Client'),
      String(payload.status || 'pending'),
    ]
    if (payload.phone) bits.push(String(payload.phone))
    if (payload.fee_ngn != null) bits.push(`fee ₦${payload.fee_ngn}`)
    if (payload.amount_paid_ngn != null) bits.push(`paid ₦${payload.amount_paid_ngn}`)
    if (payload.preferred_at) bits.push(String(payload.preferred_at))
    return { title: 'Create this booking?', body: bits.join(' · ') }
  }
  if (action === 'delete_record') {
    const col = String(payload.collection || 'record').replace(/_/g, ' ')
    return { title: `Delete this ${col}?`, body: String(payload.id || '') }
  }
  if (action === 'website_write') {
    const kind = String(payload.kind || 'Website write')
    if (kind === 'update_globals') {
      const patch = (payload.patch || {}) as Record<string, unknown>
      const keys = Object.keys(patch)
      return { title: 'Change the website?', body: keys.length ? keys.join(', ') : 'Website globals' }
    }
    if (kind === 'upsert_seo') {
      return {
        title: 'Update SEO?',
        body: `${String(payload.page_key || 'page')}: ${String(payload.title || '').slice(0, 60)}`,
      }
    }
    if (kind === 'update_testimonial') {
      return { title: 'Update this testimonial?', body: String(payload.author || payload.id || 'Testimonial') }
    }
    return { title: 'Change the website?', body: kind }
  }
  if (action === 'settings_write') {
    const kind = String(payload.kind || '')
    if (kind === 'create_tag') return { title: 'Add this portfolio tag?', body: String(payload.name || '') }
    if (kind === 'rename_tag') return { title: 'Rename this tag?', body: String(payload.name || payload.id || '') }
    if (kind === 'delete_tag') return { title: 'Delete this tag?', body: String(payload.name || payload.id || '') }
    if (kind === 'update_notices') return { title: 'Update notification settings?', body: 'Notice matrix / notify email' }
    if (kind === 'update_profile_name') {
      return { title: 'Change your display name?', body: String(payload.name || '') }
    }
    if (kind === 'change_password') return { title: 'Change Studio login password?', body: 'Requires your current password' }
    if (kind === 'update_login_email') {
      return { title: 'Change login email?', body: String(payload.email || '') }
    }
    if (kind === 'update_assistant_name') {
      return { title: 'Rename Assistant?', body: String(payload.name || 'Assistant') }
    }
    return { title: 'Change Settings?', body: kind }
  }
  if (action === 'library_write') {
    const kind = String(payload.kind || '')
    if (kind === 'create_album') return { title: 'Create this album?', body: String(payload.title || 'Album') }
    if (kind === 'rename_album') return { title: 'Rename this album?', body: String(payload.title || '') }
    if (kind === 'delete_album') return { title: 'Delete this album?', body: String(payload.title || payload.id || 'Album') }
    if (kind === 'create_work') return { title: 'Create this Work?', body: String(payload.title || 'Work') }
    if (kind === 'update_work') return { title: 'Update this Work?', body: String(payload.title || payload.id || 'Work') }
    if (kind === 'bulk_delete_media' || kind === 'delete_media') {
      const n = Array.isArray(payload.ids) ? payload.ids.length : Array.isArray(payload.items) ? payload.items.length : 1
      return { title: `Delete ${n} photo(s)?`, body: 'Removed from Gallery/Portfolio' }
    }
    if (kind === 'bulk_media_captions') {
      const n = Array.isArray(payload.items) ? payload.items.length : 0
      return { title: `Rename ${n || 'these'} photos?`, body: 'Apply all new names' }
    }
    if (kind === 'update_media_caption' || kind === 'rename_media') {
      return { title: 'Rename this photo?', body: String(payload.caption || payload.name || '').slice(0, 80) || 'Clear name' }
    }
    if (kind === 'set_media_tags') return { title: 'Update photo tags?', body: 'Tags on this photograph' }
    return { title: 'Change Library?', body: kind }
  }
  if (action === 'delivery_write') {
    const kind = String(payload.kind || '')
    if (kind === 'revoke') return { title: 'Revoke this Delivery link?', body: String(payload.id || '') }
    if (kind === 'restore') return { title: 'Restore this Delivery for 7 more days?', body: String(payload.id || '') }
    return { title: 'Change Delivery?', body: kind }
  }
  if (action === 'feedback_write') {
    return { title: 'Promote feedback to a testimonial?', body: String(payload.author || payload.quote || '').slice(0, 80) }
  }
  if (action === 'send_mail') {
    const kind = String(payload.kind || '')
    if (kind === 'resend_gallery') {
      const name = String(payload.clientName || payload.name || '').trim()
      return {
        title: 'Send gallery mail?',
        body: name ? `Resend Delivery link to ${name}` : 'Resend delivery link',
      }
    }
    if (kind === 'test_mail') return { title: 'Send test notice mail?', body: 'Notification test to your notify address' }
    return { title: 'Send mail?', body: kind }
  }
  return { title: 'Confirm this change?', body: action }
}
