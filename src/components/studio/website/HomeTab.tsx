import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StudioFullscreenModal } from '@/components/studio/StudioFullscreenModal'
import { StudioImageGallery } from '@/components/studio/StudioImageGallery'
import { SectionSaveBar, StudioActionMenu, StudioMenu, quietTextareaClass, studioRowActive, studioRowBadge, useSectionSave } from '@/components/studio/StudioSection'
import { OpenPublicPageLink } from '@/components/studio/website/shared'
import {
  mediaThumbUrl,
  setPortfolioMembership,
  updateMediaCaption,
  uploadMedia,
  type MediaRecord,
  type WorkRecord,
} from '@/lib/library'
import {
  DEFAULT_LANES,
  MAX_HOME_FEATURED,
  MAX_HOME_LANES,
  MAX_HOME_WORK_PICKS,
  emptyLane,
  lanesHeadline,
  parseLanes,
  type LaneDef,
  type WebsiteGlobals,
  type WebsiteGlobalsPatch,
} from '@/lib/website'
import { cn } from '@/lib/utils'
import { Alert } from '@/components/ui/alert'
import { pbErrorMessage } from '@/lib/pb-error'

const uploadFailure = (err: unknown) => pbErrorMessage(err, 'Could not upload that photo.')

function AddThumbMenu({ onPick, onUpload }: { onPick: () => void; onUpload: () => void }) {
  return (
    <StudioMenu
      label="Add photo"
      align="left"
      items={[
        { label: 'Pick', onClick: onPick },
        { label: 'Upload', onClick: onUpload },
      ]}
      trigger={
        <span className="flex h-14 w-14 items-center justify-center rounded border border-dashed border-studio-border/80 text-lg text-studio-muted hover:border-studio-fg hover:text-studio-fg">
          +
        </span>
      }
    />
  )
}

type Props = {
  globals: WebsiteGlobals
  portfolio: MediaRecord[]
  allMedia: MediaRecord[]
  websiteWork: WorkRecord[]
  busy: boolean
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
  onRefresh: () => Promise<void>
}

type Editor = 'featured' | 'services' | 'work' | 'strip' | 'tease' | null

function workThumb(work: WorkRecord) {
  const cover = work.expand?.cover as MediaRecord | MediaRecord[] | undefined
  const first = Array.isArray(cover) ? cover[0] : cover
  if (first?.file) return mediaThumbUrl(first, '200x200')
  const images = work.expand?.images as MediaRecord[] | undefined
  if (images?.[0]?.file) return mediaThumbUrl(images[0], '200x200')
  return ''
}

