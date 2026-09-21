import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowUp, X } from 'lucide-react'
import { StudioIcon } from '@/components/studio/StudioIconButton'
import { StudioImageGallery } from '@/components/studio/StudioImageGallery'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  assistantAvatarUrl,
  assistantDisplayName,
  cancelAssistantTurn,
  confirmPreview,
  getAssistantStatus,
  lastPendingConfirm,
  lastPendingPick,
  loadAssistantThread,
  persistAssistantMessages,
  postAssistant,
  postAssistantWrite,
  studioLookPath,
  type AssistantConfirmJob,
  type AssistantMediaPreview,
  type AssistantPick,
  type AssistantThreadRecord,
  type AssistantTurn,
  type AssistantUiMessage,
  type AssistantWriteResult,
} from '@/lib/assistant'
import { runAssistantReadTool } from '@/lib/assistant-tools'
import { resendGalleryEmail } from '@/lib/clients'
import { sendTestNotice } from '@/lib/notifications'
import { listMediaPage, listMediaByIds, mediaLabel, mediaThumbUrl, getMedia, type MediaRecord } from '@/lib/library'
import { emitStudioRecordChanged } from '@/lib/studio-record-sync'
import { writeStudioAppearance, applyStudioAppearanceToDocument, type StudioAppearance } from '@/lib/studio-appearance'
import { pb } from '@/lib/pocketbase'
import { pbErrorMessage } from '@/lib/pb-error'
import { cn } from '@/lib/utils'

const TURN_MS = 60_000
const SESSION_GREETING = 'How can I help you today?'

function galleryMediaHref(id: string, room: 'gallery' | 'portfolio' = 'gallery') {
  return `/studio/gallery?room=${room}&media=${encodeURIComponent(id)}`
}

function mediaFromNavigate(path: string): string | null {
  try {
    const url = new URL(path, 'http://local')
    return url.searchParams.get('media')
  } catch {
    const m = /[?&]media=([^&]+)/.exec(path)
    return m ? decodeURIComponent(m[1]) : null
  }
}

function isLatestGalleryPhotoQuestion(text: string) {
  const t = text.toLowerCase().replace(/\s+/g, ' ').trim()
  return (
    /last (picture|photo|image|upload)/.test(t) ||
    /latest (picture|photo|image|upload)/.test(t) ||
    /most recent (picture|photo|image|upload)/.test(t) ||
    /last (thing|one) i uploaded/.test(t) ||
    /what (picture|photo|image) did i (last )?upload/.test(t)
  )
}

async function latestGalleryPreview(): Promise<{
  message: AssistantUiMessage
  href: string
} | null> {
  const page = await listMediaPage({ page: 1, vault: 'gallery', sort: 'date', perPage: 1 })
  const item = page.items[0]
  if (!item) {
    return {
      message: {
        role: 'assistant',
        text: 'The Gallery is empty — nothing uploaded yet.',
        kind: 'reply',
      },
      href: '/studio/gallery?room=gallery',
    }
  }
  const href = galleryMediaHref(item.id, 'gallery')
  const media: AssistantMediaPreview = {
    id: item.id,
    label: mediaLabel(item),
    thumb: mediaThumbUrl(item, '800x0'),
    href,
  }
  return {
    href,
    message: {
      role: 'assistant',
      text: 'Here’s the latest Gallery upload.',
      kind: 'reply',
      media,
    },
  }
}

async function previewForMediaId(id: string): Promise<AssistantMediaPreview | null> {
  try {
    const item = await getMedia(id)
    const room = item.vault === 'portfolio' ? 'portfolio' : 'gallery'
    return {
      id: item.id,
      label: mediaLabel(item),
      thumb: mediaThumbUrl(item, '800x0'),
      href: galleryMediaHref(item.id, room),
    }
  } catch {
    return null
  }
}

function AssistantAvatar({
  name,
  url,
  size = 'sm',
}: {
  name: string
  url: string | null
  size?: 'sm' | 'md'
}) {
  const dim = size === 'md' ? 'h-9 w-9' : 'h-7 w-7'
  const initial = name.trim().charAt(0).toUpperCase() || 'A'
  if (url) {
    return <img src={url} alt="" className={cn(dim, 'shrink-0 rounded-full object-cover')} />
  }
  return (
    <span
      className={cn(
        dim,
        'inline-flex shrink-0 items-center justify-center rounded-full bg-studio-bg text-[11px] font-semibold text-studio-muted',
      )}
      aria-hidden
    >
      {initial}
    </span>
  )
}

