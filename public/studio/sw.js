/* Studio PWA worker. Registered only from /studio. App-shell cache v2. */

const SHELL_CACHE = 'ibrahim-studio-shell-v2'
const PUSH_CACHE = 'ibrahim-studio-push'

const PRECACHE = [
  '/studio/manifest.webmanifest',
  '/studio/icon-192.png',
  '/studio/icon-512.png',
  '/studio/splash-1170x2532.png',
  '/studio/splash-1179x2556.png',
  '/studio/splash-1206x2622.png',
  '/studio/splash-1290x2796.png',
  '/studio/splash-1320x2868.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('ibrahim-studio-shell-') && k !== SHELL_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  )
})

function pbOrigin() {
  try {
    return new URL(self.location.href).searchParams.get('pb') || self.location.origin
  } catch {
    return self.location.origin
  }
}

function isStudioNav(url) {
  const path = url.pathname
  return path === '/studio' || path.startsWith('/studio/')
}

function isApiOrFiles(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/_/')
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  let url
  try {
    url = new URL(req.url)
  } catch {
    return
  }
  if (url.origin !== self.location.origin) return
  if (isApiOrFiles(url)) return
  if (url.pathname === '/studio/sw.js') return

  // Hashed Vite assets: cache-first after first hit
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const hit = await cache.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res.ok) cache.put(req, res.clone())
        return res
      }),
    )
    return
  }

  // Studio navigations: network first, fall back to cached shell document
  if (req.mode === 'navigate' && isStudioNav(url)) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req)
          if (res.ok) {
            const cache = await caches.open(SHELL_CACHE)
            cache.put('/studio/index-shell', res.clone())
          }
          return res
        } catch {
          const cache = await caches.open(SHELL_CACHE)
          const shell = (await cache.match('/studio/index-shell')) || (await cache.match('/index.html'))
          if (shell) return shell
          return new Response('Studio is offline. Reconnect and try again.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        }
      })(),
    )
  }
})

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      const secret = await self.caches
        .open(PUSH_CACHE)
        .then((c) => c.match('secret'))
        .then((r) => (r ? r.text() : ''))
      let title = 'Ibrahim Lens Studio'
      let body = 'New Studio notice'
      let url = '/studio'
      // Prefer encrypted/pending fetch; fall back to push event JSON if present
      try {
        if (event.data) {
          const parsed = event.data.json()
          if (parsed?.title) title = parsed.title
          if (parsed?.body) body = parsed.body
          if (parsed?.url) url = parsed.url
        }
      } catch {
        try {
          const text = event.data?.text()
          if (text) body = text
        } catch {
          /* ignore */
        }
      }
      if (secret) {
        try {
          const res = await fetch(
            `${pbOrigin().replace(/\/$/, '')}/api/ibrahim/push-pending?secret=${encodeURIComponent(secret)}`,
          )
          if (res.ok) {
            const data = await res.json()
            if (data.title) title = data.title
            if (data.body) body = data.body
            if (data.url) url = data.url
          }
        } catch {
          // still show a notice
        }
      }
      await self.registration.showNotification(title, {
        body,
        icon: '/studio/icon-192.png',
        data: { url },
      })
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/studio'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate?.(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== 'ibrahim-push-secret' || !data.secret) return
  event.waitUntil(
    self.caches.open(PUSH_CACHE).then((c) => c.put('secret', new Response(data.secret))),
  )
})
