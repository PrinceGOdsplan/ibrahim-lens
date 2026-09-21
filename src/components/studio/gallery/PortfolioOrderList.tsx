import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudioIcon } from '@/components/studio/StudioIconButton'
import { mediaLabel, mediaThumbUrl, type MediaRecord } from '@/lib/library'

export function PortfolioOrderList({
  items,
  onOpen,
  onReorder,
  onRemove,
}: {
  items: MediaRecord[]
  onOpen: (id: string) => void
  onReorder: (ids: string[]) => void
  onRemove: (id: string) => void
}) {
  function move(id: string, direction: -1 | 1) {
    const ids = items.map((photo) => photo.id)
    const index = ids.indexOf(id)
    const next = index + direction
    if (index < 0 || next < 0 || next >= ids.length) return
    ;[ids[index], ids[next]] = [ids[next], ids[index]]
    onReorder(ids)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 border border-studio-border bg-studio-panel p-2">
          <button type="button" onClick={() => onOpen(item.id)} className="shrink-0" aria-label={mediaLabel(item)}>
            <img
              src={mediaThumbUrl(item, '200x200')}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-14 w-14 object-cover"
            />
          </button>
          <div className="min-w-0 flex-1 basis-40 truncate text-sm">{mediaLabel(item)}</div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="min-h-11 min-w-11"
              disabled={index === 0}
              onClick={() => move(item.id, -1)}
              aria-label={`Earlier on the website`}
            >
              <StudioIcon icon={ChevronUp} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="min-h-11 min-w-11"
              disabled={index === items.length - 1}
              onClick={() => move(item.id, 1)}
              aria-label={`Later on the website`}
            >
              <StudioIcon icon={ChevronDown} />
            </Button>
            <Button size="sm" variant="ghost" className="min-h-11 min-w-11" onClick={() => onRemove(item.id)} aria-label="Take off the website">
              <StudioIcon icon={Trash2} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
