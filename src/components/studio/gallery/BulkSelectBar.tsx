import { useState } from 'react'
import { Download, FolderOpen, Globe, Tag, Trash2, X } from 'lucide-react'
import { StudioFullscreenModal } from '@/components/studio/StudioFullscreenModal'
import { StudioTextIconButton } from '@/components/studio/StudioIconButton'
import { Input } from '@/components/ui/input'
import type { AlbumRecord, TagRecord } from '@/lib/library'
import { cn } from '@/lib/utils'

type Props = {
  count: number
  albums: AlbumRecord[]
  tags: TagRecord[]
  downloadBusy?: boolean
  showAddToPortfolio?: boolean
  onClear: () => void
  onAddToAlbum: (albumId: string) => void
  onCreateAlbum: (title: string) => void
  onTag: (tagId: string) => void
  onCreateTag: (name: string) => void
  onDownload: () => void
  onAddToPortfolio?: () => void
  onDelete: () => void
}

export function BulkSelectBar({
  count,
  albums,
  tags,
  onClear,
  onAddToAlbum,
  onCreateAlbum,
  onTag,
  onCreateTag,
  downloadBusy,
  showAddToPortfolio,
  onDownload,
  onAddToPortfolio,
  onDelete,
}: Props) {
  const [picker, setPicker] = useState<null | 'album' | 'tag'>(null)
  const [newAlbum, setNewAlbum] = useState('')
  const [newTag, setNewTag] = useState('')

  if (!count) return null

  return (
    <>
      <div className="sticky bottom-0 z-20 border-t border-studio-border bg-studio-bg/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs text-studio-muted">{count} selected</span>
          <StudioTextIconButton
            label={downloadBusy ? 'Downloading…' : 'Download'}
            icon={Download}
            disabled={downloadBusy}
            onClick={onDownload}
            className="text-studio-muted"
          />
          {showAddToPortfolio && onAddToPortfolio ? (
            <StudioTextIconButton
              label="Add to Portfolio"
              icon={Globe}
              onClick={onAddToPortfolio}
              className="text-studio-muted"
            />
          ) : null}
          <StudioTextIconButton
            label="Add to album"
            icon={FolderOpen}
            onClick={() => setPicker('album')}
            className="text-studio-muted"
          />
          <StudioTextIconButton label="Tag" icon={Tag} onClick={() => setPicker('tag')} className="text-studio-muted" />
          <StudioTextIconButton
            label="Delete"
            icon={Trash2}
            onClick={onDelete}
            className="text-studio-danger hover:opacity-80"
          />
          <StudioTextIconButton label="Clear" icon={X} onClick={onClear} className="ml-auto text-studio-muted" />
        </div>
      </div>

      {picker === 'album' ? (
        <StudioFullscreenModal open title="Add to album" onClose={() => setPicker(null)}>
          <div className="space-y-1">
            {albums.map((album) => (
              <button
                key={album.id}
                type="button"
                className="flex w-full py-2 text-left text-sm hover:text-studio-accent"
                onClick={() => {
                  onAddToAlbum(album.id)
                  setPicker(null)
                }}
              >
                {album.title}
              </button>
            ))}
            {!albums.length ? <p className="text-xs text-studio-muted">No albums yet.</p> : null}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!newAlbum.trim()) return
              onCreateAlbum(newAlbum.trim())
              setNewAlbum('')
              setPicker(null)
            }}
          >
            <Input
              value={newAlbum}
              onChange={(event) => setNewAlbum(event.target.value)}
              placeholder="New album name"
              aria-label="New album name"
            />
            <button type="submit" className="shrink-0 text-xs text-studio-accent hover:opacity-80">
              Create
            </button>
          </form>
        </StudioFullscreenModal>
      ) : null}

      {picker === 'tag' ? (
        <StudioFullscreenModal open title="Add tag" onClose={() => setPicker(null)}>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={cn(
                  'rounded border border-studio-border/70 px-2.5 py-1 text-xs text-studio-muted hover:text-studio-fg',
                )}
                onClick={() => {
                  onTag(tag.id)
                  setPicker(null)
                }}
              >
                {tag.name}
              </button>
            ))}
            {!tags.length ? <p className="text-xs text-studio-muted">No tags yet.</p> : null}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!newTag.trim()) return
              onCreateTag(newTag.trim())
              setNewTag('')
              setPicker(null)
            }}
          >
            <Input
              value={newTag}
              onChange={(event) => setNewTag(event.target.value)}
              placeholder="New tag name"
              aria-label="New tag name"
            />
            <button type="submit" className="shrink-0 text-xs text-studio-accent hover:opacity-80">
              Add
            </button>
          </form>
        </StudioFullscreenModal>
      ) : null}
    </>
  )
}
