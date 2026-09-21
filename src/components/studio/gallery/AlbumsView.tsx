import { CollectionCreateStrip, CollectionInnerBar, CollectionWall, useCreateOffer } from '@/components/studio/gallery/CollectionSurface'
import { ThumbWall } from '@/components/studio/gallery/ThumbWall'
import type { PendingPhoto } from '@/components/studio/gallery/pending'
import type { SortMode } from '@/components/studio/gallery/GalleryToolbar'
import { filterCollectionPhotos, mediaThumbUrl, type AlbumRecord, type MediaRecord } from '@/lib/library'

export function AlbumsView({
  albums,
  media,
  pending,
  loaded,
  cols,
  activeAlbumId,
  createTick,
  activeId,
  search,
  sort,
  tagFilter,
  setActiveAlbumId,
  onOpenMedia,
  onCreate,
  onRename,
  onDelete,
  onUpload,
  onRetry,
  onDismissPending,
}: {
  albums: AlbumRecord[]
  media: MediaRecord[]
  pending: PendingPhoto[]
  loaded: boolean
  cols: number
  activeAlbumId: string | null
  createTick: number
  activeId: string | null
  search: string
  sort: SortMode
  tagFilter: string
  setActiveAlbumId: (id: string | null) => void
  onOpenMedia: (id: string) => void
  onCreate: (title: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
  onUpload: () => void
  onRetry: (id: string) => void
  onDismissPending: (id: string) => void
}) {
  const [creating, setCreating] = useCreateOffer(createTick)
  const active = albums.find((album) => album.id === activeAlbumId) ?? null
  const q = search.trim().toLowerCase()
  const listed = albums
    .filter((album) => !q || album.title.toLowerCase().includes(q))
    .sort((a, b) =>
      sort === 'name'
        ? a.title.localeCompare(b.title)
        : (b.created || '').localeCompare(a.created || ''),
    )
  const photos = filterCollectionPhotos(
    (active?.images ?? [])
      .map((id) => media.find((item) => item.id === id))
      .filter((item): item is MediaRecord => Boolean(item)),
    { q: search, tagId: tagFilter, sort },
  )

  if (!active) {
    return (
      <div>
        <CollectionCreateStrip
          open={creating}
          label="Album name"
          placeholder="e.g. Tunde’s birthday"
          onCreate={(title) => {
            onCreate(title)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
        <CollectionWall
          loaded={loaded}
          cols={cols}
          emptyTitle={q ? `Nothing matches “${search.trim()}”.` : 'No albums yet.'}
          onAdd={() => setCreating(true)}
          onOpen={setActiveAlbumId}
          items={listed.map((album) => {
            const firstId = album.images?.[0]
            const cover = firstId ? media.find((item) => item.id === firstId) : null
            return {
              id: album.id,
              title: album.title,
              coverUrl: cover ? mediaThumbUrl(cover, '400x400') : undefined,
            }
          })}
        />
      </div>
    )
  }

  return (
    <div>
      <CollectionInnerBar
        backLabel="Albums"
        onBack={() => setActiveAlbumId(null)}
        name={active.title}
        onRename={(title) => onRename(active.id, title)}
        trailing={
          <button
            type="button"
            className="h-11 text-sm text-studio-danger hover:opacity-80"
            onClick={() => onDelete(active.id)}
          >
            Delete
          </button>
        }
      />
      <ThumbWall
        items={photos}
        pending={pending}
        cols={cols}
        activeId={activeId}
        loaded
        emptyTitle={
          search.trim() || tagFilter ? `Nothing matches “${search.trim() || 'this filter'}”.` : 'No photos in this album yet.'
        }
        hasMore={false}
        loadingMore={false}
        onOpen={onOpenMedia}
        onNearEnd={() => undefined}
        onAdd={onUpload}
        onRetry={onRetry}
        onDismissPending={onDismissPending}
      />
    </div>
  )
}
