import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { ImageImmersive } from '@/components/public/ImageImmersive'
import { SurfaceProvider } from '@/components/ui/surface'
import { Alert } from '@/components/ui/alert'
import { LoadingAnnouncement, Skeleton } from '@/components/ui/skeleton'
import { publicErrorMessage } from '@/lib/pb-error'
import {
  type DeliveryRecord,
  formatTimeRemaining,
  getDeliveryByToken,
  listDeliveryFiles,
  listDeliveryImages,
  submitDeliveryFeedback,
} from '@/lib/clients'
import { fetchAsBlob, iosSavesImagesViaShare, photographDownloadName, saveBlob, saveImageToDevice, shareImageFile, zipStore } from '@/lib/download'
import { mediaOriginalUrl, mediaThumbUrl, slugify, type MediaRecord } from '@/lib/library'
import { DeliveryWordmark } from '@/components/public/DeliveryWordmark'

export function DeliveryPage() {
  const { token } = useParams()
  const [delivery, setDelivery] = useState<DeliveryRecord | null>(null)
  const [images, setImages] = useState<MediaRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [remaining, setRemaining] = useState('')
  const [immersiveIndex, setImmersiveIndex] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [busyDownload, setBusyDownload] = useState<string | null>(null)
  const [pendingShare, setPendingShare] = useState<{ id: string; file: File } | null>(null)
  const feedbackId = useId()
  const saveToPhotos = iosSavesImagesViaShare()

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    getDeliveryByToken(token)
      .then(async (d) => {
        if (cancelled) return
        setDelivery(d)
        const copies = await listDeliveryFiles(token)
        if (cancelled) return
        if (copies.length) {
          setImages(copies as unknown as MediaRecord[])
        } else {
          const expanded = d.expand?.images
          if (expanded?.length) {
            setImages(expanded)
          } else {
            setImages(await listDeliveryImages(token, d.images ?? []))
          }
        }
      })
      .catch((e) => {
        if (!cancelled) setError(publicErrorMessage(e, 'This delivery link is invalid, expired, or revoked.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!delivery) return
    const tick = () => setRemaining(formatTimeRemaining(delivery.expires_at))
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [delivery])

  const title = useMemo(() => (delivery ? `Gallery for ${delivery.client_name}` : 'Delivery'), [delivery])

  useEffect(() => {
    document.title = `${title} · Ibrahim Lens`
  }, [title])

  async function onDownload(item: MediaRecord, index: number) {
    if (!delivery || busyDownload) return
    setDownloadError(null)
    setBusyDownload(item.id)
    try {
      if (pendingShare?.id === item.id) {
        const status = await shareImageFile(pendingShare.file)
        if (status === 'done') setPendingShare(null)
        return
      }
      const blob = await fetchAsBlob(mediaOriginalUrl(item, delivery.token, { download: true }))
      const result = await saveImageToDevice(blob, photographDownloadName(item.file, index))
      setPendingShare(result.status === 'needs-gesture' ? { id: item.id, file: result.file } : null)
    } catch {
      setDownloadError('Could not download that photograph. Please try again.')
    } finally {
      setBusyDownload(null)
    }
  }

  async function onDownloadAll() {
    if (!delivery || busyDownload || !images.length) return
    if (images.length === 1) {
      await onDownload(images[0], 0)
      return
    }
    setDownloadError(null)
    setBusyDownload('all')
    try {
      const files = await Promise.all(
        images.map(async (item, index) => {
          const blob = await fetchAsBlob(mediaOriginalUrl(item, delivery.token, { download: true }))
          return {
            name: photographDownloadName(item.file, index),
            data: new Uint8Array(await blob.arrayBuffer()),
          }
        }),
      )
      const zipName = `${slugify(delivery.client_name) || 'photographs'}.zip`
      saveBlob(zipStore(files), zipName)
    } catch {
      setDownloadError('Could not prepare the full download. Try a single photograph, or try again.')
    } finally {
      setBusyDownload(null)
    }
  }

  async function onFeedback(e: FormEvent) {
    e.preventDefault()
    if (!delivery || sending) return
    setStatus(null)
    setSendError(null)
    setSending(true)
    try {
      await submitDeliveryFeedback({
        delivery,
        message,
        clientName: delivery.client_name,
      })
      setStatus('Thank you — your feedback was sent.')
      setMessage('')
    } catch (err) {
      setSendError(publicErrorMessage(err, 'Could not send your feedback. Please try again.'))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <SurfaceProvider surface="public">
      <div className="public-shell min-h-screen bg-public-bg px-6 py-10">
        <LoadingAnnouncement label="Loading gallery" />
        <Skeleton tone="public" className="h-10 w-64" />
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="mb-4 break-inside-avoid">
              <Skeleton tone="public" className="aspect-[4/5]" />
            </div>
          ))}
        </div>
      </div>
      </SurfaceProvider>
    )
  }

  if (error || !delivery) {
    return (
      <SurfaceProvider surface="public">
      <div className="public-shell min-h-screen bg-public-bg text-public-fg">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl">Unavailable</h1>
          <p className="street-body mt-4">{error || 'This delivery link is invalid, expired, or revoked.'}</p>
        </section>
      </div>
      </SurfaceProvider>
    )
  }

  return (
    <SurfaceProvider surface="public">
    <div className="public-shell min-h-screen bg-public-bg text-public-fg">
      <a
        href="#delivery-main"
        className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded focus:bg-public-fg focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-public-bg"
      >
        Skip to photographs
      </a>
      <header className="border-b border-public-fg/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-public-muted">Ibrahim Lens · Private delivery</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{delivery.client_name}</h1>
          </div>
          <p className="text-sm text-public-accent/90">{remaining}</p>
        </div>
      </header>

      <main id="delivery-main" tabIndex={-1} className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="street-body max-w-2xl">
            View photographs and download originals. Access ends{' '}
            {new Date(delivery.expires_at).toLocaleString()}.
          </p>
          {images.length ? (
            <button
              type="button"
              onClick={() => void onDownloadAll()}
              disabled={busyDownload !== null}
              className="shrink-0 self-start text-sm text-public-accent hover:text-public-fg disabled:opacity-50"
            >
              {busyDownload === 'all'
                ? 'Preparing…'
                : images.length === 1
                  ? saveToPhotos
                    ? 'Save photograph'
                    : 'Download photograph'
                  : 'Download all'}
            </button>
          ) : null}
        </div>

        {downloadError ? (
          <Alert variant="error" tone="public" className="mb-8">
            {downloadError}
          </Alert>
        ) : null}

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {images.map((item, index) => (
            <figure key={item.id} className="relative mb-4 break-inside-avoid overflow-hidden bg-public-fg/5">
              <button
                type="button"
                className="relative block w-full"
                onClick={() => setImmersiveIndex(index)}
                aria-label={`Open ${item.caption || 'photograph'} full size`}
              >
                <img
                  src={mediaThumbUrl(item, '400x400', token)}
                  alt={item.caption || 'Delivery photograph'}
                  // Deliveries can run to hundreds of frames; eager loading them
                  // all would saturate the client's connection on open.
                  loading={index < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
                <DeliveryWordmark />
              </button>
              <figcaption className="flex items-center justify-end gap-2 px-1 py-3 text-sm">
                <button
                  type="button"
                  onClick={() => void onDownload(item, index)}
                  disabled={busyDownload !== null}
                  className="text-public-accent hover:text-public-fg disabled:opacity-50"
                >
                  {busyDownload === item.id
                    ? 'Preparing…'
                    : pendingShare?.id === item.id || saveToPhotos
                      ? 'Save to Photos'
                      : 'Download original'}
                </button>
              </figcaption>
            </figure>
          ))}
        </div>

        {!images.length ? <p className="text-public-muted">No images in this delivery.</p> : null}

        <form onSubmit={onFeedback} className="mt-20 max-w-xl space-y-5 border-t border-public-fg/10 pt-10">
          <h2 className="font-display text-3xl">Feedback</h2>
          <p className="street-body text-sm">A few words are enough, if you have them.</p>
          <p className="text-xs text-public-muted">Ibrahim may use a line from this as a testimonial.</p>
          <div>
            <label htmlFor={feedbackId} className="mb-1 block text-xs tracking-wide text-public-muted">
              Your note
            </label>
            <textarea
              id={feedbackId}
              className="min-h-28 w-full border-0 border-b border-public-fg/20 bg-transparent px-0 py-2 text-sm outline-none focus:border-public-fg focus-visible:ring-2 focus-visible:ring-public-accent/60"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. I love the outdoor portraits"
            />
          </div>
          {sendError ? (
            <Alert variant="error" tone="public">
              {sendError}
            </Alert>
          ) : null}
          {status ? (
            <Alert variant="success" tone="public">
              {status}
            </Alert>
          ) : null}
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center border-b border-public-fg/80 pb-1 text-sm tracking-[0.18em] uppercase transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      </main>

      {immersiveIndex !== null ? (
        <ImageImmersive
          images={images}
          index={immersiveIndex}
          onClose={() => setImmersiveIndex(null)}
          onIndexChange={setImmersiveIndex}
          altFallback="Delivery image"
          fileToken={token}
          watermark
        />
      ) : null}
    </div>
    </SurfaceProvider>
  )
}
