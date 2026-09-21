export type NoticeChannelFlags = {
  email: boolean
  inApp: boolean
  mobile: boolean
}

export type PhotographerNoticeEvent = 'booking' | 'message' | 'feedback'

export type NoticeChannels = Record<PhotographerNoticeEvent, NoticeChannelFlags>

export const PHOTOGRAPHER_NOTICE_EVENTS: {
  id: PhotographerNoticeEvent
  label: string
  hint: string
}[] = [
  { id: 'booking', label: 'New booking request', hint: 'Someone booked from the site.' },
  { id: 'message', label: 'New message', hint: 'Someone wrote you from the site.' },
  { id: 'feedback', label: 'Client feedback', hint: 'Feedback on a delivery gallery.' },
]

export function defaultNoticeChannels(): NoticeChannels {
  const inbound: NoticeChannelFlags = { email: true, inApp: true, mobile: false }
  return {
    booking: { ...inbound },
    message: { ...inbound },
    feedback: { ...inbound },
  }
}

export function mergeNoticeChannels(raw: unknown, awayEmailOn = true): NoticeChannels {
  const defaults = defaultNoticeChannels()
  if (!awayEmailOn) {
    defaults.booking.email = false
    defaults.message.email = false
    defaults.feedback.email = false
  }
  if (!raw || typeof raw !== 'object') return defaults
  const src = raw as Record<string, Partial<NoticeChannelFlags>>
  for (const id of Object.keys(defaults) as PhotographerNoticeEvent[]) {
    const row = src[id]
    if (!row || typeof row !== 'object') continue
    if (typeof row.email === 'boolean') defaults[id].email = row.email
    if (typeof row.inApp === 'boolean') defaults[id].inApp = row.inApp
    if (typeof row.mobile === 'boolean') defaults[id].mobile = row.mobile
  }
  return defaults
}

export function isStudioStandalone() {
  if (typeof window === 'undefined') return false
  const media = window.matchMedia('(display-mode: standalone)').matches
  const ios = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return media || ios
}
