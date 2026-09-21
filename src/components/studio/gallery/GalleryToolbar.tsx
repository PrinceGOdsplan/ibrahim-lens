import type { LucideIcon } from 'lucide-react'
import { BookOpen, CheckSquare, FolderOpen, Globe, Images, LayoutGrid, ListOrdered, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { StudioIcon, StudioIconButton, StudioTextIconButton } from '@/components/studio/StudioIconButton'
import { StudioHubHeader } from '@/components/studio/StudioHubHeader'
import { StudioTabs } from '@/components/studio/StudioTabs'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { TagRecord } from '@/lib/library'
import { cn } from '@/lib/utils'

export type GalleryRoom = 'gallery' | 'portfolio' | 'albums' | 'work'
export type PortfolioView = 'wall' | 'order'
export type SortMode = 'date' | 'name' | 'tag'

const ROOMS: { id: GalleryRoom; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'gallery', label: 'Gallery', hint: 'All your photos', icon: Images },
  { id: 'portfolio', label: 'Portfolio', hint: 'Photos on your website', icon: Globe },
  { id: 'albums', label: 'Albums', hint: 'For a shoot or a client', icon: FolderOpen },
  { id: 'work', label: 'Work', hint: 'Work on the website', icon: BookOpen },
]

const PORTFOLIO_VIEWS: { id: PortfolioView; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'wall', label: 'Photos', hint: 'Portfolio photos', icon: LayoutGrid },
  { id: 'order', label: 'Website order', hint: 'How they show on your website', icon: ListOrdered },
]

export function GalleryToolbar({
  room,
  onRoom,
  portfolioView,
  onPortfolioView,
  showAdd,
  onAdd,
  onPickFromPile,
  search,
  onSearch,
  arrangeOpen,
  onArrange,
  arrangeMark,
  sort,
  onSort,
  tagFilter,
  onTagFilter,
  tags,
  cols,
  onCols,
  colsMin,
  colsMax,
  collectionPhotoWall,
  collectionIndex,
  websiteFilter,
  onWebsiteFilter,
  selectMode,
  onSelectMode,
}: {
  room: GalleryRoom
  onRoom: (room: GalleryRoom) => void
  portfolioView: PortfolioView
  onPortfolioView: (view: PortfolioView) => void
  showAdd: boolean
  onAdd: () => void
  onPickFromPile?: () => void
  search: string
  onSearch: (value: string) => void
  arrangeOpen: boolean
  onArrange: () => void
  arrangeMark: boolean
  sort: SortMode
  onSort: (sort: SortMode) => void
  tagFilter: string
  onTagFilter: (tagId: string) => void
  tags: TagRecord[]
  cols: number
  onCols: (cols: number) => void
  colsMin: number
  colsMax: number
  collectionPhotoWall?: boolean
  collectionIndex?: boolean
  websiteFilter?: '' | 'site' | 'private'
  onWebsiteFilter?: (value: '' | 'site' | 'private') => void
  selectMode?: boolean
  onSelectMode?: () => void
}) {
  const galleryWall = room === 'gallery' || (room === 'portfolio' && portfolioView === 'wall')
  const photoWall = galleryWall || !!collectionPhotoWall
  const showSearch = photoWall || !!collectionIndex || room === 'portfolio'
  const showFilter = photoWall || !!collectionIndex || room === 'portfolio'
  const showCols = photoWall || !!collectionIndex
  const searchPlaceholder = collectionIndex
    ? room === 'work'
      ? 'Find a Work'
      : 'Find an album'
    : 'Find a photo'

  const searchField = showSearch ? (
    <label className="flex min-w-[8rem] max-w-xs flex-1 items-center gap-2 text-studio-muted">
      <StudioIcon icon={Search} className="h-3.5 w-3.5 shrink-0" />
      <span className="sr-only">{searchPlaceholder}</span>
      <Input
        id="gallery-search"
        type="search"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder={searchPlaceholder}
        className="min-w-0 flex-1"
      />
    </label>
  ) : null

  const toolButtons = (
    <>
      {showFilter ? (
        <StudioIconButton
          label="Arrange"
          icon={SlidersHorizontal}
          active={arrangeOpen}
          mark={arrangeMark}
          onClick={onArrange}
        />
      ) : null}
      {galleryWall && onSelectMode ? (
        <StudioIconButton label="Select" icon={CheckSquare} active={selectMode} onClick={onSelectMode} />
      ) : null}
    </>
  )

  return (
    <StudioHubHeader
      title="Gallery"
      actions={
        showAdd ? (
          <>
            {onPickFromPile ? (
              <StudioTextIconButton label="From Gallery" icon={Images} onClick={onPickFromPile} className="text-studio-muted" />
            ) : null}
            <StudioTextIconButton label="Add" icon={Plus} onClick={onAdd} />
          </>
        ) : undefined
      }
    >
      <div className="mt-3">
        <StudioTabs value={room} onChange={onRoom} aria-label="Gallery rooms" primary={ROOMS} />
      </div>

      {room === 'portfolio' ? (
        <div className="mt-2 flex items-end gap-1 border-b border-studio-border">
          <StudioTabs
            value={portfolioView}
            onChange={onPortfolioView}
            aria-label="Portfolio surface"
            primary={PORTFOLIO_VIEWS}
            className="min-w-0 flex-1 border-b-0"
          />
          <div className="mb-1 min-w-0 max-w-[14rem] flex-1">{searchField}</div>
          <div className="mb-0.5 flex shrink-0 items-center">{toolButtons}</div>
        </div>
      ) : null}

      {room !== 'portfolio' && (showSearch || photoWall) ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {searchField}
          {toolButtons}
        </div>
      ) : null}

      {(photoWall || collectionIndex || room === 'portfolio') && arrangeOpen ? (
        <div className={cn('mt-3 flex flex-wrap items-center gap-3 text-xs')}>
          <label className="flex items-center gap-1.5 text-studio-muted">
            Sort
            <Select
              variant="toolbar"
              value={collectionIndex && sort === 'tag' ? 'name' : sort}
              onChange={(event) => onSort(event.target.value as SortMode)}
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              {photoWall ? <option value="tag">Tag</option> : null}
            </Select>
          </label>
          {photoWall ? (
            <label className="flex items-center gap-1.5 text-studio-muted">
              Tag
              <Select
                variant="toolbar"
                value={tagFilter}
                onChange={(event) => onTagFilter(event.target.value)}
              >
                <option value="">All</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}
          {collectionIndex && room === 'work' && onWebsiteFilter ? (
            <label className="flex items-center gap-1.5 text-studio-muted">
              Website
              <Select
                variant="toolbar"
                value={websiteFilter ?? ''}
                onChange={(event) => onWebsiteFilter(event.target.value as '' | 'site' | 'private')}
              >
                <option value="">All</option>
                <option value="site">On the website</option>
                <option value="private">Private</option>
              </Select>
            </label>
          ) : null}
          {showCols ? (
            <label className="ml-auto flex items-center gap-2 text-studio-muted">
              Columns
              <input
                type="range"
                min={colsMin}
                max={colsMax}
                value={cols}
                onChange={(event) => onCols(Number(event.target.value))}
                className="w-24 accent-studio-fg"
                aria-label="Column density"
              />
              <span className="w-4 tabular-nums text-studio-fg">{cols}</span>
            </label>
          ) : null}
        </div>
      ) : null}
    </StudioHubHeader>
  )
}
