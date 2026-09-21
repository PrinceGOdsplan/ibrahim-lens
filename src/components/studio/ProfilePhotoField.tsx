import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Camera, ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { StudioIcon } from '@/components/studio/StudioIconButton'
import { ALLOWED_IMAGE_TYPES, getMaxUploadMb } from '@/lib/config'
import { validateImageFile } from '@/lib/library'
import {
  clampOffsets,
  coverScale,
  exportAvatarCrop,
  loadImageFromFile,
  type CropView,
} from '@/lib/avatar-crop'
import { cn } from '@/lib/utils'

const CROP_CSS = 280

type Props = {
  photoUrl: string | null
  busy?: boolean
  onSave: (file: File) => Promise<void>
  onRemove?: () => Promise<void>
}

export function ProfilePhotoField({ photoUrl, busy, onSave, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [source, setSource] = useState<HTMLImageElement | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [view, setView] = useState<CropView | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  function openPicker() {
    setLocalError(null)
    inputRef.current?.click()
  }

  function closeCrop() {
    setCropOpen(false)
    setSource(null)
    setView(null)
    drag.current = null
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      setObjectUrl(null)
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return
    const err = validateImageFile(file)
    if (err) {
      setLocalError(err)
      return
    }
    try {
      const { image, objectUrl: url } = await loadImageFromFile(file)
      setSource(image)
      setObjectUrl(url)
      setView({
        naturalW: image.naturalWidth,
        naturalH: image.naturalHeight,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      })
      setCropOpen(true)
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Could not open that image.')
    }
  }

  const updateView = useCallback((patch: Partial<CropView>) => {
    setView((prev) => {
      if (!prev) return prev
      return clampOffsets({ ...prev, ...patch }, CROP_CSS)
    })
  }, [])

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!view) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, ox: view.offsetX, oy: view.offsetY }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current || !view) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    updateView({ offsetX: drag.current.ox + dx, offsetY: drag.current.oy + dy })
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    drag.current = null
  }

  async function applyCrop() {
    if (!source || !view) return
    setSaving(true)
    setLocalError(null)
    try {
      const file = await exportAvatarCrop(source, view, CROP_CSS, 512)
      await onSave(file)
      closeCrop()
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Could not save photo.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!cropOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) closeCrop()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [cropOpen, saving])

  const preview = (() => {
    if (!source || !view) return null
    const base = coverScale(view.naturalW, view.naturalH, CROP_CSS)
    const scale = base * view.zoom
    const w = view.naturalW * scale
    const h = view.naturalH * scale
    return {
      width: w,
      height: h,
      left: CROP_CSS / 2 - w / 2 + view.offsetX,
      top: CROP_CSS / 2 - h / 2 + view.offsetY,
    }
  })()

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={openPicker}
          disabled={busy || saving}
          className={cn(
            'group relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full',
            'border border-studio-border bg-studio-panel ring-1 ring-studio-border transition-colors',
            'hover:border-studio-fg/40 hover:ring-studio-fg/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-fg',
            'sm:mx-0',
          )}
          aria-label={photoUrl ? 'Change profile photo' : 'Add profile photo'}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-studio-muted">
              <StudioIcon icon={Camera} className="h-7 w-7" />
              <span className="text-[10px] uppercase tracking-[0.12em]">Photo</span>
            </span>
          )}
          <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-studio-fg/50 to-transparent pb-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-studio-bg">
              {photoUrl ? 'Change' : 'Add'}
            </span>
          </span>
        </button>

        <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
          <p className="text-sm font-medium text-studio-fg">Profile photo</p>
          <p className="text-sm text-studio-muted">
            Crop to a circle before it saves. JPEG, PNG, or WebP · max{' '}
            {getMaxUploadMb()}MB.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button type="button" variant="outline" size="sm" disabled={busy || saving} onClick={openPicker}>
              <StudioIcon icon={ImagePlus} className="mr-1.5 h-4 w-4" />
              {photoUrl ? 'Choose new photo' : 'Upload photo'}
            </Button>
            {photoUrl && onRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-studio-danger"
                disabled={busy || saving}
                onClick={() => void onRemove()}
              >
                <StudioIcon icon={Trash2} className="mr-1.5 h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>
          {localError && !cropOpen ? <p className="text-sm text-studio-danger">{localError}</p> : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          void onFile(file)
        }}
      />

      <Dialog
        open={cropOpen}
        onClose={() => {
          if (!saving) closeCrop()
        }}
        label="Crop profile photo"
        className="z-[60] flex items-center justify-center p-4"
      >
        <button
          type="button"
          className="absolute inset-0 bg-studio-scrim"
          aria-label="Dismiss"
          disabled={saving}
          onClick={() => {
            if (!saving) closeCrop()
          }}
        />
        <div className="relative flex w-full max-w-md flex-col border border-studio-border bg-studio-panel text-studio-fg shadow-xl">
          <header className="border-b border-studio-border px-4 py-3">
            <h2 className="font-display text-xl">Crop photo</h2>
            <p className="mt-1 text-sm text-studio-muted">Drag to position. Zoom to frame your face.</p>
          </header>

          <div className="flex flex-col items-center gap-4 px-4 py-5">
            <div
              className="relative touch-none overflow-hidden rounded-full bg-studio-bg ring-1 ring-studio-border"
              style={{ width: CROP_CSS, height: CROP_CSS }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {source && preview && objectUrl ? (
                <img
                  src={objectUrl}
                  alt=""
                  draggable={false}
                  className="absolute max-w-none select-none"
                  style={{
                    width: preview.width,
                    height: preview.height,
                    left: preview.left,
                    top: preview.top,
                  }}
                />
              ) : null}
              <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(26,26,26,0.12)]" />
            </div>

            <label className="flex w-full max-w-[280px] flex-col gap-1.5 text-sm">
              <span className="text-studio-muted">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={view?.zoom ?? 1}
                disabled={!view || saving}
                onChange={(e) => updateView({ zoom: Number(e.target.value) })}
                className="w-full accent-studio-fg"
              />
            </label>

            {localError ? <p className="text-sm text-studio-danger">{localError}</p> : null}
          </div>

          <footer className="flex justify-end gap-2 border-t border-studio-border px-4 py-3">
            <Button type="button" variant="ghost" disabled={saving} onClick={closeCrop}>
              Cancel
            </Button>
            <Button type="button" disabled={saving || !view} onClick={() => void applyCrop()}>
              {saving ? 'Saving…' : 'Save photo'}
            </Button>
          </footer>
        </div>
      </Dialog>
    </div>
  )
}
