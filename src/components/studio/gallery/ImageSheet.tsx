import { useEffect, useState } from 'react'
import { BookOpen, Download, FolderOpen, Globe, MoreHorizontal, Tag, Trash2 } from 'lucide-react'
import { StudioFitPreview } from '@/components/studio/StudioFitPreview'
import { StudioFullscreenModal } from '@/components/studio/StudioFullscreenModal'
import { StudioIcon } from '@/components/studio/StudioIconButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchAsBlob, iosSavesImagesViaShare, saveImageToDevice, shareImageFile } from '@/lib/download'
import {
  mediaLabel,
  mediaOriginalUrl,
  mediaThumbUrl,
  studioDownloadFilename,
  type AlbumRecord,
  type MediaRecord,
  type TagRecord,
  type WorkRecord,
} from '@/lib/library'
import { cn } from '@/lib/utils'

export function ImageSheet({
  item,
  albums,
  works,
  tags,
  deletePrompt,
  onClose,
  onSaveCaption,
  onAddToAlbum,
  onCreateAlbum,
  onAddToWork,
  onCreateWork,
  onToggleTag,
  onCreateTag,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onUseAsCover,
  isCover,
  onRemoveFromHere,
  canOrganize = true,
  lineOnWebsite = false,
  onAddToPortfolio,
  inPortfolio = false,
}: {
  item: MediaRecord
  albums: AlbumRecord[]
  works: WorkRecord[]
  tags: TagRecord[]
  deletePrompt: { id: string; copyCount: number } | null
  onClose: () => void
  onSaveCaption: (caption: string) => Promise<boolean>
  onAddToAlbum: (albumId: string) => void
  onCreateAlbum: (title: string) => void
  onAddToWork: (workId: string) => void
  onCreateWork: (title: string) => void
  onToggleTag: (tagId: string) => void
  onCreateTag: (name: string) => void
  onRequestDelete: () => void
  onConfirmDelete: (mode: 'gallery-only' | 'both') => void
  onCancelDelete: () => void
  onUseAsCover?: () => void
  isCover?: boolean
  onRemoveFromHere?: { label: string; onClick: () => void }
  canOrganize?: boolean
  lineOnWebsite?: boolean
  onAddToPortfolio?: () => void
  inPortfolio?: boolean
}) {
  const [newAlbum, setNewAlbum] = useState('')
  const [newWork, setNewWork] = useState('')
  const [newTag, setNewTag] = useState('')
  const [caption, setCaption] = useState(item.caption ?? '')
  const [nameStatus, setNameStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [more, setMore] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'busy' | 'error'>('idle')
  const [pendingShare, setPendingShare] = useState<File | null>(null)
  const nameDirty = caption.trim() !== (item.caption ?? '').trim()
  const showCaption = canOrganize || lineOnWebsite
  const saveToPhotos = iosSavesImagesViaShare()

  useEffect(() => {
    setCaption(item.caption ?? '')
    setNameStatus('idle')
    setMore(false)
    setDownloadStatus('idle')
    setPendingShare(null)
  }, [item.id, item.caption])

  async function saveName() {
    if (!nameDirty) return
    setNameStatus('saving')
    setNameStatus((await onSaveCaption(caption)) ? 'saved' : 'error')
  }

  async function onDownload() {
    if (downloadStatus === 'busy') return
    setDownloadStatus('busy')
    try {
      if (pendingShare) {
        const status = await shareImageFile(pendingShare)
        if (status === 'done') setPendingShare(null)
        setDownloadStatus('idle')
        return
      }
      const blob = await fetchAsBlob(mediaOriginalUrl(item))
      const result = await saveImageToDevice(blob, studioDownloadFilename(item))
      setPendingShare(result.status === 'needs-gesture' ? result.file : null)
      setDownloadStatus('idle')
    } catch {
      setDownloadStatus('error')
    }
  }

  const memberAlbums = albums.filter((album) => album.images?.includes(item.id))
  const memberWorks = works.filter((work) => work.images?.includes(item.id))

  return (
    <StudioFullscreenModal open title={mediaLabel(item)} onClose={onClose}>
      <StudioFitPreview src={mediaThumbUrl(item, '1200x0')} />

      {showCaption ? (
        <div className="mt-3">
          <Label htmlFor="photo-name" className="text-xs text-studio-muted">
            {lineOnWebsite ? 'Image description' : 'Photo name'}
          </Label>
          <Input
            id="photo-name"
            className="mt-1"
            value={caption}
            placeholder={lineOnWebsite ? 'e.g. Lagos, 2026' : 'e.g. Ada at the garden'}
            onChange={(event) => {
              setCaption(event.target.value)
              setNameStatus('idle')
            }}
            onBlur={() => void saveName()}
          />
          {nameStatus === 'saving' ? (
            <p className="mt-1 text-xs text-studio-muted">Saving…</p>
          ) : nameStatus === 'saved' ? (
            <p role="status" className="mt-1 text-xs text-studio-accent">
              Saved
            </p>
          ) : nameStatus === 'error' ? (
            <p role="alert" className="mt-1 text-xs text-studio-danger">
              Could not save
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={downloadStatus === 'busy'}
          className="inline-flex h-11 items-center gap-1.5 text-sm text-studio-muted hover:text-studio-fg disabled:opacity-60"
          onClick={() => void onDownload()}
        >
          <StudioIcon icon={Download} />
          {downloadStatus === 'busy'
            ? 'Preparing…'
            : pendingShare || saveToPhotos
              ? 'Save to Photos'
              : 'Download'}
        </button>
        {onAddToPortfolio && !inPortfolio ? (
          <button
            type="button"
            className="inline-flex h-11 items-center gap-1.5 text-sm text-studio-muted hover:text-studio-fg"
            onClick={onAddToPortfolio}
          >
            <StudioIcon icon={Globe} />
            Add to Portfolio
          </button>
        ) : null}
        {canOrganize ? (
          <button
            type="button"
            className="inline-flex h-11 items-center gap-1.5 text-sm text-studio-muted hover:text-studio-fg"
            aria-expanded={more}
            onClick={() => setMore((open) => !open)}
          >
            <StudioIcon icon={MoreHorizontal} />
            More
          </button>
        ) : null}
        {onUseAsCover ? (
          <button
            type="button"
            disabled={isCover}
            className="h-11 text-sm text-studio-muted hover:text-studio-fg disabled:opacity-60"
            onClick={onUseAsCover}
          >
            {isCover ? 'Cover photo' : 'Use as cover'}
          </button>
        ) : null}
        {onRemoveFromHere ? (
          <button
            type="button"
            className="h-11 text-sm text-studio-muted hover:text-studio-fg"
            onClick={onRemoveFromHere.onClick}
          >
            {onRemoveFromHere.label}
          </button>
        ) : null}
      </div>
      {downloadStatus === 'error' ? (
        <p role="alert" className="mt-1 text-xs text-studio-danger">
          Could not download. Try again.
        </p>
      ) : pendingShare ? (
        <p className="mt-1 text-xs text-studio-muted">Tap Save to Photos, then Save Image.</p>
      ) : null}

      {canOrganize && more ? (
        <div className="mt-3 space-y-5">
          <section>
            <p className="mb-2 flex items-center gap-1.5 text-xs text-studio-muted">
              <StudioIcon icon={FolderOpen} className="h-3.5 w-3.5" />
              Albums
            </p>
            <div className="space-y-1">
              {albums.map((album) => {
                const inAlbum = album.images?.includes(item.id)
                return (
                  <button
                    key={album.id}
                    type="button"
                    disabled={inAlbum}
                    className="flex w-full items-center justify-between py-1.5 text-left text-sm disabled:opacity-50"
                    onClick={() => onAddToAlbum(album.id)}
                  >
                    <span>{album.title}</span>
                    {inAlbum ? <span className="text-xs text-studio-muted">Already in this album</span> : null}
                  </button>
                )
              })}
              {!albums.length ? <p className="text-xs text-studio-muted">No albums yet.</p> : null}
            </div>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (!newAlbum.trim()) return
                onCreateAlbum(newAlbum.trim())
                setNewAlbum('')
              }}
            >
              <Input
                value={newAlbum}
                onChange={(event) => setNewAlbum(event.target.value)}
                placeholder="e.g. Tunde’s birthday"
                aria-label="New album name"
              />
              <button type="submit" className="shrink-0 text-xs text-studio-accent hover:opacity-80">
                Create
              </button>
            </form>
          </section>

          <section>
            <p className="mb-2 flex items-center gap-1.5 text-xs text-studio-muted">
              <StudioIcon icon={BookOpen} className="h-3.5 w-3.5" />
              Work
            </p>
            <div className="space-y-1">
              {works.map((work) => {
                const inWork = work.images?.includes(item.id)
                return (
                  <button
                    key={work.id}
                    type="button"
                    disabled={inWork}
                    className="flex w-full items-center justify-between py-1.5 text-left text-sm disabled:opacity-50"
                    onClick={() => onAddToWork(work.id)}
                  >
                    <span>{work.title}</span>
                    {inWork ? <span className="text-xs text-studio-muted">Already on this Work</span> : null}
                  </button>
                )
              })}
              {!works.length ? <p className="text-xs text-studio-muted">No Work yet.</p> : null}
            </div>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (!newWork.trim()) return
                onCreateWork(newWork.trim())
                setNewWork('')
              }}
            >
              <Input
                value={newWork}
                onChange={(event) => setNewWork(event.target.value)}
                placeholder="e.g. Ada’s wedding"
                aria-label="New Work name"
              />
              <button type="submit" className="shrink-0 text-xs text-studio-accent hover:opacity-80">
                Create
              </button>
            </form>
          </section>

          <section>
            <p className="mb-2 flex items-center gap-1.5 text-xs text-studio-muted">
              <StudioIcon icon={Tag} className="h-3.5 w-3.5" />
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const on = (item.tags ?? []).includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggleTag(tag.id)}
                    className={cn(
                      'rounded border px-2.5 py-1 text-xs transition',
                      on
                        ? 'border-studio-fg/40 text-studio-fg'
                        : 'border-studio-border/70 text-studio-muted hover:text-studio-fg',
                    )}
                  >
                    {tag.name}
                  </button>
                )
              })}
              {!tags.length ? <p className="text-xs text-studio-muted">No tags yet.</p> : null}
            </div>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (!newTag.trim()) return
                onCreateTag(newTag.trim())
                setNewTag('')
              }}
            >
              <Input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                placeholder="e.g. Wedding"
                aria-label="New tag"
              />
              <button type="submit" className="shrink-0 text-xs text-studio-accent hover:opacity-80">
                Add
              </button>
            </form>
          </section>

          {(memberAlbums.length > 0 || memberWorks.length > 0) && (
            <p className="text-xs text-studio-muted">
              {memberAlbums.length ? `Albums: ${memberAlbums.map((album) => album.title).join(', ')}. ` : ''}
              {memberWorks.length ? `Work: ${memberWorks.map((work) => work.title).join(', ')}.` : ''}
            </p>
          )}

          {deletePrompt ? (
            <div className="space-y-3 border border-studio-border bg-studio-panel p-3 text-sm">
              <p>
                This photo is also in Portfolio. Delete the Gallery photo only, or both?
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <button type="button" className="underline" onClick={() => onConfirmDelete('gallery-only')}>
                  Gallery only
                </button>
                <button
                  type="button"
                  className="text-studio-danger underline"
                  onClick={() => onConfirmDelete('both')}
                >
                  Delete both
                </button>
                <button type="button" className="text-studio-muted underline" onClick={onCancelDelete}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex h-11 items-center gap-1.5 text-xs text-studio-muted hover:text-studio-danger"
              onClick={onRequestDelete}
            >
              <StudioIcon icon={Trash2} className="h-3.5 w-3.5" />
              Delete from Gallery
            </button>
          )}
        </div>
      ) : null}
    </StudioFullscreenModal>
  )
}