export function HomeTab({ globals, portfolio, allMedia, websiteWork, busy, onSave, onRefresh }: Props) {
  const [editor, setEditor] = useState<Editor>(null)
  const [galleryFor, setGalleryFor] = useState<'strip' | null>(null)
  const [localLanes, setLocalLanes] = useState<LaneDef[] | null>(null)

  const featured = (globals.home_featured ?? []).slice(0, MAX_HOME_FEATURED)
  const homeWork = globals.home_work ?? []
  const atmosphereMode = globals.atmosphere_mode === 'manual' ? 'manual' : 'auto'
  const atmosphereIds = globals.atmosphere_ids ?? []
  const lanes = localLanes ?? parseLanes(globals.home_lanes)
  const byId = useMemo(() => {
    const map = new Map<string, MediaRecord>()
    for (const m of allMedia) map.set(m.id, m)
    for (const m of portfolio) map.set(m.id, m)
    return map
  }, [allMedia, portfolio])

  function openServices() {
    setLocalLanes(parseLanes(globals.home_lanes))
    setEditor('services')
  }

  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <OpenPublicPageLink href="/" label="Open Home" />
      </div>

      <ul className="divide-y divide-studio-border border-y border-studio-border text-sm">
        {(
          [
            {
              key: 'featured' as const,
              label: 'Hero slideshow',
              hint: featured.length ? `${featured.length} photos` : 'Not set',
              thumb: featured[0] ? byId.get(featured[0]) : undefined,
              run: () => setEditor('featured'),
            },
            {
              key: 'services' as const,
              label: 'Booked for',
              hint: lanesHeadline(globals.home_lanes_headline),
              thumb: lanes[0]?.image_id ? byId.get(lanes[0].image_id) : undefined,
              run: openServices,
            },
            {
              key: 'work' as const,
              label: 'Work',
              hint: homeWork.length ? `${homeWork.length} on Home` : 'None on Home',
              thumb: undefined,
              run: () => setEditor('work'),
            },
            {
              key: 'strip' as const,
              label: 'Atmosphere',
              hint:
                atmosphereMode === 'auto'
                  ? 'Auto from Portfolio'
                  : atmosphereIds.length
                    ? `${atmosphereIds.length} photos`
                    : 'Not set',
              thumb: atmosphereIds[0] ? byId.get(atmosphereIds[0]) : undefined,
              run: () => setEditor('strip'),
            },
            {
              key: 'tease' as const,
              label: 'About tease',
              hint: (globals.about_tease_headline ?? '').trim() || 'Less talk. More visuals.',
              thumb: undefined,
              run: () => setEditor('tease'),
            },
          ] as const
        ).map((row) => (
          <li key={row.key}>
            <button
              type="button"
              disabled={busy}
              onClick={row.run}
              className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-studio-panel/50 disabled:opacity-50"
            >
              <span className="flex min-w-0 items-center gap-3">
                {row.thumb?.file ? (
                  <img src={mediaThumbUrl(row.thumb, '200x200')} alt="" className="h-10 w-10 shrink-0 object-cover" />
                ) : (
                  <span className="h-10 w-10 shrink-0 bg-studio-border/60" aria-hidden />
                )}
                <span className="min-w-0">
                  <span className="block text-studio-fg">{row.label}</span>
                  <span className="block truncate text-xs text-studio-muted">{row.hint}</span>
                </span>
              </span>
              <span className="text-xs text-studio-muted">Edit</span>
            </button>
          </li>
        ))}
      </ul>

      <FeaturedEditor
        open={editor === 'featured'}
        featured={featured}
        portfolio={portfolio}
        byId={byId}
        onClose={() => setEditor(null)}
        onSave={onSave}
        onRefresh={onRefresh}
      />

      <ServicesEditor
        open={editor === 'services'}
        lanes={lanes}
        headline={globals.home_lanes_headline ?? ''}
        portfolio={portfolio}
        byId={byId}
        onClose={() => {
          setEditor(null)
          setLocalLanes(null)
        }}
        onSave={onSave}
        onRefresh={onRefresh}
      />

      <WorksEditor
        open={editor === 'work'}
        homeWork={homeWork}
        websiteWork={websiteWork}
        onClose={() => setEditor(null)}
        onSave={onSave}
      />

      <StripEditor
        open={editor === 'strip'}
        atmosphereMode={atmosphereMode}
        atmosphereIds={atmosphereIds}
        byId={byId}
        onClose={() => setEditor(null)}
        onSave={onSave}
        onPick={() => setGalleryFor('strip')}
      />

      <TeaseEditor
        open={editor === 'tease'}
        globals={globals}
        onClose={() => setEditor(null)}
        onSave={onSave}
      />

      <StudioImageGallery
        open={galleryFor === 'strip'}
        title="Pick Atmosphere photos"
        images={portfolio}
        selected={atmosphereIds}
        portfolioOnlyDefault
        onClose={() => setGalleryFor(null)}
        onDone={async (ids) => {
          setGalleryFor(null)
          await onSave({ atmosphere_mode: 'manual', atmosphere_ids: ids })
        }}
      />
    </section>
  )
}

