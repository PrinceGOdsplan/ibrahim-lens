import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Public routes. Delivery links under /g/ are private and stay out. */
const ROUTES: { path: string; changefreq: string; priority: string }[] = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
  { path: '/about', changefreq: 'yearly', priority: '0.7' },
  { path: '/portfolio', changefreq: 'monthly', priority: '0.9' },
  { path: '/work', changefreq: 'monthly', priority: '0.9' },
  { path: '/contact', changefreq: 'yearly', priority: '0.8' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
]

/**
 * Resolves share-metadata placeholders in index.html and emits robots.txt and
 * sitemap.xml.
 *
 * Uses `{{TOKEN}}` rather than Vite's `%VITE_*%` substitution: that mechanism
 * leaves the literal placeholder in place when a variable is unset, which would
 * ship a broken `og:image` URL. Resolving here gives a valid fallback instead.
 */
function photographerJsonLd(origin: string) {
  return `${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'PhotographBusiness',
    name: 'Ibrahim Lens',
    url: origin,
    address: { '@type': 'PostalAddress', addressCountry: 'NG' },
  })}\n`
}

function siteMetadata(siteUrl: string, ogImage: string): Plugin {
  const origin = siteUrl.replace(/\/$/, '')

  return {
    name: 'ibrahim-lens-site-metadata',
    transformIndexHtml(html) {
      return html.replaceAll('{{SITE_URL}}', origin).replaceAll('{{OG_IMAGE}}', ogImage)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/photographer.jsonld') return next()
        res.setHeader('Content-Type', 'application/ld+json; charset=utf-8')
        res.end(photographerJsonLd(origin))
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'photographer.jsonld',
        source: photographerJsonLd(origin),
      })
      const urls = ROUTES.map(
        ({ path: route, changefreq, priority }) => `  <url>
    <loc>${origin}${route}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
      ).join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
      })

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *
Allow: /

# Client deliveries are private links, not public pages.
Disallow: /g/
Disallow: /studio/
Disallow: /_/

Sitemap: ${origin}/sitemap.xml
`,
      })
    },
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const siteUrl = env.VITE_SITE_URL || 'http://localhost:5173'
  const ogImage = env.VITE_OG_IMAGE || '/og-default.jpg'

  if (command === 'build' && !env.VITE_SITE_URL) {
    // Absolute URLs are baked in at build time, so an unset origin ships a
    // sitemap and share preview that point at localhost.
    console.warn(
      `\n[ibrahim-lens] VITE_SITE_URL is not set — sitemap.xml and og:image will use ${siteUrl}.` +
        '\n               Set it to the deployed origin before publishing.\n',
    )
  }

  return {
    plugins: [react(), tailwindcss(), siteMetadata(siteUrl, ogImage)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      watch: {
        // Seed stills / PB data must not be watched — Windows EBUSY crashes Vite
        ignored: ['**/scripts/seed-assets/**', '**/pb_data/**'],
      },
    },
  }
})
