import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { StudioIcon } from '@/components/studio/StudioIconButton'
import type { PendingPhoto } from '@/components/studio/gallery/pending'

export function RenameStrip({
  items,
  onName,
  onKeep,
}: {
  items: PendingPhoto[]
  onName: (id: string, name: string) => void
  onKeep: () => void
}) {
  if (!items.length) return null

  return (
    <div className="border-b border-studio-border bg-studio-panel px-5 py-2.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs text-studio-muted">These still have camera names</p>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-1.5 text-xs text-studio-muted hover:text-studio-fg"
          onClick={onKeep}
        >
          <StudioIcon icon={X} className="h-3.5 w-3.5" />
          Keep names
        </button>
      </div>
      <ul className="max-h-36 space-y-1.5 overflow-auto overscroll-contain">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <img src={item.preview} alt="" className="h-10 w-10 shrink-0 object-cover" />
            <Input
              value={item.name}
              disabled={item.status === 'uploading'}
              aria-label="Photo name"
              placeholder="e.g. Ada at the garden"
              onChange={(event) => onName(item.id, event.target.value)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