function FeaturedEditor({
  open,
  featured,
  portfolio,
  byId,
  onClose,
  onSave,
  onRefresh,
}: {
  open: boolean
  featured: string[]
  portfolio: MediaRecord[]
  byId: Map<string, MediaRecord>
  onClose: () => void
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
  onRefresh: () => Promise<void>
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [ids, setIds] = useState(featured)
  const [captions, setCaptions] = useState<Record<string, string>>({})
  const [active, setActive] = useState<number | null>(null)
  const [pickMode, setPickMode] = useState<'add' | number | null>(null)
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})
  const addFileRef = useRef<HTMLInputElement | null>(null)
  const baseline = useRef({ ids: featured.join(','), captions: '' })
  const wasOpen = useRef(false)

  useEffect(() => {
    if (!open) {
      wasOpen.current = false
      return
    }
    if (wasOpen.current) return
    wasOpen.current = true
    setIds(featured)
    const next: Record<string, string> = {}
    for (const id of featured) next[id] = byId.get(id)?.caption ?? ''
    setCaptions(next)
    setActive(null)
    setPickMode(null)
    baseline.current = {
      ids: featured.join(','),
      captions: featured.map((id) => `${id}:${byId.get(id)?.caption ?? ''}`).join('|'),
    }
    reset()
  }, [open, featured, byId, reset])

  const dirty =
    ids.join(',') !== baseline.current.ids ||
    ids.map((id) => `${id}:${captions[id] ?? ''}`).join('|') !== baseline.current.captions

  const [uploadError, setUploadError] = useState<string | null>(null)

  async function uploadAt(index: number | 'add', file: File) {
    setUploadError(null)
    const created = await uploadMedia(file)
    await setPortfolioMembership(created.id, true)
    if (index === 'add') {
      setIds((prev) => {
        const next = [...prev, created.id].slice(0, MAX_HOME_FEATURED)
        setActive(next.length - 1)
        return next
      })
      setCaptions((c) => ({ ...c, [created.id]: '' }))
    } else {
      setIds((prev) => {
        const next = [...prev]
        next[index] = created.id
        return next
      })
      setCaptions((c) => ({ ...c, [created.id]: '' }))
      setActive(index)
    }
    await onRefresh()
  }

  const activeId = active != null ? ids[active] : null

  return (
    <>
      <StudioFullscreenModal
        open={open}
        title="Featured"
        onClose={onClose}
        dirty={dirty}
        footer={
          <SectionSaveBar
            status={status}
            error={error}
            dirty={dirty}
            onSave={() =>
              runSave(async () => {
                const next = ids.slice(0, MAX_HOME_FEATURED)
                await onSave({ home_featured: next })
                await Promise.all(next.map((id) => updateMediaCaption(id, captions[id] ?? '')))
                try {
                  await onRefresh()
                } catch {
                  /* writes already landed */
                }
                onClose()
              })
            }
          />
        }
      >
        {uploadError ? (
          <Alert variant="error" className="mb-3 text-xs">
            {uploadError}
          </Alert>
        ) : null}
        <ul className="divide-y divide-studio-border/50">
          {ids.map((id, index) => {
            const img = byId.get(id)
            const caption = (captions[id] ?? '').trim() || 'No caption'
            return (
              <li key={`${id}-${index}`}>
                <button
                  type="button"
                  onClick={() => setActive((a) => (a === index ? null : index))}
                  className={studioRowActive(active === index)}
                >
                  {img ? (
                    <img src={mediaThumbUrl(img, '200x200')} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-dashed border-studio-border/70 text-[10px] text-studio-muted">
                      —
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm">{caption}</span>
                  {studioRowBadge(active === index)}
                </button>
              </li>
            )
          })}
        </ul>
        {ids.length < MAX_HOME_FEATURED ? (
          <div className="mt-2 flex items-center gap-2">
            <AddThumbMenu
              onPick={() => setPickMode('add')}
              onUpload={() => addFileRef.current?.click()}
            />
            <span className="text-xs text-studio-muted">Add photo</span>
          </div>
        ) : null}
        <input
          ref={addFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) uploadAt('add', file).catch((err) => setUploadError(uploadFailure(err)))
          }}
        />

        {active != null && activeId ? (
          <div className="mt-4 space-y-2 border-t border-studio-border/50 pt-3">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 flex-1 truncate text-xs text-studio-muted">
                {(captions[activeId] ?? '').trim() || `Photo ${active + 1}`}
              </p>
              <StudioActionMenu
                items={[
                  { label: 'Pick', onClick: () => setPickMode(active) },
                  { label: 'Upload', onClick: () => fileRefs.current[active]?.click() },
                  {
                    label: 'Remove',
                    danger: true,
                    onClick: () => {
                      setIds((prev) => prev.filter((_, i) => i !== active))
                      setActive(null)
                    },
                  },
                ]}
              />
              <input
                ref={(el) => {
                  fileRefs.current[active] = el
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) uploadAt(active, file).catch((err) => setUploadError(uploadFailure(err)))
                }}
              />
            </div>
            <Label className="text-xs text-studio-muted">Caption</Label>
            <Input
              value={captions[activeId] ?? ''}
              onChange={(e) => setCaptions((c) => ({ ...c, [activeId]: e.target.value }))}
              placeholder="e.g. Evening light in Yaba"
              autoFocus
            />
          </div>
        ) : null}
      </StudioFullscreenModal>
      <StudioImageGallery
        open={pickMode === 'add'}
        title="Add Featured photo"
        images={portfolio}
        selected={[]}
        max={1}
        portfolioOnlyDefault
        onClose={() => setPickMode(null)}
        onDone={(picked) => {
          const id = picked[0]
          setPickMode(null)
          if (!id || ids.includes(id) || ids.length >= MAX_HOME_FEATURED) return
          setIds((prev) => {
            const next = [...prev, id]
            setActive(next.length - 1)
            return next
          })
          setCaptions((c) => ({ ...c, [id]: byId.get(id)?.caption ?? '' }))
        }}
      />
      {typeof pickMode === 'number' ? (
        <StudioImageGallery
          open
          title="Replace Featured photo"
          images={portfolio}
          selected={ids[pickMode] ? [ids[pickMode]] : []}
          max={1}
          portfolioOnlyDefault
          onClose={() => setPickMode(null)}
          onDone={(picked) => {
            const id = picked[0]
            const index = pickMode
            setPickMode(null)
            if (!id) return
            setIds((prev) => {
              const next = [...prev]
              next[index] = id
              return next
            })
            setCaptions((c) => ({ ...c, [id]: byId.get(id)?.caption ?? c[id] ?? '' }))
            setActive(index)
          }}
        />
      ) : null}
    </>
  )
}

