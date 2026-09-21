import { useId, useState } from 'react'
import { CollectionCreateStrip, CollectionInnerBar, CollectionWall, useCreateOffer } from '@/components/studio/gallery/CollectionSurface'
import type { SortMode } from '@/components/studio/gallery/GalleryToolbar'
import { ThumbWall } from '@/components/studio/gallery/ThumbWall'
import type { PendingPhoto } from '@/components/studio/gallery/pending'
import { StudioFullscreenModal } from '@/components/studio/StudioFullscreenModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { filterCollectionPhotos, mediaThumbUrl, slugify, type MediaRecord, type WorkRecord } from '@/lib/library'

export function WorkView({
  works,
  media,
  pending,
  loaded,
  cols,
  activeWorkId,
  createTick,
  activeId,
  search,
  sort,
  tagFilter,
  websiteFilter,
  setActiveWorkId,
  onOpenMedia,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
  onUpload,
  onRetry,
  onDismissPending,
}: {
  works: WorkRecord[]
  media: MediaRecord[]
  pending: PendingPhoto[]
  loaded: boolean
  cols: number
  activeWorkId: string | null
  createTick: number
  activeId: string | null
  search: string
  sort: SortMode
  tagFilter: string
  websiteFilter: '' | 'site' | 'private'
  setActiveWorkId: (id: string | null) => void
  onOpenMedia: (id: string) => void
  onCreate: (title: string) => void
  onUpdate: (
    id: string,
    data: Partial<{
      title: string
      slug: string
      description: string
      story_body: string
      story_client: string
      story_location: string
      story_shot_at: string
      show_on_website: boolean
      cover: string
    }>,
  ) => void
  onDelete: (id: string) => void
  onReorder: (ids: string[]) => void
  onUpload: () => void
  onRetry: (id: string) => void
  onDismissPending: (id: string) => void
}) {
  const [creating, setCreating] = useCreateOffer(createTick)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const active = works.find((work) => work.id === activeWorkId) ?? null
  const q = search.trim().toLowerCase()
  const listed = works
    .filter((work) => {
      if (websiteFilter === 'site' && !work.show_on_website) return false
      if (websiteFilter === 'private' && work.show_on_website) return false
      if (!q) return true
      const hay = [work.title, work.description, work.story_client, work.story_location, work.slug]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
    .sort((a, b) =>
      sort === 'name' ? a.title.localeCompare(b.title) : (b.created || '').localeCompare(a.created || ''),
    )
  const photos = filterCollectionPhotos(
    (active?.images ?? [])
      .map((id) => media.find((item) => item.id === id))
      .filter((item): item is MediaRecord => Boolean(item)),
    { q: search, tagId: tagFilter, sort },
  )
  const coverId = active?.cover || active?.images?.[0] || undefined

  function move(id: string, direction: -1 | 1) {
    const ids = works.map((work) => work.id)
    const index = ids.indexOf(id)
    const next = index + direction
    if (index < 0 || next < 0 || next >= ids.length) return
    ;[ids[index], ids[next]] = [ids[next], ids[index]]
    onReorder(ids)
  }

  if (!active) {
    return (
      <div>
        <CollectionCreateStrip
          open={creating}
          label="Name"
          placeholder="e.g. Ada’s wedding"
          onCreate={(title) => {
            onCreate(title)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
        <CollectionWall
          loaded={loaded}
          cols={cols}
          emptyTitle={q || websiteFilter ? `Nothing matches “${search.trim() || 'this filter'}”.` : 'No Work yet.'}
          onAdd={() => setCreating(true)}
          onOpen={setActiveWorkId}
          onMove={move}
          items={listed.map((work) => {
            const coverMediaId = work.cover || work.images?.[0]
            const cover =
              (work.expand?.cover as MediaRecord | undefined) ||
              (coverMediaId ? media.find((item) => item.id === coverMediaId) : null) ||
              ((work.expand?.images as MediaRecord[] | undefined)?.[0] ?? null)
            return {
              id: work.id,
              title: work.title,
              hint: work.show_on_website ? 'On the website' : 'Private',
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
        backLabel="Work"
        onBack={() => {
          setDetailsOpen(false)
          setActiveWorkId(null)
        }}
        name={active.title}
        onRename={(title) => onUpdate(active.id, { title, slug: slugify(title) || active.slug })}
        trailing={
          <div className="flex items-center gap-3">
            <label className="flex h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!active.show_on_website}
                onChange={(event) => onUpdate(active.id, { show_on_website: event.target.checked })}
              />
              On the website
            </label>
            <button
              type="button"
              className="h-11 text-sm text-studio-muted hover:text-studio-fg"
              onClick={() => setDetailsOpen(true)}
            >
              Details
            </button>
          </div>
        }
      />
      <ThumbWall
        items={photos}
        pending={pending}
        cols={cols}
        activeId={activeId}
        loaded
        emptyTitle={
          search.trim() || tagFilter ? `Nothing matches “${search.trim() || 'this filter'}”.` : 'No photos on this Work yet.'
        }
        hasMore={false}
        loadingMore={false}
        coverId={coverId}
        onOpen={onOpenMedia}
        onNearEnd={() => undefined}
        onAdd={onUpload}
        onRetry={onRetry}
        onDismissPending={onDismissPending}
      />
      {detailsOpen ? (
        <WorkDetails
          work={active}
          onClose={() => setDetailsOpen(false)}
          onUpdate={onUpdate}
          onDelete={() => {
            setDetailsOpen(false)
            onDelete(active.id)
          }}
        />
      ) : null}
    </div>
  )
}

function WorkDetails({
  work,
  onClose,
  onUpdate,
  onDelete,
}: {
  work: WorkRecord
  onClose: () => void
  onUpdate: (
    id: string,
    data: Partial<{
      title: string
      slug: string
      description: string
      story_body: string
      story_client: string
      story_location: string
      story_shot_at: string
      show_on_website: boolean
      cover: string
    }>,
  ) => void
  onDelete: () => void
}) {
  const fieldId = useId()

  return (
    <StudioFullscreenModal open title="Work details" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <Label htmlFor={`${fieldId}-slug`} className="text-xs text-studio-muted">
            Page address
          </Label>
          <Input
            id={`${fieldId}-slug`}
            className="mt-1"
            key={`${work.id}-slug`}
            defaultValue={work.slug}
            onBlur={(event) => {
              const slug = slugify(event.target.value)
              if (slug && slug !== work.slug) onUpdate(work.id, { slug })
            }}
          />
        </div>
        <div>
          <Label htmlFor={`${fieldId}-desc`} className="text-xs text-studio-muted">
            Short description
          </Label>
          <Input
            id={`${fieldId}-desc`}
            className="mt-1"
            key={`${work.id}-desc`}
            defaultValue={work.description ?? ''}
            placeholder="e.g. Portraits from the garden session"
            onBlur={(event) => onUpdate(work.id, { description: event.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${fieldId}-body`} className="text-xs text-studio-muted">
            About this Work
          </Label>
          <Textarea
            id={`${fieldId}-body`}
            key={`${work.id}-body`}
            className="mt-1 min-h-28"
            defaultValue={work.story_body ?? ''}
            placeholder="e.g. Ada and Tunde, Lagos, December"
            onBlur={(event) => onUpdate(work.id, { story_body: event.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor={`${fieldId}-client`} className="text-xs text-studio-muted">
              Client
            </Label>
            <Input
              id={`${fieldId}-client`}
              className="mt-1"
              key={`${work.id}-client`}
              defaultValue={work.story_client ?? ''}
              placeholder="e.g. Ada and Tunde"
              onBlur={(event) => onUpdate(work.id, { story_client: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor={`${fieldId}-loc`} className="text-xs text-studio-muted">
              Where it was shot
            </Label>
            <Input
              id={`${fieldId}-loc`}
              className="mt-1"
              key={`${work.id}-loc`}
              defaultValue={work.story_location ?? ''}
              placeholder="e.g. Lagos"
              onBlur={(event) => onUpdate(work.id, { story_location: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor={`${fieldId}-shot`} className="text-xs text-studio-muted">
              Date of the shoot
            </Label>
            <Input
              id={`${fieldId}-shot`}
              className="mt-1"
              key={`${work.id}-shot`}
              type="date"
              defaultValue={(work.story_shot_at ?? '').slice(0, 10)}
              onBlur={(event) => onUpdate(work.id, { story_shot_at: event.target.value })}
            />
          </div>
        </div>
        <button type="button" className="h-11 text-sm text-studio-danger hover:opacity-80" onClick={onDelete}>
          Delete Work
        </button>
      </div>
    </StudioFullscreenModal>
  )
}
