import { useEffect, useId, useRef, useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { mediaOriginalUrl, mediaThumbUrl, type MediaRecord } from '@/lib/library'
import { DeliveryWordmark } from '@/components/public/DeliveryWordmark'

type Props = {
  images: MediaRecord[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
  altFallback?: string
  fileToken?: string
  watermark?: boolean
}

export function ImageImmersive({
  images,
  index,
  onClose,
  onIndexChange,
  altFallback = 'Image',
  fileToken,
  watermark = false,
}: Props) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const item = images[index]
  const [fullLoaded, setFullLoaded] = useState(false)
  const [fullFailed, setFullFailed] = useState(false)

  useEffect(() => {
    setFullLoaded(false)
    setFullFailed(false)
  }, [item?.id])

  useEffect(() => {
    if (images.length < 2) return
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'ArrowRight') onIndexChange((index + 1) % images.length)
      if (e.key === 'ArrowLeft') onIndexChange((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, index, onIndexChange])

  if (!item) return null

  const alt = item.caption || altFallback

  return (
    <Dialog
      open
      onClose={onClose}
      labelledBy={titleId}
      initialFocusRef={closeRef}
      className="z-[60] flex flex-col bg-[#120f0d]/96 text-[#f3eee6]"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 text-sm text-[#f3eee6]/60">
        <p id={titleId} className="truncate">
          {alt}
          {images.length > 1 ? (
            <span className="ml-3 tabular-nums">
              {index + 1} / {images.length}
            </span>
          ) : null}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="shrink-0 text-[#f3eee6] transition-opacity hover:opacity-70"
        >
          Close
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8">
        {images.length > 1 ? (
          <button
            type="button"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 px-3 py-6 text-[#f3eee6]/55 hover:text-[#f3eee6] sm:left-4"
            aria-label="Previous image"
            onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
          >
            ‹
          </button>
        ) : null}

        {/* The thumbnail is already cached from the grid, so it fills the frame
            immediately instead of leaving a void while the original downloads.

            This box must have a definite height: `max-h-full` on the images below
            is a percentage, and a percentage maximum against an auto-height
            ancestor does not resolve — it silently becomes `none` and the image
            lays out at its natural size, hanging off both edges of the viewport. */}
        <div className="relative flex h-full w-full items-center justify-center">
          {/* `|| fullFailed` matters: if the original ever both loads and errors,
              dropping the thumbnail on `fullLoaded` alone leaves the viewer with
              nothing rendered at all. */}
          {!fullLoaded || fullFailed ? (
            <img
              src={mediaThumbUrl(item, '1200x0', fileToken)}
              // Once the original is out of reach this stands in for it, so it
              // takes over the real description rather than staying decorative.
              alt={fullFailed ? alt : ''}
              aria-hidden={fullFailed ? undefined : true}
              className={
                fullFailed
                  ? 'max-h-full max-w-full object-contain'
                  : 'max-h-full max-w-full object-contain blur-[2px]'
              }
            />
          ) : null}
          {!fullFailed ? (
            <img
              src={mediaOriginalUrl(item, fileToken)}
              alt={alt}
              onLoad={() => setFullLoaded(true)}
              onError={() => setFullFailed(true)}
              className={
                fullLoaded
                  ? 'max-h-full max-w-full object-contain'
                  : 'absolute inset-0 h-full w-full object-contain opacity-0'
              }
            />
          ) : null}
          {watermark ? <DeliveryWordmark /> : null}
        </div>

        {!fullLoaded && !fullFailed ? (
          <p role="status" className="sr-only">
            Loading full-size image
          </p>
        ) : null}

        {images.length > 1 ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 px-3 py-6 text-[#f3eee6]/55 hover:text-[#f3eee6] sm:right-4"
            aria-label="Next image"
            onClick={() => onIndexChange((index + 1) % images.length)}
          >
            ›
          </button>
        ) : null}
      </div>
    </Dialog>
  )
}