function ServicesEditor({
  open,
  lanes,
  headline,
  portfolio,
  byId,
  onClose,
  onSave,
  onRefresh,
}: {
  open: boolean
  lanes: LaneDef[]
  headline: string
  portfolio: MediaRecord[]
  byId: Map<string, MediaRecord>
  onClose: () => void
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
  onRefresh: () => Promise<void>
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [draft, setDraft] = useState(lanes)
  const [headlineDraft, setHeadlineDraft] = useState(headline)
  const [active, setActive] = useState<number | null>(null)
  const [pickMode, setPickMode] = useState<'add' | number | null>(null)
  const addFileRef = useRef<HTMLInputElement | null>(null)
  const replaceFileRef = useRef<HTMLInputElement | null>(null)
  const baseline = useRef('')
  const wasOpen = useRef(false)

  useEffect(() => {
    if (!open) {
      wasOpen.current = false
      return
    }
    if (wasOpen.current) return
    wasOpen.current = true
    setDraft(lanes)
    setHeadlineDraft(headline)
    setActive(null)
    setPickMode(null)
    baseline.current = JSON.stringify({ lanes, headline })
    reset()
  }, [open, lanes, headline, reset])

  const dirty = JSON.stringify({ lanes: draft, headline: headlineDraft }) !== baseline.current
  const [uploadError, setUploadError] = useState<string | null>(null)

  function patch(index: number, partial: Partial<LaneDef>) {
    setDraft((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...partial }
      return next
    })
  }

  function appendWithImage(imageId: string) {
    if (draft.length >= MAX_HOME_LANES) return
    const next = [...draft, { ...emptyLane(draft.length), image_id: imageId }]
    setDraft(next)
    setActive(next.length - 1)
  }

  async function uploadNew(file: File) {
    setUploadError(null)
    const created = await uploadMedia(file)
    await setPortfolioMembership(created.id, true)
    appendWithImage(created.id)
    await onRefresh()
  }

  async function uploadReplace(index: number, file: File) {
    setUploadError(null)
    const created = await uploadMedia(file)
    await setPortfolioMembership(created.id, true)
    patch(index, { image_id: created.id })
    setActive(index)
    await onRefresh()
  }

  const lane = active != null ? draft[active] : null

  return (
    <>
      <StudioFullscreenModal
        open={open}
        title="Services"
        onClose={onClose}
        dirty={dirty}
        footer={
          <SectionSaveBar
            status={status}
            error={error}
            dirty={dirty}
            onSave={() =>
              runSave(async () => {
                await onSave({ home_lanes: draft, home_lanes_headline: headlineDraft.trim() })
                onClose()
              })
            }
          />
        }
      >
        <p className="mb-3 text-xs text-studio-muted">
          Home “Booked for” cards — up to {MAX_HOME_LANES}. Add starts with a photo, then title and text.
        </p>
        <div className="mb-4">
          <Label className="text-xs text-studio-muted">Section headline</Label>
          <Input
            className="mt-1"
            value={headlineDraft}
            placeholder="e.g. Booked for"
            onChange={(e) => setHeadlineDraft(e.target.value)}
          />
        </div>
        {draft.length >= MAX_HOME_LANES ? (
          <p className="mb-3 text-xs text-studio-muted">Maximum {MAX_HOME_LANES}.</p>
        ) : null}
        {uploadError ? (
          <Alert variant="error" className="mb-3 text-xs">
            {uploadError}
          </Alert>
        ) : null}
        <ul className="divide-y divide-studio-border/50">
          {draft.map((item, index) => {
            const img = item.image_id ? byId.get(item.image_id) : null
            const title = item.title.trim() || DEFAULT_LANES[index]?.title || `Service ${index + 1}`
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => setActive((a) => (a === index ? null : index))}
                  className={studioRowActive(active === index)}
                >
                  {img ? (
                    <img src={mediaThumbUrl(img, '200x200')} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-dashed border-studio-border/70 text-[10px] text-studio-muted">
                      {index + 1}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm">{title}</span>
                  {studioRowBadge(active === index)}
                </button>
              </li>
            )
          })}
        </ul>

        {draft.length < MAX_HOME_LANES ? (
          <div className="mt-3">
            <AddServiceMenu
              onPick={() => setPickMode('add')}
              onUpload={() => addFileRef.current?.click()}
            />
            <input
              ref={addFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) uploadNew(file).catch((err) => setUploadError(uploadFailure(err)))
              }}
            />
          </div>
        ) : (
          <p className="mt-3 text-xs text-studio-muted">Maximum {MAX_HOME_LANES}.</p>
        )}

        {lane && active != null ? (
          <div className="mt-3 space-y-2.5 border-t border-studio-border/50 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-studio-muted">
                {lane.title.trim() || DEFAULT_LANES[active]?.title || `Service ${active + 1}`}
              </p>
              <StudioActionMenu
                items={[
                  { label: 'Pick photo', onClick: () => setPickMode(active) },
                  { label: 'Upload photo', onClick: () => replaceFileRef.current?.click() },
                  ...(draft.length > 1
                    ? [
                        {
                          label: 'Remove',
                          danger: true,
                          onClick: () => {
                            setDraft((prev) => prev.filter((_, i) => i !== active))
                            setActive(null)
                          },
                        },
                      ]
                    : []),
                ]}
              />
              <input
                ref={replaceFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file && active != null)
                    uploadReplace(active, file).catch((err) => setUploadError(uploadFailure(err)))
                }}
              />
            </div>
            <div>
              <Label className="text-xs text-studio-muted">Title</Label>
              <Input
                value={lane.title}
                placeholder="e.g. Wedding"
                onChange={(e) => patch(active, { title: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <Label className="text-xs text-studio-muted">Short description</Label>
              <textarea
                className={quietTextareaClass}
                value={lane.body}
                placeholder="e.g. Full-day coverage in Lagos"
                onChange={(e) => patch(active, { body: e.target.value })}
              />
            </div>
          </div>
        ) : null}
      </StudioFullscreenModal>

      <StudioImageGallery
        open={pickMode === 'add'}
        title="Add service photo"
        images={portfolio}
        selected={[]}
        max={1}
        portfolioOnlyDefault
        onClose={() => setPickMode(null)}
        onDone={(ids) => {
          const id = ids[0]
          setPickMode(null)
          if (!id) return
          appendWithImage(id)
        }}
      />
      {typeof pickMode === 'number' ? (
        <StudioImageGallery
          open
          title="Replace service photo"
          images={portfolio}
          selected={draft[pickMode]?.image_id ? [draft[pickMode].image_id!] : []}
          max={1}
          portfolioOnlyDefault
          onClose={() => setPickMode(null)}
          onDone={(ids) => {
            const id = ids[0]
            const index = pickMode
            setPickMode(null)
            if (!id) return
            patch(index, { image_id: id })
            setActive(index)
          }}
        />
      ) : null}
    </>
  )
}

