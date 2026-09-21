import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  SectionSaveBar,
  StudioSection,
  quietTextareaClass,
  useAccordion,
  useSectionSave,
} from '@/components/studio/StudioSection'
import { OpenPublicPageLink } from '@/components/studio/website/shared'
import { getMaxUploadMb } from '@/lib/config'
import {
  deleteHeldIfOrphan,
  mediaThumbUrl,
  mediaVault,
  replaceArtistPortrait,
  setArtistPortrait,
  validateImageFile,
  prepareImageFile,
  type MediaRecord,
} from '@/lib/library'
import type { WebsiteGlobals, WebsiteGlobalsPatch } from '@/lib/website'

type Props = {
  globals: WebsiteGlobals
  artistPortrait: MediaRecord | null
  busy: boolean
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
  onRefresh: () => Promise<void>
}

export function AboutTab({ globals, artistPortrait, busy, onSave, onRefresh }: Props) {
  const { openId, toggle } = useAccordion('story')
  const fileRef = useRef<HTMLInputElement>(null)
  const storySave = useSectionSave()
  const photoSave = useSectionSave()
  const [subtitle, setSubtitle] = useState(globals.about_subtitle ?? '')
  const [body, setBody] = useState(globals.about_body ?? '')
  const [photoError, setPhotoError] = useState<string | null>(null)

  useEffect(() => {
    setSubtitle(globals.about_subtitle ?? '')
    setBody(globals.about_body ?? '')
    storySave.reset()
  }, [globals.updated, globals.about_subtitle, globals.about_body])

  const storyDirty = subtitle !== (globals.about_subtitle ?? '') || body !== (globals.about_body ?? '')

  async function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.files?.[0]
    event.target.value = ''
    if (!raw) return
    const file = prepareImageFile(raw)
    const reason = validateImageFile(file)
    if (reason) {
      setPhotoError(reason)
      return
    }
    setPhotoError(null)
    await photoSave.runSave(async () => {
      await replaceArtistPortrait(file)
      await onRefresh()
    })
  }

  return (
    <section className="space-y-2">
      <div className="mb-3 flex justify-end">
        <OpenPublicPageLink href="/about" label="Open About" />
      </div>

      <StudioSection id="story" title="About text" open={openId === 'story'} onToggle={toggle}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="about-subtitle" className="text-xs text-studio-muted">
              Line under your name (optional)
            </Label>
            <Input
              id="about-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Photographer, Lagos"
            />
          </div>
          <div>
            <Label htmlFor="about-body" className="text-xs text-studio-muted">
              About text
            </Label>
            <textarea
              id="about-body"
              className={quietTextareaClass + ' min-h-36'}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
        <SectionSaveBar
          status={storySave.status}
          error={storySave.error}
          dirty={storyDirty}
          onSave={() => storySave.runSave(() => onSave({ about_subtitle: subtitle, about_body: body }))}
        />
      </StudioSection>

      <StudioSection id="photo" title="About photo" open={openId === 'photo'} onToggle={toggle}>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(e) => void onPickFile(e)}
        />
        {artistPortrait ? (
          <div className="flex items-center gap-3">
            <img src={mediaThumbUrl(artistPortrait, '200x200')} alt="" className="h-14 w-14 rounded object-cover" />
            <div className="flex flex-wrap gap-3 text-xs">
              <button
                type="button"
                className="text-studio-accent hover:opacity-80 disabled:opacity-50"
                disabled={busy || photoSave.status === 'saving'}
                onClick={() => fileRef.current?.click()}
              >
                {photoSave.status === 'saving' ? 'Uploading…' : 'Replace'}
              </button>
              <button
                type="button"
                className="text-studio-muted hover:text-studio-danger disabled:opacity-50"
                disabled={busy || photoSave.status === 'saving'}
                onClick={() =>
                  photoSave.runSave(async () => {
                    const current = artistPortrait
                    await setArtistPortrait(null)
                    if (current && mediaVault(current) === 'held') await deleteHeldIfOrphan(current.id)
                    await onRefresh()
                  })
                }
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="text-xs text-studio-accent hover:opacity-80 disabled:opacity-50"
            disabled={busy || photoSave.status === 'saving'}
            onClick={() => fileRef.current?.click()}
          >
            {photoSave.status === 'saving' ? 'Uploading…' : `Upload photo · JPEG, PNG, or WebP · max ${getMaxUploadMb()}MB`}
          </button>
        )}
        {photoError ? <p className="mt-2 text-xs text-studio-danger">{photoError}</p> : null}
        {photoSave.status === 'saved' ? (
          <p role="status" className="mt-2 text-xs text-studio-accent">
            Saved
          </p>
        ) : null}
        {photoSave.status === 'error' ? <p className="mt-2 text-xs text-studio-danger">{photoSave.error}</p> : null}
      </StudioSection>
    </section>
  )
}
