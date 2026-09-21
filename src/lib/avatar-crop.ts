/** Square avatar crop helpers — pan/zoom in the UI, export a JPEG blob. */

import { readStudioAppearance, STUDIO_THEME_LIGHT, STUDIO_THEME_NIGHT } from '@/lib/studio-appearance'

export type CropView = {
  /** Image natural size */
  naturalW: number
  naturalH: number
  /** Zoom ≥ 1 relative to “cover” the crop square */
  zoom: number
  /** Pan of image centre relative to crop centre, in crop-square pixels (CSS) */
  offsetX: number
  offsetY: number
}

export function coverScale(naturalW: number, naturalH: number, cropSize: number) {
  return Math.max(cropSize / naturalW, cropSize / naturalH)
}

export function clampOffsets(view: CropView, cropSize: number): CropView {
  const base = coverScale(view.naturalW, view.naturalH, cropSize)
  const scale = base * view.zoom
  const dispW = view.naturalW * scale
  const dispH = view.naturalH * scale
  const maxX = Math.max(0, (dispW - cropSize) / 2)
  const maxY = Math.max(0, (dispH - cropSize) / 2)
  return {
    ...view,
    offsetX: Math.min(maxX, Math.max(-maxX, view.offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, view.offsetY)),
  }
}

export async function loadImageFromFile(file: File): Promise<{ image: HTMLImageElement; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(file)
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read that image.'))
    }
    el.src = objectUrl
  })
  return { image, objectUrl }
}

/** Render the circular/square crop to a JPEG File for upload. */
export async function exportAvatarCrop(
  image: HTMLImageElement,
  view: CropView,
  cropSizeCss: number,
  outputSize = 512,
): Promise<File> {
  const clamped = clampOffsets(view, cropSizeCss)
  const base = coverScale(clamped.naturalW, clamped.naturalH, cropSizeCss)
  const scale = base * clamped.zoom
  const dispW = clamped.naturalW * scale
  const dispH = clamped.naturalH * scale
  const left = cropSizeCss / 2 - dispW / 2 + clamped.offsetX
  const top = cropSizeCss / 2 - dispH / 2 + clamped.offsetY

  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not crop this image.')

  const ratio = outputSize / cropSizeCss
  ctx.fillStyle =
    readStudioAppearance() === 'night' ? STUDIO_THEME_NIGHT : STUDIO_THEME_LIGHT
  ctx.fillRect(0, 0, outputSize, outputSize)
  ctx.drawImage(image, left * ratio, top * ratio, dispW * ratio, dispH * ratio)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not encode the photo.'))),
      'image/jpeg',
      0.92,
    )
  })
  return new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
}
