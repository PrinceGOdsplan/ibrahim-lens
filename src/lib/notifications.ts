import type { RecordModel } from 'pocketbase'
import { pb } from '@/lib/pocketbase'
import { pbErrorMessage } from '@/lib/pb-error'
import {
  defaultNoticeChannels,
  mergeNoticeChannels,
  type NoticeChannels,
} from '@/lib/notice-channels'

export type NotificationSettings = RecordModel & {
  key: string
  notify_email?: string
  photographer_away?: boolean
  client_gallery?: boolean
  client_downloaded?: boolean
  client_expiring?: boolean
  channels?: NoticeChannels
  last_send_error?: string
  last_sent_at?: string
}

export async function getNotificationSettings() {
  const list = await pb.collection('notification_settings').getList<NotificationSettings>(1, 1, {
    filter: 'key="notifications"',
  })
  const row = list.items[0]
  if (row) {
    return {
      ...row,
      channels: mergeNoticeChannels(row.channels, row.photographer_away !== false),
      client_downloaded: row.client_downloaded !== false,
      client_expiring: row.client_expiring !== false,
      client_gallery: row.client_gallery !== false,
    }
  }
  return pb.collection('notification_settings').create<NotificationSettings>({
    key: 'notifications',
    notify_email: pb.authStore.record?.email ?? '',
    photographer_away: true,
    client_gallery: true,
    client_downloaded: true,
    client_expiring: true,
    channels: defaultNoticeChannels(),
    last_send_error: '',
  })
}

export async function saveNotificationSettings(
  id: string,
  data: Partial<{
    notify_email: string
    photographer_away: boolean
    client_gallery: boolean
    client_downloaded: boolean
    client_expiring: boolean
    channels: NoticeChannels
  }>,
) {
  try {
    return await pb.collection('notification_settings').update<NotificationSettings>(id, data)
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not save notification settings.'))
  }
}

export async function sendTestNotice() {
  try {
    return await pb.send('/api/ibrahim/test-mail', { method: 'POST' })
  } catch (error) {
    const detail = pbErrorMessage(error, 'Could not send a test notice.')
    throw new Error(
      /smtp|resend|mail/i.test(detail)
        ? 'Could not send a test notice. Email sending is not set up.'
        : detail,
    )
  }
}

const HEARTBEAT_MS = 2 * 60 * 1000

export async function touchStudioSeen() {
  const id = pb.authStore.record?.id
  if (!id) return
  try {
    await pb.collection('users').update(id, { last_seen_at: new Date().toISOString() })
  } catch {
    // Idle detection is unused for mail; a failed heartbeat must not log him out.
  }
}

export function startStudioHeartbeat() {
  void touchStudioSeen()
  const id = window.setInterval(() => {
    void touchStudioSeen()
  }, HEARTBEAT_MS)
  return () => window.clearInterval(id)
}