/** Light chat formatting: paragraphs, bullets, bold — hide raw record ids. */
function AssistantRichText({ text, className }: { text: string; className?: string }) {
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\s*\(ID:\s*[a-z0-9]+\)/gi, '')
    .replace(/\s*\(id:\s*[a-z0-9]+\)/gi, '')
  const blocks = cleaned
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  function inline(chunk: string, keyBase: string) {
    const parts: ReactNode[] = []
    const re = /\*\*(.+?)\*\*|\*(.+?)\*/g
    let last = 0
    let m: RegExpExecArray | null
    let i = 0
    while ((m = re.exec(chunk))) {
      if (m.index > last) parts.push(chunk.slice(last, m.index))
      parts.push(
        <strong key={`${keyBase}-${i++}`} className="font-semibold">
          {m[1] || m[2]}
        </strong>,
      )
      last = m.index + m[0].length
    }
    if (last < chunk.length) parts.push(chunk.slice(last))
    return parts.length ? parts : chunk
  }

  return (
    <div className={cn('space-y-2 px-3.5', className)}>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').map((l) => l.trimEnd())
        const allBullets = lines.every((l) => /^([*\-•]|\d+\.)\s+/.test(l.trim()))
        if (allBullets && lines.length > 0) {
          return (
            <ul key={bi} className="list-disc space-y-1 pl-4 marker:text-studio-muted">
              {lines.map((line, li) => {
                const body = line.trim().replace(/^([*\-•]|\d+\.)\s+/, '')
                return <li key={li}>{inline(body, `${bi}-${li}`)}</li>
              })}
            </ul>
          )
        }
        return (
          <p key={bi} className="whitespace-pre-wrap">
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 ? '\n' : null}
                {inline(line, `${bi}-${li}`)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function MessageBubble({
  message,
  identityName,
  identityAvatar,
  onOpenMedia,
}: {
  message: AssistantUiMessage
  identityName?: string
  identityAvatar?: string | null
  onOpenMedia?: (href: string) => void
}) {
  const mine = message.role === 'user'
  const name = identityName || 'Assistant'
  return (
    <div className={cn('flex gap-2', mine ? 'justify-end' : 'justify-start')}>
      {!mine ? <AssistantAvatar name={name} url={identityAvatar ?? null} /> : null}
      <div
        className={cn(
          'max-w-[88%] overflow-hidden text-sm leading-relaxed',
          mine
            ? 'rounded-2xl rounded-br-md bg-studio-fg text-studio-bg'
            : 'rounded-2xl rounded-bl-md bg-studio-bg text-studio-fg',
        )}
      >
        {!mine ? (
          <p className="px-3.5 pt-2 text-[11px] font-medium tracking-wide text-studio-muted">{name}</p>
        ) : null}
        {message.text ? (
          mine ? (
            <p className="whitespace-pre-wrap px-3.5 py-2.5">{message.text}</p>
          ) : (
            <AssistantRichText text={message.text} className="pb-2.5 pt-0.5" />
          )
        ) : null}
        {message.media?.thumb ? (
          <button
            type="button"
            className="block w-full overflow-hidden border-t border-studio-border/40 text-left"
            onClick={() => onOpenMedia?.(message.media!.href)}
          >
            <img
              src={message.media.thumb}
              alt={message.media.label || 'Photograph'}
              className="max-h-56 w-full object-cover"
            />
            <span className="block px-3.5 py-2 text-xs text-studio-muted">Open in Gallery</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}

async function liveConfirmLabel(action: string, payload: Record<string, unknown>) {
  const base = confirmPreview(action, payload)
  if (action === 'update_booking' && payload.id) {
    try {
      const row = await pb.collection('bookings').getOne<{
        fee_ngn?: number
        amount_paid_ngn?: number
        status?: string
        preferred_at?: string
        studio_notes?: string
        person?: string
        expand?: { person?: { name?: string } }
      }>(String(payload.id), { expand: 'person' })
      const name = row.expand?.person?.name || 'Client'
      const fee = Number(row.fee_ngn || 0)
      const paid = Number(row.amount_paid_ngn || 0)
      let already = true
      let anyField = false
      if (payload.fee_ngn != null) {
        anyField = true
        if (Number(payload.fee_ngn) !== fee) already = false
      }
      if (payload.amount_paid_ngn != null) {
        anyField = true
        if (Number(payload.amount_paid_ngn) !== paid) already = false
      }
      if (payload.status != null) {
        anyField = true
        if (String(payload.status) !== String(row.status || '')) already = false
      }
      if (payload.preferred_at != null) {
        anyField = true
        if (String(payload.preferred_at) !== String(row.preferred_at || '')) already = false
      }
      if (payload.studio_notes != null) {
        anyField = true
        if (String(payload.studio_notes) !== String(row.studio_notes || '')) already = false
      }
      if (payload.person != null) {
        anyField = true
        if (String(payload.person) !== String(row.person || '')) already = false
      }
      if (payload.client_name != null) {
        anyField = true
        if (String(payload.client_name).trim().toLowerCase() !== name.trim().toLowerCase()) already = false
      }
      if (anyField && already) {
        return {
          title: 'Already saved',
          body: `${name} already has these booking values.`,
          blocked: true,
          stale: true,
        }
      }
      const bits = [base.body, `now ₦${fee} fee · ₦${paid} paid`].filter(Boolean)
      return { title: `Change ${name}'s booking?`, body: bits.join(' — '), blocked: false }
    } catch {
      return { title: 'Cannot confirm', body: 'That booking is gone.', blocked: true, stale: true }
    }
  }
  if (action === 'delete_record' && payload.id && payload.collection) {
    try {
      await pb.collection(String(payload.collection)).getOne(String(payload.id))
      return { ...base, blocked: false }
    } catch {
      return { title: 'Cannot confirm', body: 'That record is gone.', blocked: true, stale: true }
    }
  }
  if (action === 'send_mail' && payload.kind === 'resend_gallery' && payload.deliveryId) {
    try {
      const row = await pb.collection('deliveries').getOne<{ client_name?: string; client_email?: string }>(
        String(payload.deliveryId),
      )
      const name = String(payload.clientName || payload.name || row.client_name || 'Client').trim()
      const email = String(row.client_email || '').trim()
      return {
        title: 'Send gallery mail?',
        body: email ? `Resend Delivery link to ${name} (${email})` : `Resend Delivery link to ${name}`,
        blocked: false,
      }
    } catch {
      return { title: 'Cannot confirm', body: 'That delivery is gone.', blocked: true, stale: true }
    }
  }
  if (action === 'send_mail' && payload.kind === 'resend_gallery' && !payload.deliveryId) {
    return { title: 'Cannot confirm', body: 'Which Delivery should get the email?', blocked: true }
  }
  if (action === 'send_mail' && payload.kind === 'test_mail') {
    return { title: 'Send test notice mail?', body: 'Notification test to your notify address', blocked: false }
  }
  if (action === 'website_write' && payload.kind === 'update_faq' && payload.id) {
    try {
      await pb.collection('faq_items').getOne(String(payload.id))
      return { ...base, blocked: false }
    } catch {
      return { title: 'Cannot confirm', body: 'That FAQ is gone.', blocked: true, stale: true }
    }
  }
  return { ...base, blocked: false }
}

function doneText(summary?: string, fallback = 'Saved.') {
  const t = String(summary || '').trim()
  return t || fallback
}

function mediaSearchItems(result: unknown): { id: string; thumb?: string; href?: string; label?: string }[] {
  const rows = Array.isArray(result)
    ? result
    : result && typeof result === 'object' && Array.isArray((result as { items?: unknown }).items)
      ? (result as { items: unknown[] }).items
      : []
  return rows
    .map((row) => {
      const r = row as { id?: string; thumb?: string; href?: string; label?: string }
      return r.id ? { id: String(r.id), thumb: r.thumb, href: r.href, label: r.label } : null
    })
    .filter(Boolean) as { id: string; thumb?: string; href?: string; label?: string }[]
}

async function restorePendingUi(
  messages: AssistantUiMessage[],
  setConfirmLive: (v: { title: string; body: string; blocked?: boolean; stale?: boolean } | null) => void,
  setPendingConfirm: (v: { action: string; payload: Record<string, unknown> } | null) => void,
  setPick: (v: AssistantPick | null) => void,
  setPickImages: (v: MediaRecord[] | undefined) => void,
) {
  const confirm = lastPendingConfirm(messages)
  if (confirm) {
    const live = await liveConfirmLabel(confirm.action, confirm.payload)
    if (live.stale) {
      setConfirmLive(null)
      setPendingConfirm(null)
      try {
        await postAssistantWrite({ action: 'dismiss_confirm', payload: {}, confirm: true })
      } catch {
        /* ignore */
      }
    } else {
      setConfirmLive(live)
      setPendingConfirm(live.blocked ? null : confirm)
    }
  } else {
    setConfirmLive(null)
    setPendingConfirm(null)
  }
  const pendingPick = lastPendingPick(messages)
  if (pendingPick) {
    setPick(pendingPick)
    const ids = pendingPick.selectedIds || []
    setPickImages(ids.length ? await listMediaByIds(ids) : undefined)
  }
}

export function AssistantChat() {
  const [open, setOpen] = useState(false)
  const [identity, setIdentity] = useState<AssistantThreadRecord | null>(null)

  useEffect(() => {
    let alive = true
    void loadAssistantThread()
      .then((row) => {
        if (alive) setIdentity(row)
      })
      .catch(() => {
        /* keep default label */
      })
    return () => {
      alive = false
    }
  }, [open])

  const displayName = assistantDisplayName(identity)
  const avatarUrl = assistantAvatarUrl(identity)

  return (
    <>
      <AssistantDrawer open={open} onClose={() => setOpen(false)} />
      <button
        type="button"
        className={cn(
          'fixed z-50 inline-flex items-center rounded-full bg-studio-fg text-studio-bg shadow-md transition-opacity hover:opacity-90 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-3 md:bottom-6 md:right-6',
          open ? 'pointer-events-none h-12 opacity-0' : 'min-h-12 gap-2.5 py-2 pl-2 pr-4',
        )}
        aria-label={displayName}
        aria-expanded={open}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        onClick={() => setOpen(true)}
      >
        <AssistantAvatar name={displayName} url={avatarUrl} size="md" />
        <span className="min-w-0 text-left leading-tight">
          <span className="block truncate text-sm font-medium">{displayName}</span>
          <span className="block truncate text-[11px] opacity-80">AI assistant</span>
        </span>
      </button>
    </>
  )
}

export function AssistantDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<AssistantUiMessage[]>([])
  const [identity, setIdentity] = useState<AssistantThreadRecord | null>(null)
  const [draft, setDraft] = useState('')
  const [working, setWorking] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [configured, setConfigured] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creditLow, setCreditLow] = useState(false)
  const [pick, setPick] = useState<AssistantPick | null>(null)
  const [pickImages, setPickImages] = useState<MediaRecord[] | undefined>()
  const [confirmLive, setConfirmLive] = useState<{ title: string; body: string; blocked?: boolean; stale?: boolean } | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<AssistantConfirmJob | null>(null)
  const [confirmQueue, setConfirmQueue] = useState<AssistantConfirmJob[]>([])
  const [sessionGreeting, setSessionGreeting] = useState<string | null>(null)
  const [historyCount, setHistoryCount] = useState(0)
  const [threadReady, setThreadReady] = useState(false)
  const workingRef = useRef(false)
  const seqRef = useRef(0)
  const routeRef = useRef({ pathname: location.pathname, search: location.search })
  const scrollerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const jumpBottomRef = useRef(false)
  const nearBottomRef = useRef(true)
  const suppressSmoothRef = useRef(false)
  const lastUserTextRef = useRef('')

  routeRef.current = { pathname: location.pathname, search: location.search }

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const pinToBottom = useCallback((smooth: boolean) => {
    const el = scrollerRef.current
    if (!el) return
    if (smooth) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    else el.scrollTop = el.scrollHeight
    nearBottomRef.current = true
  }, [])

  // Instant pin on open / hydrate — never animate through history.
  useLayoutEffect(() => {
    if (!open || !threadReady || !jumpBottomRef.current) return
    jumpBottomRef.current = false
    suppressSmoothRef.current = true
    pinToBottom(false)
  }, [open, threadReady, messages, sessionGreeting, historyCount, pinToBottom])

  useEffect(() => {
    if (!open || !threadReady) return
    if (jumpBottomRef.current) return
    if (suppressSmoothRef.current) {
      suppressSmoothRef.current = false
      return
    }
    if (nearBottomRef.current) pinToBottom(true)
  }, [messages, working, confirmLive, error, sessionGreeting, open, threadReady, pinToBottom])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [open, onClose])

  const applyTurn = useCallback(
    async (turn: AssistantTurn) => {
      if (turn.stale) return 'stop'
      if (turn.messages) {
        if (!(turn.opened && turn.messages.length === 0)) setMessages(turn.messages)
      }
      if (turn.creditLow || turn.ui?.creditLow) setCreditLow(true)
      if (turn.creditEmpty) {
        setError(turn.text || 'Credit ran out.')
        return 'stop'
      }
      const look = turn.ui?.navigate ? studioLookPath(turn.ui.navigate) : null
      if (look) {
        const mediaId = mediaFromNavigate(look)
        if (mediaId) {
          const preview = await previewForMediaId(mediaId)
          const forceOpen = /take me|open (it|the|in)|go (to|there)|show (me )?in (the )?gallery|navigate/i.test(
            lastUserTextRef.current,
          )
          if (preview && !forceOpen) {
            if (!turn.ui?.confirm && !turn.ui?.pick) {
              setConfirmLive(null)
              setPendingConfirm(null)
            }
            setMessages((prev) => {
              const next = [...prev]
              for (let i = next.length - 1; i >= 0; i--) {
                if (next[i].role === 'assistant') {
                  next[i] = { ...next[i], media: preview }
                  break
                }
              }
              void persistAssistantMessages(next)
              return next
            })
          } else {
            navigate(look)
            if (!turn.ui?.confirm && !turn.ui?.pick) {
              setConfirmLive(null)
              setPendingConfirm(null)
            }
            if (preview) {
              setMessages((prev) => {
                const next = [...prev]
                for (let i = next.length - 1; i >= 0; i--) {
                  if (next[i].role === 'assistant') {
                    next[i] = { ...next[i], media: preview }
                    break
                  }
                }
                void persistAssistantMessages(next)
                return next
              })
            }
          }
        } else {
          navigate(look)
          if (!turn.ui?.confirm && !turn.ui?.pick) {
            setConfirmLive(null)
            setPendingConfirm(null)
          }
        }
      }
      if (turn.ui?.appearance === 'night' || turn.ui?.appearance === 'light') {
        const next = turn.ui.appearance as StudioAppearance
        writeStudioAppearance(next)
        applyStudioAppearanceToDocument(next)
        window.dispatchEvent(new CustomEvent('studio-appearance', { detail: next }))
      }
      if (turn.ui?.shell?.sidebar) {
        window.dispatchEvent(new CustomEvent('studio-shell', { detail: { sidebar: turn.ui.shell.sidebar } }))
      }
      if (turn.ui?.pick) {
        let nextPick = turn.ui.pick
        let ids = nextPick.selectedIds || []
        if (!ids.length && nextPick.day) {
          const found = await runAssistantReadTool('search_media', { day: nextPick.day, newest: 48 })
          ids = mediaSearchItems(found).map((row) => row.id)
          nextPick = { ...nextPick, selectedIds: ids }
        }
        setPick(nextPick)
        setPickImages(ids.length ? await listMediaByIds(ids) : undefined)
        setConfirmLive(null)
        setPendingConfirm(null)
        setConfirmQueue([])
      }
      if (turn.ui?.confirm) {
        const queue = turn.ui.confirmQueue?.length
          ? turn.ui.confirmQueue
          : turn.ui.confirm
            ? [turn.ui.confirm]
            : []
        setConfirmQueue(queue)
        const live = await liveConfirmLabel(turn.ui.confirm.action, turn.ui.confirm.payload)
        if (live.stale) {
          setConfirmLive(null)
          setPendingConfirm(null)
          setConfirmQueue([])
          try {
            await postAssistantWrite({ action: 'dismiss_confirm', payload: {}, confirm: true })
          } catch {
            /* ignore */
          }
        } else {
          setConfirmLive(
            queue.length > 1
              ? { ...live, body: [live.body, `${queue.length} changes in queue`].filter(Boolean).join(' · ') }
              : live,
          )
          setPendingConfirm(live.blocked ? null : turn.ui.confirm)
        }
      } else if (!turn.ui?.pick && turn.messages) {
        const still = lastPendingConfirm(turn.messages)
        if (!still) {
          setConfirmLive(null)
          setPendingConfirm(null)
          setConfirmQueue([])
        }
      }
      const autos = turn.ui?.autoWrites?.length
        ? turn.ui.autoWrites
        : turn.ui?.autoWrite
          ? [turn.ui.autoWrite]
          : []
      if (autos.length) {
        return { kind: 'autos' as const, autos }
      }
      return turn
    },
    [navigate],
  )

  const runTurn = useCallback(
    async (body: { text?: string; open?: boolean; toolResults?: { id: string; name: string; result: unknown }[] }) => {
      if (workingRef.current && !body.toolResults) return
      if (offline && !body.open) {
        setError('You are offline.')
        return
      }
      workingRef.current = true
      setWorking(true)
      if (!body.open) setError(null)
      const seq = ++seqRef.current
      const timer = window.setTimeout(() => {
        if (seqRef.current !== seq) return
        setError('Timed out — send again.')
        setWorking(false)
        workingRef.current = false
        void cancelAssistantTurn(routeRef.current)
      }, TURN_MS)
      try {
        let round = 0
        let busyTries = 0
        let payload = { ...body, route: routeRef.current }
        let lastMediaHits: { id: string; thumb?: string; href?: string; label?: string }[] = []
        while (round < 4) {
          const turn = await postAssistant(payload)
          if (seqRef.current !== seq) {
            void cancelAssistantTurn(routeRef.current)
            return
          }
          if (turn.inFlight) {
            if (busyTries < 10) {
              busyTries += 1
              await new Promise((resolve) => window.setTimeout(resolve, 500 + busyTries * 150))
              continue
            }
            setError('Still finishing the last reply — send again in a moment.')
            return
          }
          busyTries = 0
          const applied = await applyTurn(turn)
          if (seqRef.current !== seq) {
            void cancelAssistantTurn(routeRef.current)
            return
          }
          if (applied === 'stop') return
          if (applied && typeof applied === 'object' && 'kind' in applied && applied.kind === 'autos') {
            const summaries: string[] = []
            for (const job of applied.autos) {
              try {
                const result = await postAssistantWrite({
                  action: job.action,
                  payload: job.payload,
                  confirm: true,
                })
                if (result.collection && result.id) {
                  emitStudioRecordChanged({ collection: result.collection, id: result.id })
                }
                if (result.summary) summaries.push(result.summary)
                if (result.messages) setMessages(result.messages)
              } catch (autoErr) {
                summaries.push(autoErr instanceof Error ? autoErr.message : 'Could not save one change.')
              }
            }
            if (summaries.length) {
              setMessages((prev) => {
                const text = summaries.join('\n')
                const next = [...prev]
                const last = next[next.length - 1]
                // Prefer the concrete write outcome over a vague model "Done/Updated".
                if (last?.role === 'assistant' && last.kind !== 'confirm' && last.kind !== 'pick') {
                  next[next.length - 1] = { ...last, text, kind: 'reply', confirm: null, pick: null }
                } else {
                  next.push({ role: 'assistant', text, kind: 'reply' })
                }
                void persistAssistantMessages(next)
                return next
              })
            }
            // Confirms/picks already applied in applyTurn; only continue if reads remain.
            const readsAfterAuto = turn.readTools ?? []
            if (!readsAfterAuto.length) return
          }
          const reads = turn.readTools ?? []
          if (!reads.length) {
            // Prefer an in-chat preview over opening Gallery unless the model asked to navigate.
            if (!turn.ui?.navigate && lastMediaHits[0] && lastMediaHits.length <= 3) {
              const hit = lastMediaHits[0]
              const preview: AssistantMediaPreview = {
                id: hit.id,
                label: hit.label,
                thumb: hit.thumb || '',
                href: hit.href || galleryMediaHref(hit.id),
              }
              if (!preview.thumb) {
                const fetched = await previewForMediaId(hit.id)
                if (fetched) Object.assign(preview, fetched)
              }
              if (preview.thumb) {
                setMessages((prev) => {
                  const next = [...prev]
                  for (let i = next.length - 1; i >= 0; i--) {
                    if (next[i].role === 'assistant') {
                      next[i] = { ...next[i], media: preview }
                      break
                    }
                  }
                  void persistAssistantMessages(next)
                  return next
                })
              }
            }
            return
          }
          const toolResults = []
          for (const tool of reads) {
            const result = await runAssistantReadTool(tool.name, tool.args || {})
            if (tool.name === 'search_media') {
              lastMediaHits = mediaSearchItems(result)
            }
            toolResults.push({ id: tool.id, name: tool.name, result })
          }
          payload = { route: routeRef.current, toolResults }
          round += 1
        }
      } catch (e) {
        if (seqRef.current === seq) {
          setError(e instanceof Error ? e.message : 'Assistant could not reply.')
        }
      } finally {
        window.clearTimeout(timer)
        if (seqRef.current === seq) {
          setWorking(false)
          workingRef.current = false
        }
      }
    },
    [applyTurn, offline, navigate],
  )

  useEffect(() => {
    if (!open) {
      setSessionGreeting(null)
      setHistoryCount(0)
      setThreadReady(false)
      return
    }
    let alive = true
    setThreadReady(false)

    async function hydrate() {
      try {
        const status = await getAssistantStatus()
        if (!alive) return
        setConfigured(status.configured)
        if (!status.configured) {
          setError('Assistant is not set up.')
          setThreadReady(true)
          return
        }
        if (status.creditEmpty) setError('Credit ran out.')
        const row = await loadAssistantThread()
        if (!alive) return
        setIdentity(row)
        let loaded: AssistantUiMessage[] = []
        if (Array.isArray(row?.messages)) loaded = row.messages
        else if (typeof row?.messages === 'string') {
          try {
            const parsed = JSON.parse(row.messages) as AssistantUiMessage[]
            if (Array.isArray(parsed)) loaded = parsed
          } catch {
            /* ignore */
          }
        }
        setMessages(loaded)
        setHistoryCount(loaded.length)
        setSessionGreeting(SESSION_GREETING)
        jumpBottomRef.current = true
        nearBottomRef.current = true
        setThreadReady(true)
        await restorePendingUi(loaded, setConfirmLive, setPendingConfirm, setPick, setPickImages)
        if (row?.credit_empty) setError('Credit ran out.')
      } catch (e) {
        if (!alive) return
        const status = (e as { status?: number }).status
        setConfigured(false)
        setError(
          status === 401
            ? 'Sign in again to use Assistant.'
            : pbErrorMessage(e, 'Could not reach Assistant.'),
        )
        setThreadReady(true)
      }
    }

    void hydrate()
    return () => {
      alive = false
    }
  }, [open])

  async function onSend() {
    const text = draft.trim()
    if (!text) return
    if (!configured) {
      setError(error || 'Assistant is not set up.')
      return
    }
    if (workingRef.current) {
      seqRef.current += 1
      workingRef.current = false
      setWorking(false)
      void cancelAssistantTurn(routeRef.current)
    }
    if (offline) {
      setError('You are offline.')
      return
    }
    setDraft('')
    setConfirmLive(null)
    setPendingConfirm(null)
    lastUserTextRef.current = text
    setMessages((prev) => [...prev, { role: 'user', text }])

    if (isLatestGalleryPhotoQuestion(text)) {
      setWorking(true)
      try {
        const shot = await latestGalleryPreview()
        if (!shot) return
        setMessages((prev) => {
          const next = [...prev, shot.message]
          void persistAssistantMessages(next)
          return next
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not open that photo.')
      } finally {
        setWorking(false)
      }
      return
    }

    await runTurn({ text })
  }

  async function applyWriteSideEffects(result: AssistantWriteResult) {
    if (result.delegate === 'resend-gallery' && result.id) {
      await resendGalleryEmail(result.id)
      result.summary = 'Gallery mail sent.'
    }
    if (result.delegate === 'test-mail') {
      await sendTestNotice()
      result.summary = 'Test notice sent.'
    }
    if (result.collection && result.id) {
      emitStudioRecordChanged({ collection: result.collection, id: result.id })
      if (result.collection === 'bookings') navigate(`/studio/bookings?booking=${encodeURIComponent(result.id)}`)
      if (result.collection === 'people') navigate(`/studio/clients?person=${encodeURIComponent(result.id)}`)
      if (result.collection === 'deliveries') {
        navigate(`/studio/clients?tab=deliveries&delivery=${encodeURIComponent(result.id)}`)
      }
      if (result.collection === 'assistant_thread') {
        const refreshed = await loadAssistantThread()
        setIdentity(refreshed)
      }
    }
  }

  async function showNextConfirm(job: AssistantConfirmJob, queue: AssistantConfirmJob[]) {
    setConfirmQueue(queue)
    const live = await liveConfirmLabel(job.action, job.payload)
    if (live.stale || live.blocked) {
      setConfirmLive(live.stale ? null : live)
      setPendingConfirm(null)
      return
    }
    setConfirmLive(
      queue.length > 1
        ? { ...live, body: [live.body, `${queue.length} changes in queue`].filter(Boolean).join(' · ') }
        : live,
    )
    setPendingConfirm(job)
  }

  async function onConfirm() {
    if (!pendingConfirm || !confirmLive || confirmLive.blocked) return
    setWorking(true)
    setError(null)
    try {
      const result = await postAssistantWrite({
        action: pendingConfirm.action,
        payload: pendingConfirm.payload,
        confirm: true,
      })
      try {
        await applyWriteSideEffects(result)
      } catch (mailErr) {
        setConfirmLive(null)
        setPendingConfirm(null)
        setConfirmQueue([])
        const msg = mailErr instanceof Error ? mailErr.message : 'Could not send mail.'
        setError(msg)
        setMessages((prev) => [...prev, { role: 'assistant' as const, text: msg, kind: 'error' }])
        return
      }
      const summary = doneText(result.summary, 'Saved.')
      let msgs: AssistantUiMessage[] = result.messages ? [...result.messages] : []
      // Drop leftover confirm chrome; keep only a concrete outcome line.
      msgs = msgs
        .filter((m) => m.kind !== 'confirm' && m.kind !== 'pick')
        .map((m) =>
          m.role === 'assistant' && m.kind === 'reply'
            ? { ...m, confirm: null, pick: null }
            : m,
        )
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant' && last.kind === 'reply') {
        msgs[msgs.length - 1] = { ...last, text: summary, kind: 'reply', confirm: null, pick: null }
      } else {
        msgs.push({ role: 'assistant', text: summary, kind: 'reply' })
      }

      if (result.nextConfirm) {
        const queue = result.confirmQueue?.length ? result.confirmQueue : [result.nextConfirm]
        msgs.push({
          role: 'assistant',
          text: queue.length > 1 ? `Confirm these ${queue.length} changes.` : 'Confirm this change.',
          kind: 'confirm',
          confirm: result.nextConfirm,
          confirmQueue: queue,
        })
        setMessages(msgs)
        void persistAssistantMessages(msgs)
        await showNextConfirm(result.nextConfirm, queue)
        return
      }

      setMessages(msgs)
      void persistAssistantMessages(msgs)
      setConfirmLive(null)
      setPendingConfirm(null)
      setConfirmQueue([])

      if (result.continueAgenda) {
        await runTurn({
          text: 'Continue with any remaining parts of my last request. Finish what is still undone.',
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setWorking(false)
    }
  }

  async function onConfirmAll() {
    if (!pendingConfirm || !confirmLive || confirmLive.blocked) return
    const jobs =
      confirmQueue.length > 0 ? confirmQueue : pendingConfirm ? [pendingConfirm] : []
    if (!jobs.length) return
    setWorking(true)
    setError(null)
    try {
      const batchRes = await postAssistantWrite({
        action: 'confirm_all',
        payload: { items: jobs, head: pendingConfirm },
        confirm: true,
      })
      const batch = batchRes.batch?.length ? batchRes.batch : jobs
      const summaries: string[] = []
      for (const job of batch) {
        try {
          const result = await postAssistantWrite({
            action: job.action,
            payload: job.payload,
            confirm: true,
          })
          try {
            await applyWriteSideEffects(result)
          } catch (mailErr) {
            summaries.push(mailErr instanceof Error ? mailErr.message : 'Mail failed.')
            continue
          }
          if (result.summary) summaries.push(result.summary)
          if (result.messages) setMessages(result.messages)
        } catch (oneErr) {
          summaries.push(oneErr instanceof Error ? oneErr.message : 'One change failed.')
        }
      }
      setConfirmLive(null)
      setPendingConfirm(null)
      setConfirmQueue([])
      if (summaries.length) {
        setMessages((prev) => {
          const text = summaries.join('\n')
          const next = [...prev.filter((m) => m.kind !== 'confirm' && m.kind !== 'pick')]
          const last = next[next.length - 1]
          if (last?.role === 'assistant' && last.kind === 'reply') {
            next[next.length - 1] = { ...last, text, kind: 'reply', confirm: null, pick: null }
          } else {
            next.push({ role: 'assistant', text, kind: 'reply' })
          }
          void persistAssistantMessages(next)
          return next
        })
      }
      if (batchRes.continueAgenda) {
        await runTurn({
          text: 'Continue with any remaining parts of my last request. Finish what is still undone.',
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setWorking(false)
    }
  }

  async function onDismissConfirm() {
    setConfirmLive(null)
    setPendingConfirm(null)
    setConfirmQueue([])
    try {
      const result = await postAssistantWrite({ action: 'dismiss_confirm', payload: {}, confirm: true })
      if (result.messages) setMessages(result.messages)
    } catch {
      /* ignore */
    }
  }

  if (!open && !pick) return null

  const displayName = assistantDisplayName(identity)
  const avatarUrl = assistantAvatarUrl(identity)

  return (
    <>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close Assistant"
            className="fixed inset-0 z-40 bg-studio-scrim"
            onClick={onClose}
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={displayName}
            className="studio-shell fixed z-50 flex w-[min(26rem,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-2xl border border-studio-border bg-studio-panel shadow-[0_18px_50px_rgb(26_26_26/0.18)] bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-3 top-[max(1rem,env(safe-area-inset-top))] md:bottom-6 md:right-6 md:top-auto md:h-[min(36rem,calc(100dvh-3rem))]"
          >
            <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-studio-border px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <AssistantAvatar name={displayName} url={avatarUrl} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight text-studio-fg">{displayName}</p>
                  <p className="truncate text-xs text-studio-muted">AI assistant</p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-studio-muted transition-colors hover:bg-studio-bg hover:text-studio-fg"
                aria-label="Close"
                onClick={onClose}
              >
                <StudioIcon icon={X} />
              </button>
            </header>

            {creditLow ? (
              <p className="border-b border-studio-border bg-studio-bg/60 px-4 py-2 text-xs text-studio-muted">
                Credit is running low.
              </p>
            ) : null}

            <div
              ref={scrollerRef}
              className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
              onScroll={() => {
                const el = scrollerRef.current
                if (!el) return
                nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
              }}
            >
              {!threadReady ? (
                <p className="px-2 text-sm text-studio-muted">Loading…</p>
              ) : (
                <div className="flex min-h-full flex-col">
                  <div className="min-h-0 flex-1" aria-hidden />
                  {historyCount > 0 ? (
                    <div className="space-y-3 pb-2">
                      {messages.slice(0, historyCount).map((m, i) => (
                        <MessageBubble
                          key={`h-${i}`}
                          message={m}
                          identityName={displayName}
                          identityAvatar={avatarUrl}
                          onOpenMedia={(href) => navigate(href)}
                        />
                      ))}
                      <div className="flex items-center gap-3 py-3">
                        <div className="h-px flex-1 bg-studio-border" />
                        <span className="shrink-0 text-[11px] font-medium tracking-wide text-studio-muted">
                          Earlier
                        </span>
                        <div className="h-px flex-1 bg-studio-border" />
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    {sessionGreeting ? (
                      <MessageBubble
                        message={{ role: 'assistant', text: sessionGreeting, kind: 'session' }}
                        identityName={displayName}
                        identityAvatar={avatarUrl}
                      />
                    ) : null}

                    {messages.slice(historyCount).map((m, i) => (
                      <MessageBubble
                        key={`s-${i}`}
                        message={m}
                        identityName={displayName}
                        identityAvatar={avatarUrl}
                        onOpenMedia={(href) => navigate(href)}
                      />
                    ))}

                    {confirmLive ? (
                      <div className="rounded-2xl border border-studio-border bg-studio-bg p-3.5">
                        <p className="text-sm font-medium text-studio-fg">{confirmLive.title}</p>
                        {confirmLive.body ? (
                          <p className="mt-1 text-sm text-studio-muted">{confirmLive.body}</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="lg"
                            className="min-h-11 flex-1"
                            disabled={working || Boolean(confirmLive.blocked) || !pendingConfirm}
                            onClick={() => void onConfirm()}
                          >
                            Confirm
                          </Button>
                          {confirmQueue.length > 1 ? (
                            <Button
                              type="button"
                              size="lg"
                              className="min-h-11 flex-1"
                              disabled={working || Boolean(confirmLive.blocked) || !pendingConfirm}
                              onClick={() => void onConfirmAll()}
                            >
                              Confirm all ({confirmQueue.length})
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            className="min-h-11"
                            disabled={working}
                            onClick={() => void onDismissConfirm()}
                          >
                            Not now
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {working ? (
                      <div className="flex justify-start">
                        <div className="rounded-2xl rounded-bl-md bg-studio-bg px-3.5 py-2.5 text-sm text-studio-muted">
                          <span className="inline-flex gap-1">
                            <span className="animate-pulse">·</span>
                            <span className="animate-pulse [animation-delay:120ms]">·</span>
                            <span className="animate-pulse [animation-delay:240ms]">·</span>
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {offline ? <p className="px-2 text-sm text-studio-muted">You are offline.</p> : null}
                    {error ? <Alert variant="error">{error}</Alert> : null}
                  </div>
                </div>
              )}
            </div>

            <form
              className="shrink-0 border-t border-studio-border bg-studio-panel p-3"
              onSubmit={(e) => {
                e.preventDefault()
                void onSend()
              }}
            >
              <div className="flex items-end gap-2 rounded-2xl border border-studio-border bg-studio-bg px-2 py-1.5 focus-within:border-studio-accent/50">
                <label className="sr-only" htmlFor="assistant-draft">
                  Message
                </label>
                <textarea
                  ref={inputRef}
                  id="assistant-draft"
                  rows={1}
                  className="max-h-28 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-studio-fg outline-none placeholder:text-studio-muted"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    const el = e.target
                    el.style.height = 'auto'
                    el.style.height = `${Math.min(el.scrollHeight, 112)}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void onSend()
                    }
                  }}
                  onPaste={(e) => {
                    const items = [...e.clipboardData.items]
                    if (items.some((item) => item.type.startsWith('image/'))) {
                      e.preventDefault()
                      setError("Photos can't be added here.")
                    }
                  }}
                  placeholder={`Message ${displayName}…`}
                />
                <button
                  type="submit"
                  disabled={!configured || !draft.trim()}
                  aria-label="Send"
                  className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-studio-fg text-studio-bg transition-opacity disabled:opacity-35"
                >
                  <StudioIcon icon={ArrowUp} />
                </button>
              </div>
            </form>
          </div>
        </>
      ) : null}

      <StudioImageGallery
        open={Boolean(pick)}
        title={pick?.title || 'Pick photos'}
        images={pickImages}
        selected={pick?.selectedIds}
        onClose={() => setPick(null)}
        onDone={(ids) => {
          const current = pick
          setPick(null)
          if (!current) return
          void (async () => {
            setWorking(true)
            try {
              const result = await postAssistantWrite({
                action: 'pick_photos_then_write',
                pickerToken: current.token,
                confirm: true,
                payload: { ...current.payload, action: current.action, pickerIds: ids, selectedIds: ids },
              })
              if (result.collection && result.id) {
                emitStudioRecordChanged({ collection: result.collection, id: result.id })
                if (result.collection === 'deliveries') {
                  navigate(`/studio/clients?tab=deliveries&delivery=${encodeURIComponent(result.id)}`)
                }
                if (result.collection === 'albums') {
                  navigate(`/studio/gallery?room=albums&album=${encodeURIComponent(result.id)}`)
                }
                if (result.collection === 'work_projects') {
                  navigate(`/studio/gallery?room=work&work=${encodeURIComponent(result.id)}`)
                }
              }
              if (result.messages) setMessages(result.messages)
              else {
                const text = doneText(result.summary, 'Photos saved.')
                setMessages((prev) => [...prev, { role: 'assistant' as const, text, kind: 'reply' }])
              }
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not save.')
            } finally {
              setWorking(false)
            }
          })()
        }}
      />
    </>
  )
}
