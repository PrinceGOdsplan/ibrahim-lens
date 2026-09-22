import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { useConfirm } from '@/components/ui/confirm'
import { fetchAsBlob, saveBlob, saveImageToDevice, zipStore } from '@/lib/download'
import { pbErrorMessage } from '@/lib/pb-error'
import { usePatchSearchParams, useUrlOptionalId, useUrlTab } from '@/lib/useUrlTab'
import {
  type AlbumRecord,
  type MediaRecord,
  type TagRecord,
  type WorkRecord,
  addMediaToAlbum,
  addMediaToWork,
  createAlbum,
  createTag,
  createWork,
  deleteAlbum,
  deleteGalleryMedia,
  deleteHeldMedia,
  deletePortfolioMedia,
  deleteWork,
  ensureGalleryVaultMigration,
  findPortfolioCopies,
  hasPortfolioCopy,
  listAlbums,
  listTags,
  listWork,
  mediaVault,
  promoteToPortfolio,
  removeMediaFromAlbum,
  removeMediaFromWork,
  renameAlbum,
  reorderPortfolio,
  reorderWork,
  setMediaTags,
  updateMediaCaption,
  updateWork,
  uploadMedia,
  getMedia,
  listMediaByIds,
  listMediaPage,
  listPortfolioMedia,
  mediaOriginalUrl,
  studioDownloadFilename,
  prepareImageFile,
  validateImageFile,
  fileStem,
  namedImageFile,
  type MediaUploadDest,
} from '@/lib/library'
import { settleAll } from '@/lib/useAsyncData'
import { attachFocusReveal } from '@/lib/reveal-in-view'
import { cn } from '@/lib/utils'
import { useStudioRecordRefresh } from '@/lib/studio-record-sync'
import { StudioHubShell } from '@/components/studio/StudioHubShell'
import { StudioImageGallery } from '@/components/studio/StudioImageGallery'
import { AlbumsView } from '@/components/studio/gallery/AlbumsView'
import { BulkSelectBar } from '@/components/studio/gallery/BulkSelectBar'
import { GalleryToolbar, type GalleryRoom, type PortfolioView, type SortMode } from '@/components/studio/gallery/GalleryToolbar'
import { ImageSheet } from '@/components/studio/gallery/ImageSheet'
import { looksLikeCameraName, pendingForDest, type PendingPhoto } from '@/components/studio/gallery/pending'
import { PortfolioOrderList } from '@/components/studio/gallery/PortfolioOrderList'
import { RenameStrip } from '@/components/studio/gallery/RenameStrip'
import { ThumbWall } from '@/components/studio/gallery/ThumbWall'
import { WorkView } from '@/components/studio/gallery/WorkView'

const ROOMS: readonly GalleryRoom[] = ['gallery', 'portfolio', 'albums', 'work']
const PORTFOLIO_VIEWS: readonly PortfolioView[] = ['wall', 'order']
const COLS_KEY = 'studio-gallery-cols'
const COLS_MIN = 3
const COLS_MAX = 8

function readCols(): number {
  try {
    const n = Number(localStorage.getItem(COLS_KEY))
    if (n >= COLS_MIN && n <= COLS_MAX) return n
  } catch {
    /* ignore */
  }
  return 6
}

export function StudioLibraryPage() {
  return <StudioGalleryPage />
}

