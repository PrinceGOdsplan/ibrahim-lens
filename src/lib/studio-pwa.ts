import { useEffect } from 'react'
import {
  readStudioAppearance,
  studioStatusBarStyle,
  studioThemeColor,
  type StudioAppearance,
} from '@/lib/studio-appearance'
import { STUDIO_PRODUCT_NAME, STUDIO_SHORT_NAME } from '@/lib/studio-brand'
import { pb } from '@/lib/pocketbase'
import { isStudioStandalone } from '@/lib/notice-channels'

const PUBLIC_VIEWPORT = 'width=device-width, initial-scale=1.0, viewport-fit=cover'
const STUDIO_VIEWPORT =
  'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
const PUBLIC_THEME = '#100e0b'

/** iPhone launch sizes used by apple-touch-startup-image (portrait). */
const STUDIO_SPLASHES: { href: string; media: string }[] = [
  {
    href: '/studio/splash-1170x2532.png',
    media:
      '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
  },
  {
    href: '/studio/splash-1179x2556.png',
    media:
      '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
  },
  {
    href: '/studio/splash-1206x2622.png',
    media:
      '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)',
  },
  {
    href: '/studio/splash-1290x2796.png',
    media:
      '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
  },
  {
    href: '/studio/splash-1320x2868.png',
    media:
      '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)',
  },
]

export function studioVapidPublicKey() {
  return String(import.meta.env.VITE_VAPID_PUBLIC_KEY || '').trim()
}

export function studioVapidConfigured() {
  return Boolean(studioVapidPublicKey())
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

function randomSecret() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function ensureMeta(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
  return el
}

function ensureLink(rel: string, href: string, attrs?: Record<string, string>) {
  const key = attrs?.media ? `link[rel="${rel}"][media="${attrs.media}"]` : `link[rel="${rel}"][href="${href}"]`
  let el = document.head.querySelector(key) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  }
  return el
}

/** Sync theme-color / status-bar with light vs Soft-night–related night (splash stays light). */
export function syncStudioPwaChrome(appearance: StudioAppearance) {
  const theme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
  if (theme) theme.content = studioThemeColor(appearance)
  const status = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  ) as HTMLMetaElement | null
  if (status) status.content = studioStatusBarStyle(appearance)
}

/** Apply Studio PWA document head; return a cleanup that restores public identity. */
export function mountStudioPwaHead(appearance: StudioAppearance = readStudioAppearance()) {
  const created: HTMLElement[] = []
  const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null
  const prevViewport = viewport?.content ?? PUBLIC_VIEWPORT
  const theme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
  const prevTheme = theme?.content ?? PUBLIC_THEME
  const themeColor = studioThemeColor(appearance)

  if (viewport) viewport.content = STUDIO_VIEWPORT
  else created.push(ensureMeta('viewport', STUDIO_VIEWPORT))

  if (theme) theme.content = themeColor
  else created.push(ensureMeta('theme-color', themeColor))

  const appleCapable = ensureMeta('apple-mobile-web-app-capable', 'yes')
  const appleStatus = ensureMeta(
    'apple-mobile-web-app-status-bar-style',
    studioStatusBarStyle(appearance),
  )
  const appleTitle = ensureMeta('apple-mobile-web-app-title', STUDIO_SHORT_NAME)
  const mobileCapable = ensureMeta('mobile-web-app-capable', 'yes')
  created.push(appleCapable, appleStatus, appleTitle, mobileCapable)

  const manifest = ensureLink('manifest', '/studio/manifest.webmanifest')
  const touchIcon = ensureLink('apple-touch-icon', '/studio/icon-192.png')
  created.push(manifest, touchIcon)

  for (const splash of STUDIO_SPLASHES) {
    created.push(ensureLink('apple-touch-startup-image', splash.href, { media: splash.media }))
  }

  return () => {
    if (viewport) viewport.content = prevViewport
    if (theme) theme.content = prevTheme
    for (const el of created) el.remove()
  }
}

/** Mount Studio PWA head + register the worker for any `/studio` route (including login). */
export function useStudioPwaSurface(appearance: StudioAppearance = readStudioAppearance()) {
  useEffect(() => {
    const cleanup = mountStudioPwaHead(readStudioAppearance())
    void registerStudioWorker()
    return cleanup
  }, [])

  useEffect(() => {
    syncStudioPwaChrome(appearance)
  }, [appearance])
}

export async function registerStudioWorker() {
  if (!('serviceWorker' in navigator)) return null
  const pbUrl = pb.baseUrl.replace(/\/$/, '')
  const reg = await navigator.serviceWorker.register(`/studio/sw.js?pb=${encodeURIComponent(pbUrl)}`, {
    scope: '/studio/',
  })
  return reg
}

export async function unregisterStudioWorker() {
  if (!('serviceWorker' in navigator)) return
  const regs = await navigator.serviceWorker.getRegistrations()
  await Promise.all(
    regs
      .filter((r) => r.scope.includes('/studio'))
      .map((r) => r.unregister()),
  )
}

export function studioInstallCopy() {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) {
    return `On iPhone: open ${STUDIO_PRODUCT_NAME} in Safari, then Share → Add to Home Screen. Phone notices work after that.`
  }
  return `Add ${STUDIO_PRODUCT_NAME} to this phone’s home screen to turn on phone notices.`
}

export function studioLightVibrate(pattern: number | number[] = 12) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* platform may ignore */
  }
}

export async function setStudioAppBadge(count: number) {
  try {
    const nav = navigator as Navigator & {
      setAppBadge?: (n?: number) => Promise<void>
      clearAppBadge?: () => Promise<void>
    }
    if (count > 0) await nav.setAppBadge?.(count)
    else await nav.clearAppBadge?.()
  } catch {
    /* unsupported */
  }
}

export async function subscribeStudioPush() {
  if (!isStudioStandalone()) {
    throw new Error('Add Studio to the home screen first, then allow phone notices from this installed app.')
  }
  const key = studioVapidPublicKey()
  if (!key) {
    throw new Error('Phone notices are not configured on this server (missing VAPID public key).')
  }
  if (!('PushManager' in window)) {
    throw new Error('This browser does not support phone notices.')
  }
  const userId = pb.authStore.record?.id
  if (!userId) {
    throw new Error('Sign in to Studio before allowing phone notices.')
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    })
  }
  const json = sub.toJSON()
  const endpoint = json.endpoint
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth
  if (!endpoint || !p256dh || !auth) {
    throw new Error('Could not create a push subscription.')
  }

  const existing = await pb.collection('push_subscriptions').getList(1, 1, {
    filter: `endpoint="${endpoint.replaceAll('"', '')}"`,
  })
  let secret = existing.items[0]?.device_secret as string | undefined
  if (existing.items[0]) {
    await pb.collection('push_subscriptions').update(existing.items[0].id, {
      p256dh,
      auth,
    })
    secret = existing.items[0].device_secret as string
  } else {
    secret = randomSecret()
    await pb.collection('push_subscriptions').create({
      user: userId,
      endpoint,
      p256dh,
      auth,
      device_secret: secret,
    })
  }
  if (secret) {
    const sw = navigator.serviceWorker.controller || reg.active
    sw?.postMessage({ type: 'ibrahim-push-secret', secret })
  }
}