function AddServiceMenu({ onPick, onUpload }: { onPick: () => void; onUpload: () => void }) {
  return (
    <StudioMenu
      label="Add service"
      align="left"
      items={[
        { label: 'Pick photo', onClick: onPick },
        { label: 'Upload photo', onClick: onUpload },
      ]}
      trigger={<span className="text-xs text-studio-accent hover:opacity-80">Add service</span>}
    />
  )
}

function WorksEditor({
  open,
  homeWork,
  websiteWork,
  onClose,
  onSave,
}: {
  open: boolean
  homeWork: string[]
  websiteWork: WorkRecord[]
  onClose: () => void
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [selected, setSelected] = useState<string[]>(homeWork.slice(0, MAX_HOME_WORK_PICKS))
  const [dragId, setDragId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const baseline = useRef(homeWork.slice(0, MAX_HOME_WORK_PICKS).join(','))

  useEffect(() => {
    if (!open) return
    const next = homeWork.slice(0, MAX_HOME_WORK_PICKS)
    setSelected(next)
    baseline.current = next.join(',')
    setShowAll(false)
    reset()
  }, [open, homeWork, reset])

  const dirty = selected.join(',') !== baseline.current
  const byId = useMemo(() => new Map(websiteWork.map((w) => [w.id, w])), [websiteWork])
  const selectedWorks = selected.map((id) => byId.get(id)).filter(Boolean) as WorkRecord[]

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_HOME_WORK_PICKS) return prev
      return [...prev, id]
    })
  }

  function onDragStart(id: string) {
    setDragId(id)
  }

  function onDragOver(e: DragEvent, overId: string) {
    e.preventDefault()
    if (!dragId || dragId === overId) return
    setSelected((prev) => {
      const from = prev.indexOf(dragId)
      const to = prev.indexOf(overId)
      if (from < 0 || to < 0) return prev
      const next = [...prev]
      next.splice(from, 1)
      next.splice(to, 0, dragId)
      return next
    })
  }

  return (
    <StudioFullscreenModal
      open={open}
      title="Works"
      onClose={onClose}
      dirty={dirty}
      footer={
        <SectionSaveBar
          status={status}
          error={error}
          dirty={dirty}
          onSave={() =>
            runSave(async () => {
              await onSave({ home_work: selected })
              onClose()
            })
          }
        />
      }
    >
      <p className="mb-3 text-xs text-studio-muted">Up to {MAX_HOME_WORK_PICKS} on Home. Drag On Home rows to reorder.</p>

      {selectedWorks.length ? (
        <div className="mb-3">
          <p className="mb-1 text-xs text-studio-muted">On Home</p>
          <ul className="divide-y divide-studio-border/50">
            {selectedWorks.map((work) => (
              <li
                key={work.id}
                draggable
                onDragStart={() => onDragStart(work.id)}
                onDragOver={(e) => onDragOver(e, work.id)}
                onDragEnd={() => setDragId(null)}
                className={cn(
                  'flex cursor-grab items-center gap-3 border-l-2 py-2 pl-2.5 active:cursor-grabbing',
                  dragId === work.id ? 'border-l-studio-fg bg-studio-panel opacity-60' : 'border-l-studio-fg/40',
                )}
              >
                <span className="text-xs text-studio-muted" aria-hidden>
                  ≡
                </span>
                {workThumb(work) ? (
                  <img src={workThumb(work)} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded border border-dashed border-studio-border/70" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-studio-fg">{work.title}</span>
                <button
                  type="button"
                  className="shrink-0 text-xs text-studio-muted hover:text-studio-danger"
                  onClick={() => toggle(work.id)}
                >
                  Off
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-3 text-xs text-studio-muted">None on Home yet.</p>
      )}

      <button
        type="button"
        className="mb-2 text-xs text-studio-muted underline-offset-2 hover:text-studio-fg hover:underline"
        onClick={() => setShowAll((v) => !v)}
      >
        {showAll ? 'Hide list' : `Choose from website Work (${websiteWork.length})`}
      </button>

      {showAll ? (
        !websiteWork.length ? (
          <p className="text-xs text-studio-muted">No public Work yet.</p>
        ) : (
          <ul className="divide-y divide-studio-border/50">
            {websiteWork.map((work) => {
              const on = selected.includes(work.id)
              const blocked = !on && selected.length >= MAX_HOME_WORK_PICKS
              return (
                <li key={work.id}>
                  <button
                    type="button"
                    disabled={blocked}
                    onClick={() => toggle(work.id)}
                className={cn(
                  studioRowActive(on),
                  'disabled:opacity-40',
                )}
              >
                    {workThumb(work) ? (
                      <img src={workThumb(work)} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="h-9 w-9 shrink-0 rounded border border-dashed border-studio-border/70" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm">{work.title}</span>
                    {studioRowBadge(on, 'On', 'Off')}
                  </button>
                </li>
              )
            })}
          </ul>
        )
      ) : null}
    </StudioFullscreenModal>
  )
}

function StripEditor({
  open,
  atmosphereMode,
  atmosphereIds,
  byId,
  onClose,
  onSave,
  onPick,
}: {
  open: boolean
  atmosphereMode: 'auto' | 'manual'
  atmosphereIds: string[]
  byId: Map<string, MediaRecord>
  onClose: () => void
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
  onPick: () => void
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [mode, setMode] = useState(atmosphereMode)
  const baseline = useRef(atmosphereMode)

  useEffect(() => {
    if (!open) return
    setMode(atmosphereMode)
    baseline.current = atmosphereMode
    reset()
  }, [open, atmosphereMode, reset])

  const dirty = mode !== baseline.current

  return (
    <StudioFullscreenModal
      open={open}
      title="Portfolio strip"
      onClose={onClose}
      dirty={dirty}
      footer={
        <SectionSaveBar
          status={status}
          error={error}
          dirty={dirty}
          onSave={() =>
            runSave(async () => {
              await onSave(
                mode === 'auto' ? { atmosphere_mode: 'auto' } : { atmosphere_mode: 'manual', atmosphere_ids: atmosphereIds },
              )
              onClose()
            })
          }
        />
      }
    >
      <div className="mb-3 flex gap-4 text-xs">
        <button
          type="button"
          className={mode === 'auto' ? 'text-studio-fg underline' : 'text-studio-muted hover:text-studio-fg'}
          onClick={() => setMode('auto')}
        >
          Auto
        </button>
        <button
          type="button"
          className={mode === 'manual' ? 'text-studio-fg underline' : 'text-studio-muted hover:text-studio-fg'}
          onClick={() => setMode('manual')}
        >
          Pick myself
        </button>
      </div>
      {mode === 'manual' ? (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-studio-muted">{atmosphereIds.length} photos</p>
            <StudioActionMenu items={[{ label: 'Pick photos', onClick: onPick }]} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {atmosphereIds.map((id) => {
              const img = byId.get(id)
              if (!img) return null
              return <img key={id} src={mediaThumbUrl(img, '200x200')} alt="" className="h-12 w-12 rounded object-cover" />
            })}
          </div>
        </>
      ) : null}
    </StudioFullscreenModal>
  )
}

function TeaseEditor({
  open,
  globals,
  onClose,
  onSave,
}: {
  open: boolean
  globals: WebsiteGlobals
  onClose: () => void
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [headline, setHeadline] = useState(globals.about_tease_headline ?? '')
  const [lead, setLead] = useState(globals.about_tease_lead ?? '')
  const baseline = useRef({ h: '', l: '' })

  useEffect(() => {
    if (!open) return
    const h = globals.about_tease_headline ?? ''
    const l = globals.about_tease_lead ?? ''
    setHeadline(h)
    setLead(l)
    baseline.current = { h, l }
    reset()
  }, [open, globals.about_tease_headline, globals.about_tease_lead, globals.updated, reset])

  const dirty = headline !== baseline.current.h || lead !== baseline.current.l

  return (
    <StudioFullscreenModal
      open={open}
      title="About tease"
      onClose={onClose}
      dirty={dirty}
      footer={
        <SectionSaveBar
          status={status}
          error={error}
          dirty={dirty}
          onSave={() =>
            runSave(async () => {
              await onSave({ about_tease_headline: headline, about_tease_lead: lead })
              onClose()
            })
          }
        />
      }
    >
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-studio-muted">Headline</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. About Ibrahim" />
        </div>
        <div>
          <Label className="text-xs text-studio-muted">Short text under it</Label>
          <Input value={lead} onChange={(e) => setLead(e.target.value)} placeholder="e.g. Portraits and weddings in Lagos" />
        </div>
      </div>
    </StudioFullscreenModal>
  )
}