export function StudioGalleryPage() {
  const [room] = useUrlTab<GalleryRoom>('room', ROOMS, 'gallery')
  const [portfolioView, setPortfolioView] = useUrlTab<PortfolioView>('view', PORTFOLIO_VIEWS, 'wall')
  const patchParams = usePatchSearchParams()
  const [searchParams] = useSearchParams()
  const uploadHandoff = searchParams.get('upload') === '1'
  const [wall, setWall] = useState<MediaRecord[]>([])
  const [wallHasMore, setWallHasMore] = useState(true)
  const [wallLoading, setWallLoading] = useState(false)
  const [portfolioOrder, setPortfolioOrder] = useState<MediaRecord[]>([])
  const [albums, setAlbums] = useState<AlbumRecord[]>([])
  const [works, setWorks] = useState<WorkRecord[]>([])
  const [collectionMedia, setCollectionMedia] = useState<MediaRecord[]>([])
  const [tags, setTags] = useState<TagRecord[]>([])
  const [activeAlbumId, setActiveAlbumId] = useUrlOptionalId('album')
  const [activeWorkId, setActiveWorkId] = useUrlOptionalId('work')
  const [activeId, setActiveId] = useUrlOptionalId('media')
  const [activeRecord, setActiveRecord] = useState<MediaRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [albumCreateTick, setAlbumCreateTick] = useState(0)
  const [workCreateTick, setWorkCreateTick] = useState(0)
  const [cols, setCols] = useState(readCols)
  const [sort, setSort] = useState<SortMode>('date')
  const [tagFilter, setTagFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [websiteFilter, setWebsiteFilter] = useState<'' | 'site' | 'private'>('')
  const [nameQuery, setNameQuery] = useState('')
  const [deletePrompt, setDeletePrompt] = useState<{ id: string; copyCount: number } | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [uploadFailures, setUploadFailures] = useState<{ name: string; reason: string }[]>([])
  const [dropOver, setDropOver] = useState(false)
  const [pickFor, setPickFor] = useState<null | 'album' | 'work' | 'portfolio'>(null)
  const [pending, setPending] = useState<PendingPhoto[]>([])
  const [renameOpen, setRenameOpen] = useState(false)
  const [arrangeOpen, setArrangeOpen] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [downloadBusy, setDownloadBusy] = useState(false)
  const [activeHasPortfolioCopy, setActiveHasPortfolioCopy] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)
  const wallScrollRef = useRef<HTMLDivElement>(null)
  const wallPageRef = useRef(0)
  const wallGenRef = useRef(0)
  const wallLoadingRef = useRef(false)
  const wallHasMoreRef = useRef(true)
  const pendingMoreRef = useRef(false)
  const colsRef = useRef(cols)
  colsRef.current = cols
  const pendingRef = useRef<PendingPhoto[]>([])
  const pumpingRef = useRef(false)
  const roomRef = useRef(room)
  const portfolioSortRef = useRef<number | null>(null)
  const { confirm, dialog: confirmDialog } = useConfirm()

  roomRef.current = room
  pendingRef.current = pending

  useEffect(() => {
    if (!uploadHandoff) return
    const t = window.setTimeout(() => {
      uploadRef.current?.click()
      patchParams({ upload: null })
    }, 120)
    return () => window.clearTimeout(t)
  }, [uploadHandoff, patchParams, room])

  const refreshLists = useCallback(async () => {
    const loaders: Record<string, () => Promise<unknown>> = { Tags: listTags }
    if (room === 'albums') loaders.Albums = listAlbums
    if (room === 'work') loaders.Work = listWork
    const { values, failed } = await settleAll(loaders)
    if (values.Tags) setTags(values.Tags as TagRecord[])
    if (values.Albums) setAlbums(values.Albums as AlbumRecord[])
    if (values.Work) setWorks(values.Work as WorkRecord[])
    if (failed.length === Object.keys(loaders).length) throw new Error('Could not load Gallery.')
  }, [room])

  const loadWall = useCallback(
    async (reset: boolean) => {
      if (room !== 'gallery' && room !== 'portfolio') {
        setLoaded(true)
        return
      }
      // A reset replaces an in-flight page; a load-more waits until page 1 exists.
      if (!reset && (wallLoadingRef.current || wallPageRef.current < 1)) {
        pendingMoreRef.current = true
        return
      }
      if (reset) pendingMoreRef.current = false
      const gen = reset ? ++wallGenRef.current : wallGenRef.current
      wallLoadingRef.current = true
      setWallLoading(true)
      try {
        const nextPage = reset ? 1 : wallPageRef.current + 1
        const query = {
          page: nextPage,
          vault: (room === 'portfolio' ? 'portfolio' : 'gallery') as 'portfolio' | 'gallery',
          tagId: tagFilter || undefined,
          q: nameQuery || undefined,
          sort,
          perPage: Math.min(30, Math.max(24, colsRef.current * 4)),
        }
        const result = await listMediaPage(query).catch(async (first) => {
          if (!reset) throw first
          await new Promise((resolve) => setTimeout(resolve, 400))
          return listMediaPage(query)
        })
        if (gen !== wallGenRef.current) return
        wallPageRef.current = result.page
        wallHasMoreRef.current = result.hasMore
        setError(null)
        setWall((prev) => {
          if (reset) return result.items
          const seen = new Set(prev.map((item) => item.id))
          return [...prev, ...result.items.filter((item) => !seen.has(item.id))]
        })
        setWallHasMore(wallHasMoreRef.current)
      } catch (e) {
        if (gen !== wallGenRef.current) return
        // Keep an already-painted wall; only the first page is fatal.
        if (reset) setError(pbErrorMessage(e, 'Could not load Gallery.'))
      } finally {
        if (gen === wallGenRef.current) {
          wallLoadingRef.current = false
          setWallLoading(false)
          setLoaded(true)
        }
      }
    },
    [room, sort, tagFilter, nameQuery],
  )

  const loadMoreWall = useCallback(() => {
    void loadWall(false)
  }, [loadWall])

  useEffect(() => {
    if (wallLoading || !pendingMoreRef.current || !wallHasMoreRef.current) return
    pendingMoreRef.current = false
    void loadWall(false)
  }, [wallLoading, loadWall])

  const loadAll = useCallback(async () => {
    try {
      await ensureGalleryVaultMigration()
    } catch {
      /* schema may lag; still load */
    }
    try {
      setError(null)
      await refreshLists()
      wallPageRef.current = 0
      setWall([])
      setWallHasMore(true)
      await loadWall(true)
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not load Gallery.'))
      setLoaded(true)
    }
  }, [refreshLists, loadWall])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        setError(null)
        await refreshLists()
      } catch (e) {
        if (!cancelled) {
          setError(pbErrorMessage(e, 'Could not load Gallery.'))
          setLoaded(true)
        }
      }
      try {
        await ensureGalleryVaultMigration()
      } catch {
        /* schema may lag; still load */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshLists])

  useEffect(() => {
    wallPageRef.current = 0
    setWall([])
    setWallHasMore(true)
    setLoaded(false)
    void loadWall(true)
  }, [loadWall])

  const onAssistantWrite = useCallback(() => {
    void refreshLists()
    void loadWall(true)
  }, [refreshLists, loadWall])
  useStudioRecordRefresh(['albums', 'work_projects', 'media', 'website_globals'], onAssistantWrite)

  useEffect(() => {
    if (room !== 'albums' && room !== 'work') return
    const ids: string[] = []
    if (room === 'albums') {
      const album = activeAlbumId ? albums.find((row) => row.id === activeAlbumId) : null
      if (album) ids.push(...(album.images ?? []))
      else {
        for (const row of albums) {
          if (row.images?.[0]) ids.push(row.images[0])
        }
      }
    }
    if (room === 'work') {
      const work = activeWorkId ? works.find((row) => row.id === activeWorkId) : null
      if (work) {
        ids.push(...(work.images ?? []))
        if (work.cover) ids.push(work.cover)
      } else {
        for (const row of works) {
          if (row.cover) ids.push(row.cover)
          else if (row.images?.[0]) ids.push(row.images[0])
        }
      }
    }
    let cancelled = false
    listMediaByIds(ids)
      .then((rows) => {
        if (!cancelled) setCollectionMedia(rows)
      })
      .catch(() => {
        if (!cancelled) setCollectionMedia([])
      })
    return () => {
      cancelled = true
    }
  }, [room, albums, works, activeAlbumId, activeWorkId])

  useEffect(() => {
    if (room !== 'portfolio' || !arrangeOpen) return
    listPortfolioMedia()
      .then(setPortfolioOrder)
      .catch(() => setPortfolioOrder([]))
  }, [room, arrangeOpen])

  useEffect(() => {
    try {
      localStorage.setItem(COLS_KEY, String(cols))
    } catch {
      /* ignore */
    }
  }, [cols])

  useEffect(() => attachFocusReveal(wallScrollRef.current), [])

  useEffect(() => {
    setSearchInput('')
    setNameQuery('')
    setWebsiteFilter('')
  }, [room])

  useEffect(() => {
    setSearchInput('')
    setNameQuery('')
    setTagFilter('')
  }, [activeAlbumId, activeWorkId])

  useEffect(() => {
    const onWall = room === 'gallery' || (room === 'portfolio' && portfolioView === 'wall')
    if (!onWall) {
      setSelectMode(false)
      setSelectedIds([])
    }
  }, [room, portfolioView])

  useEffect(() => {
    if (activeAlbumId && albums.length && !albums.some((album) => album.id === activeAlbumId)) {
      setActiveAlbumId(null)
    }
  }, [albums, activeAlbumId, setActiveAlbumId])

  useEffect(() => {
    if (activeWorkId && works.length && !works.some((work) => work.id === activeWorkId)) {
      setActiveWorkId(null)
    }
  }, [works, activeWorkId, setActiveWorkId])

  useEffect(() => {
    const timer = window.setTimeout(() => setNameQuery(searchInput.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const media = useMemo(() => {
    const map = new Map<string, MediaRecord>()
    for (const item of wall) map.set(item.id, item)
    for (const item of portfolioOrder) map.set(item.id, item)
    for (const item of collectionMedia) map.set(item.id, item)
    for (const work of works) {
      const cover = work.expand?.cover
      if (cover && typeof cover === 'object' && 'id' in cover) {
        map.set((cover as MediaRecord).id, cover as MediaRecord)
      }
    }
    if (activeRecord) map.set(activeRecord.id, activeRecord)
    return [...map.values()]
  }, [wall, portfolioOrder, collectionMedia, works, activeRecord])

  const active = useMemo(
    () => (activeId ? media.find((item) => item.id === activeId) ?? activeRecord : null),
    [media, activeId, activeRecord],
  )

  useEffect(() => {
    if (!activeId) {
      setActiveRecord(null)
      return
    }
    if (media.some((item) => item.id === activeId)) return
    getMedia(activeId)
      .then(setActiveRecord)
      .catch(() => setActiveRecord(null))
  }, [activeId, media])

  useEffect(() => {
    if (!active || mediaVault(active) !== 'gallery') {
      setActiveHasPortfolioCopy(false)
      return
    }
    if (active.in_portfolio) {
      setActiveHasPortfolioCopy(true)
      return
    }
    let cancelled = false
    void hasPortfolioCopy(active.id).then((has) => {
      if (!cancelled) setActiveHasPortfolioCopy(has)
    })
    return () => {
      cancelled = true
    }
  }, [active?.id, active?.in_portfolio])

  const portfolioItems = useMemo(
    () => [...portfolioOrder].sort((a, b) => (a.portfolio_sort || 0) - (b.portfolio_sort || 0)),
    [portfolioOrder],
  )

  const wallItems = useMemo(() => {
    if (sort !== 'tag') return wall
    return [...wall].sort((a, b) => {
      const ta = ((a.expand?.tags as TagRecord[] | undefined)?.[0]?.name || a.tags?.[0] || '').toString()
      const tb = ((b.expand?.tags as TagRecord[] | undefined)?.[0]?.name || b.tags?.[0] || '').toString()
      return ta.localeCompare(tb) || (a.caption || '').localeCompare(b.caption || '')
    })
  }, [wall, sort])

  function currentUploadDest(): MediaUploadDest | null {
    if (room === 'portfolio') return { vault: 'portfolio' }
    if (room === 'albums') return activeAlbumId ? { albumId: activeAlbumId } : null
    if (room === 'work') return activeWorkId ? { workId: activeWorkId } : null
    return { vault: 'gallery' }
  }

  function dropLabel() {
    if (room === 'portfolio') return 'Drop into Portfolio'
    if (room === 'albums') return 'Drop into this album'
    if (room === 'work') return 'Drop into this Work'
    return 'Drop into Gallery'
  }

  function emptyTitle() {
    if (nameQuery) return `Nothing matches “${nameQuery}”.`
    if (room === 'portfolio') return 'No photos in Portfolio yet.'
    return 'No photos in Gallery yet.'
  }

  function patchPending(next: PendingPhoto[]) {
    pendingRef.current = next
    setPending(next)
  }

  function mergeCreated(created: MediaRecord, dest: MediaUploadDest) {
    const here = roomRef.current
    if (dest.vault === 'portfolio') {
      setPortfolioOrder((prev) => [...prev.filter((item) => item.id !== created.id), created])
      if (here === 'portfolio') setWall((prev) => [created, ...prev.filter((item) => item.id !== created.id)])
      return
    }
    if (dest.albumId || dest.workId) return
    if (here === 'gallery') setWall((prev) => [created, ...prev.filter((item) => item.id !== created.id)])
  }

  const pump = useCallback(async () => {
    if (pumpingRef.current) return
    pumpingRef.current = true
    try {
      while (true) {
        const next = pendingRef.current.find((item) => item.status === 'queued')
        if (!next) break
        const dest = { ...next.dest }
        if (dest.vault === 'portfolio') {
          if (portfolioSortRef.current == null) {
            const list = await listPortfolioMedia()
            portfolioSortRef.current = list.reduce((max, item) => Math.max(max, item.portfolio_sort || 0), 0) + 1
          }
          dest.portfolioSort = portfolioSortRef.current
        }
        patchPending(pendingRef.current.map((item) => (item.id === next.id ? { ...item, status: 'uploading' } : item)))
        try {
          const created = await uploadMedia(namedImageFile(next.file, next.name), '', dest)
          if (dest.portfolioSort != null && portfolioSortRef.current != null) portfolioSortRef.current += 1
          URL.revokeObjectURL(next.preview)
          patchPending(pendingRef.current.filter((item) => item.id !== next.id))
          mergeCreated(created, dest)
          if (dest.albumId || dest.workId) await refreshLists()
        } catch (e) {
          patchPending(
            pendingRef.current.map((item) =>
              item.id === next.id ? { ...item, status: 'error', reason: pbErrorMessage(e, 'Could not add this photo.') } : item,
            ),
          )
        }
      }
    } finally {
      pumpingRef.current = false
      if (!pendingRef.current.some((item) => item.status === 'queued' || item.status === 'uploading')) {
        portfolioSortRef.current = null
      }
    }
  }, [refreshLists])

  function queueFiles(files: File[]) {
    if (!files.length) return
    const dest = currentUploadDest()
    if (!dest) {
      setError(room === 'work' ? 'Open a Work first.' : 'Open an album first.')
      return
    }

    const failures: { name: string; reason: string }[] = []
    const next: PendingPhoto[] = []
    for (const raw of files) {
      const file = prepareImageFile(raw)
      const reason = validateImageFile(file)
      if (reason) {
        failures.push({ name: file.name, reason })
        continue
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        name: fileStem(file.name),
        dest,
        status: 'queued',
      })
    }

    setUploadFailures(failures)
    if (!next.length) return

    setError(null)
    patchPending([...pendingRef.current, ...next])
    if (next.some((item) => looksLikeCameraName(item.name))) setRenameOpen(true)
    void pump()
  }

  function retryPending(id: string) {
    patchPending(pendingRef.current.map((item) => (item.id === id ? { ...item, status: 'queued', reason: undefined } : item)))
    void pump()
  }

  function dismissPending(id: string) {
    const item = pendingRef.current.find((photo) => photo.id === id)
    if (item) URL.revokeObjectURL(item.preview)
    patchPending(pendingRef.current.filter((photo) => photo.id !== id))
  }

  function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    queueFiles(files)
  }

  async function refreshAfterWrite() {
    try {
      await refreshLists()
    } catch {
      /* keep the lists already on screen */
    }
    if (activeId) {
      try {
        const rec = await getMedia(activeId)
        setActiveRecord(rec)
        setWall((prev) => prev.map((item) => (item.id === rec.id ? rec : item)))
        setPortfolioOrder((prev) => prev.map((item) => (item.id === rec.id ? rec : item)))
      } catch {
        /* deleted */
      }
    }
    if (roomRef.current === 'portfolio') {
      try {
        setPortfolioOrder(await listPortfolioMedia())
      } catch {
        /* keep the order already on screen */
      }
    }
  }

  async function run(action: () => Promise<void>): Promise<boolean> {
    setError(null)
    try {
      await action()
    } catch (e) {
      setError(pbErrorMessage(e))
      return false
    }
    // Reloading tags or the Portfolio list is not the save. A failed reload must
    // not turn a finished write into "Could not save".
    try {
      await refreshAfterWrite()
    } catch {
      /* write already landed */
    }
    return true
  }

  async function handleDelete(id: string, mode?: 'gallery-only' | 'both') {
    const item = media.find((record) => record.id === id)
    if (!item) return
    if (mediaVault(item) === 'held') {
      const ok = await run(async () => {
        await deleteHeldMedia(id)
        setActiveId(null)
        setDeletePrompt(null)
      })
      if (ok) setWall((prev) => prev.filter((record) => record.id !== id))
      return
    }
    if (mediaVault(item) === 'portfolio') {
      const ok = await run(async () => {
        await deletePortfolioMedia(id)
        setActiveId(null)
        setDeletePrompt(null)
      })
      if (ok) {
        setWall((prev) => prev.filter((record) => record.id !== id))
        setPortfolioOrder((prev) => prev.filter((record) => record.id !== id))
      }
      return
    }
    try {
      setError(null)
      await deleteGalleryMedia(id, mode)
      setActiveId(null)
      setDeletePrompt(null)
      setWall((prev) => prev.filter((record) => record.id !== id))
      await refreshLists()
    } catch (e) {
      if (e instanceof Error && e.message === 'NEED_MODE') {
        const copies = await findPortfolioCopies(id)
        setDeletePrompt({ id, copyCount: copies.length })
      } else {
        setError(e instanceof Error ? e.message : String(e))
      }
    }
  }

  function clearSelection() {
    setSelectedIds([])
    setSelectMode(false)
  }

  function toggleSelectMode() {
    setSelectMode((open) => {
      if (open) setSelectedIds([])
      else setActiveId(null)
      return !open
    })
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  async function bulkDelete() {
    const count = selectedIds.length
    if (!count) return
    const ok = await confirm({
      title: room === 'portfolio' ? `Remove ${count} from Portfolio?` : `Delete ${count} photos?`,
      body:
        room === 'portfolio'
          ? 'Visitors will not see these photos. Gallery copies stay if any were promoted.'
          : 'Photos with Portfolio copies keep their Portfolio version.',
      confirmLabel: room === 'portfolio' ? 'Remove' : 'Delete',
      destructive: true,
    })
    if (!ok) return

    const ids = [...selectedIds]
    clearSelection()
    setError(null)
    try {
      for (const id of ids) {
        if (room === 'portfolio') await deletePortfolioMedia(id)
        else await deleteGalleryMedia(id, 'gallery-only')
      }
      setWall((prev) => prev.filter((item) => !ids.includes(item.id)))
      setPortfolioOrder((prev) => prev.filter((item) => !ids.includes(item.id)))
      if (activeId && ids.includes(activeId)) setActiveId(null)
      await refreshLists()
      if (roomRef.current === 'portfolio') setPortfolioOrder(await listPortfolioMedia())
    } catch (e) {
      setError(pbErrorMessage(e))
    }
  }

  async function bulkAddToAlbum(albumId: string) {
    const ids = [...selectedIds]
    const ok = await run(async () => {
      for (const id of ids) await addMediaToAlbum(albumId, id)
    })
    if (ok) clearSelection()
  }

  async function bulkCreateAlbum(title: string) {
    const ids = [...selectedIds]
    const ok = await run(async () => {
      const album = await createAlbum(title)
      for (const id of ids) await addMediaToAlbum(album.id, id)
      setActiveAlbumId(album.id)
    })
    if (ok) clearSelection()
  }

  async function bulkTag(tagId: string) {
    const ids = [...selectedIds]
    const ok = await run(async () => {
      for (const id of ids) {
        const item = media.find((record) => record.id === id) ?? wall.find((record) => record.id === id)
        const current = item?.tags ?? []
        if (!current.includes(tagId)) await setMediaTags(id, [...current, tagId])
      }
    })
    if (ok) clearSelection()
  }

  function selectedRecords() {
    return selectedIds
      .map((id) => wall.find((record) => record.id === id) ?? media.find((record) => record.id === id))
      .filter((record): record is MediaRecord => Boolean(record))
  }

  async function bulkDownload() {
    const items = selectedRecords()
    if (!items.length || downloadBusy) return
    setDownloadBusy(true)
    setError(null)
    try {
      if (items.length === 1) {
        const blob = await fetchAsBlob(mediaOriginalUrl(items[0]))
        await saveImageToDevice(blob, studioDownloadFilename(items[0]))
        return
      }
      const used = new Set<string>()
      const files: { name: string; data: Uint8Array }[] = []
      for (const item of items) {
        const blob = await fetchAsBlob(mediaOriginalUrl(item))
        let name = studioDownloadFilename(item)
        if (used.has(name)) {
          const dot = name.lastIndexOf('.')
          const stem = dot > 0 ? name.slice(0, dot) : name
          const ext = dot > 0 ? name.slice(dot) : ''
          name = `${stem}-${item.id.slice(0, 6)}${ext}`
        }
        used.add(name)
        files.push({ name, data: new Uint8Array(await blob.arrayBuffer()) })
      }
      saveBlob(zipStore(files), 'selected-photos.zip')
    } catch (e) {
      setError(pbErrorMessage(e, 'Could not download the selected photos.'))
    } finally {
      setDownloadBusy(false)
    }
  }

  async function bulkAddToPortfolio() {
    const ids = [...selectedIds]
    const ok = await run(async () => {
      for (const id of ids) await promoteToPortfolio(id)
    })
    if (ok) {
      clearSelection()
      setPortfolioOrder(await listPortfolioMedia())
    }
  }

  async function bulkCreateTag(name: string) {
    const ids = [...selectedIds]
    const ok = await run(async () => {
      const tag = await createTag(name)
      for (const id of ids) {
        const item = media.find((record) => record.id === id) ?? wall.find((record) => record.id === id)
        const current = item?.tags ?? []
        if (!current.includes(tag.id)) await setMediaTags(id, [...current, tag.id])
      }
    })
    if (ok) clearSelection()
  }

  const wallPending = pendingForDest(pending, room === 'portfolio' ? { vault: 'portfolio' } : { vault: 'gallery' })
  const albumPending = activeAlbumId ? pendingForDest(pending, { albumId: activeAlbumId }) : []
  const workPending = activeWorkId ? pendingForDest(pending, { workId: activeWorkId }) : []
  const renameItems = renameOpen ? pending.filter((item) => item.status !== 'error') : []
  const arrangeMark = sort !== 'date' || tagFilter !== '' || cols !== 6 || websiteFilter !== ''
  const showWall = room === 'gallery' || (room === 'portfolio' && portfolioView === 'wall')
  const insideAlbum = room === 'albums' && !!activeAlbumId
  const insideWork = room === 'work' && !!activeWorkId
  const collectionIndex = (room === 'albums' && !activeAlbumId) || (room === 'work' && !activeWorkId)
  const activeWork = works.find((work) => work.id === activeWorkId) ?? null
  const activeInPortfolio =
    !!active &&
    (mediaVault(active) === 'portfolio' || !!active.in_portfolio || activeHasPortfolioCopy)

  return (
    <StudioHubShell className="min-h-0 bg-studio-bg">
      <input
        ref={uploadRef}
        id="gallery-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={onUpload}
        className="sr-only"
      />

      <GalleryToolbar
        room={room}
        onRoom={(id) => {
          if (id === room) {
            if (id === 'albums') patchParams({ album: null, media: null })
            if (id === 'work') patchParams({ work: null, media: null })
            return
          }
          // One URL write only — a second setSearchParams in the same click
          // (e.g. setActiveId) races and can drop room=albums|work on mobile.
          patchParams({
            room: id === 'gallery' ? null : id,
            album: id === 'albums' ? activeAlbumId : null,
            work: id === 'work' ? activeWorkId : null,
            media: null,
          })
        }}
        portfolioView={portfolioView}
        onPortfolioView={setPortfolioView}
        showAdd
        onAdd={() => {
          if (room === 'albums' && !activeAlbumId) {
            setAlbumCreateTick((tick) => tick + 1)
            return
          }
          if (room === 'work' && !activeWorkId) {
            setWorkCreateTick((tick) => tick + 1)
            return
          }
          uploadRef.current?.click()
        }}
        onPickFromPile={
          room === 'portfolio'
            ? () => setPickFor('portfolio')
            : insideAlbum
              ? () => setPickFor('album')
              : insideWork
                ? () => setPickFor('work')
                : undefined
        }
        search={searchInput}
        onSearch={setSearchInput}
        arrangeOpen={arrangeOpen}
        onArrange={() => setArrangeOpen((open) => !open)}
        arrangeMark={arrangeMark}
        sort={sort}
        onSort={setSort}
        tagFilter={tagFilter}
        onTagFilter={setTagFilter}
        tags={tags}
        cols={cols}
        onCols={setCols}
        colsMin={COLS_MIN}
        colsMax={COLS_MAX}
        collectionPhotoWall={insideAlbum || insideWork}
        collectionIndex={collectionIndex}
        websiteFilter={websiteFilter}
        onWebsiteFilter={setWebsiteFilter}
        selectMode={showWall ? selectMode : undefined}
        onSelectMode={showWall ? toggleSelectMode : undefined}
      />

      {error ? (
        <div className="border-b border-studio-danger/25 bg-studio-danger/5 px-5 py-2">
          <Alert variant="error" tone="studio" className="!border-0 !bg-transparent !p-0" onRetry={loadAll}>
            {error}
          </Alert>
        </div>
      ) : null}

      {uploadFailures.length ? (
        <div className="border-b border-studio-danger/25 bg-studio-danger/5 px-5 py-2">
          <Alert variant="error" tone="studio" className="!border-0 !bg-transparent !p-0">
            <p>
              {uploadFailures.length === 1
                ? 'This file could not be added.'
                : `${uploadFailures.length} files could not be added. The rest are landing.`}
            </p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
              {uploadFailures.map((failure) => (
                <li key={failure.name}>
                  <span className="font-medium">{failure.name}</span> — {failure.reason}
                </li>
              ))}
            </ul>
            <button type="button" className="mt-2 text-xs underline" onClick={() => setUploadFailures([])}>
              Dismiss
            </button>
          </Alert>
        </div>
      ) : null}

      {renameItems.length ? (
        <RenameStrip
          items={renameItems}
          onName={(id, name) => {
            patchPending(pendingRef.current.map((item) => (item.id === id ? { ...item, name } : item)))
          }}
          onKeep={() => setRenameOpen(false)}
        />
      ) : null}

      <div
        ref={wallScrollRef}
        className={cn(
          'relative min-h-0 flex-1 overflow-auto overscroll-contain p-3 sm:p-4 md:p-5',
          dropOver && 'bg-studio-panel/80',
        )}
        onDragOver={(event: DragEvent) => {
          event.preventDefault()
          setDropOver(true)
        }}
        onDragLeave={() => setDropOver(false)}
        onDrop={(event: DragEvent) => {
          event.preventDefault()
          setDropOver(false)
          void queueFiles(
            Array.from(event.dataTransfer.files ?? []).filter(
              (file) => file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name),
            ),
          )
        }}
      >
        {dropOver ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-studio-fg/40 bg-studio-bg/80 text-sm font-medium">
            {dropLabel()}
          </div>
        ) : null}

        {showWall ? (
          <ThumbWall
            items={wallItems}
            pending={wallPending}
            cols={cols}
            activeId={activeId}
            loaded={loaded}
            hasMore={wallHasMore}
            loadingMore={wallLoading}
            emptyTitle={error ? 'Could not load these photos.' : emptyTitle()}
            scrollRoot={wallScrollRef}
            onOpen={setActiveId}
            onNearEnd={loadMoreWall}
            onAdd={() => uploadRef.current?.click()}
            onRetry={retryPending}
            onDismissPending={dismissPending}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelected}
          />
        ) : null}

        {room === 'portfolio' && portfolioView === 'order' ? (
          portfolioItems.length ? (
            <PortfolioOrderList
              items={portfolioItems}
              onOpen={setActiveId}
              onReorder={(ids) => void run(() => reorderPortfolio(ids))}
              onRemove={async (id) => {
                const ok = await confirm({
                  title: 'Remove from Portfolio?',
                  body: 'Visitors will not see this photo. The Gallery photo stays if this was a copy.',
                  confirmLabel: 'Take off',
                  destructive: true,
                })
                if (!ok) return
                await run(async () => {
                  await deletePortfolioMedia(id)
                  if (activeId === id) setActiveId(null)
                })
              }}
            />
          ) : (
            <p className="text-sm text-studio-muted">No photos in Portfolio yet.</p>
          )
        ) : null}

        {room === 'albums' ? (
          <AlbumsView
            albums={albums}
            media={media}
            pending={albumPending}
            loaded={loaded}
            cols={cols}
            activeAlbumId={activeAlbumId}
            createTick={albumCreateTick}
            activeId={activeId}
            search={searchInput}
            sort={sort}
            tagFilter={tagFilter}
            setActiveAlbumId={(id) => {
              setActiveAlbumId(id)
              if (!id) setActiveId(null)
            }}
            onOpenMedia={setActiveId}
            onCreate={(title) =>
              void run(async () => {
                const album = await createAlbum(title)
                setActiveAlbumId(album.id)
              })
            }
            onRename={(id, title) => void run(() => renameAlbum(id, title).then(() => undefined))}
            onDelete={async (id) => {
              const album = albums.find((record) => record.id === id)
              const count = album?.images?.length ?? 0
              const ok = await confirm({
                title: `Delete this album${album ? ` — ${album.title}` : ''}?`,
                body:
                  count > 0
                    ? 'This album is deleted. Photos that only lived here are removed. Gallery and Portfolio stay as they are.'
                    : 'This album is deleted.',
                confirmLabel: 'Delete album',
                destructive: true,
              })
              if (!ok) return
              await run(async () => {
                await deleteAlbum(id)
                setActiveAlbumId(null)
                setActiveId(null)
              })
            }}
            onUpload={() => uploadRef.current?.click()}
            onRetry={retryPending}
            onDismissPending={dismissPending}
          />
        ) : null}

        {room === 'work' ? (
          <WorkView
            works={works}
            media={media}
            pending={workPending}
            loaded={loaded}
            cols={cols}
            activeWorkId={activeWorkId}
            createTick={workCreateTick}
            activeId={activeId}
            search={searchInput}
            sort={sort}
            tagFilter={tagFilter}
            websiteFilter={websiteFilter}
            setActiveWorkId={(id) => {
              setActiveWorkId(id)
              if (!id) setActiveId(null)
            }}
            onOpenMedia={setActiveId}
            onCreate={(title) =>
              void run(async () => {
                const work = await createWork({ title })
                setActiveWorkId(work.id)
              })
            }
            onUpdate={(id, data) => void run(() => updateWork(id, data).then(() => undefined))}
            onDelete={async (id) => {
              const work = works.find((record) => record.id === id)
              const live = work?.show_on_website
              const ok = await confirm({
                title: `Delete this Work${work ? ` — ${work.title}` : ''}?`,
                body: live
                  ? 'This Work is on the website — that page will stop. Photos that only lived here are removed. Gallery stays.'
                  : 'This Work is deleted. Photos that only lived here are removed. Gallery stays.',
                confirmLabel: 'Delete Work',
                destructive: true,
              })
              if (!ok) return
              await run(async () => {
                await deleteWork(id)
                setActiveWorkId(null)
                setActiveId(null)
              })
            }}
            onReorder={(ids) => void run(() => reorderWork(ids))}
            onUpload={() => uploadRef.current?.click()}
            onRetry={retryPending}
            onDismissPending={dismissPending}
          />
        ) : null}
      </div>

      {showWall && selectMode && selectedIds.length > 0 ? (
        <BulkSelectBar
          count={selectedIds.length}
          albums={albums}
          tags={tags}
          downloadBusy={downloadBusy}
          showAddToPortfolio={room === 'gallery'}
          onClear={clearSelection}
          onDownload={() => void bulkDownload()}
          onAddToPortfolio={() => void bulkAddToPortfolio()}
          onAddToAlbum={(albumId) => void bulkAddToAlbum(albumId)}
          onCreateAlbum={(title) => void bulkCreateAlbum(title)}
          onTag={(tagId) => void bulkTag(tagId)}
          onCreateTag={(name) => void bulkCreateTag(name)}
          onDelete={() => void bulkDelete()}
        />
      ) : null}

      {active ? (
        <ImageSheet
          item={active}
          albums={albums}
          works={works}
          tags={tags}
          deletePrompt={deletePrompt?.id === active.id ? deletePrompt : null}
          onClose={() => {
            setActiveId(null)
            setDeletePrompt(null)
          }}
          onSaveCaption={(caption) =>
            run(async () => {
              const rec = await updateMediaCaption(active.id, caption)
              setActiveRecord(rec)
              setWall((prev) => prev.map((item) => (item.id === rec.id ? rec : item)))
              setPortfolioOrder((prev) => prev.map((item) => (item.id === rec.id ? rec : item)))
            })
          }
          onAddToAlbum={(albumId) => void run(() => addMediaToAlbum(albumId, active.id).then(() => undefined))}
          onCreateAlbum={(title) =>
            void run(async () => {
              const album = await createAlbum(title)
              await addMediaToAlbum(album.id, active.id)
              setActiveAlbumId(album.id)
            })
          }
          onAddToWork={(workId) => void run(() => addMediaToWork(workId, active.id).then(() => undefined))}
          onCreateWork={(title) =>
            void run(async () => {
              const work = await createWork({ title, images: [active.id] })
              setActiveWorkId(work.id)
            })
          }
          onToggleTag={(tagId) =>
            void run(async () => {
              const current = active.tags ?? []
              const next = current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]
              await setMediaTags(active.id, next)
            })
          }
          onCreateTag={(name) =>
            void run(async () => {
              const tag = await createTag(name)
              const current = active.tags ?? []
              await setMediaTags(active.id, [...current, tag.id])
            })
          }
          onRequestDelete={() => void handleDelete(active.id)}
          onConfirmDelete={(mode) => void handleDelete(active.id, mode)}
          onCancelDelete={() => setDeletePrompt(null)}
          canOrganize={room === 'gallery'}
          lineOnWebsite={room === 'portfolio'}
          onAddToPortfolio={
            room === 'gallery' && mediaVault(active) === 'gallery' && !activeInPortfolio
              ? () =>
                  void run(async () => {
                    await promoteToPortfolio(active.id)
                    setActiveHasPortfolioCopy(true)
                  })
              : undefined
          }
          inPortfolio={activeInPortfolio}
          onUseAsCover={
            insideWork && activeWorkId
              ? () => void run(() => updateWork(activeWorkId, { cover: active.id }).then(() => undefined))
              : undefined
          }
          isCover={
            !!activeWork && (activeWork.cover === active.id || (!activeWork.cover && activeWork.images?.[0] === active.id))
          }
          onRemoveFromHere={
            insideAlbum && activeAlbumId
              ? {
                  label: 'Remove from this album',
                  onClick: () =>
                    void run(async () => {
                      await removeMediaFromAlbum(activeAlbumId, active.id)
                      setActiveId(null)
                    }),
                }
              : insideWork && activeWorkId
                ? {
                    label: 'Remove from this Work',
                    onClick: () =>
                      void run(async () => {
                        await removeMediaFromWork(activeWorkId, active.id)
                        setActiveId(null)
                      }),
                  }
                : room === 'portfolio'
                  ? {
                      label: 'Remove from Portfolio',
                      onClick: () => void handleDelete(active.id),
                    }
                  : undefined
          }
        />
      ) : null}

      {pickFor ? (
        <StudioImageGallery
          open
          title="From Gallery"
          tags={tags}
          galleryOnlyDefault
          onClose={() => setPickFor(null)}
          onDone={(ids) => {
            const dest = pickFor
            setPickFor(null)
            void run(async () => {
              if (dest === 'album' && activeAlbumId) {
                for (const id of ids) await addMediaToAlbum(activeAlbumId, id)
              }
              if (dest === 'work' && activeWorkId) {
                for (const id of ids) await addMediaToWork(activeWorkId, id)
              }
              if (dest === 'portfolio') {
                for (const id of ids) await promoteToPortfolio(id)
              }
            })
          }}
        />
      ) : null}

      {confirmDialog}
    </StudioHubShell>
  )
}
