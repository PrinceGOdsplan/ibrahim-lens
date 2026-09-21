import type { MediaUploadDest } from '@/lib/library'

export type PendingPhoto = {
  id: string
  file: File
  preview: string
  name: string
  dest: MediaUploadDest
  status: 'queued' | 'uploading' | 'error'
  reason?: string
}

export function destKey(dest: MediaUploadDest) {
  if (dest.albumId) return `album:${dest.albumId}`
  if (dest.workId) return `work:${dest.workId}`
  if (dest.vault === 'portfolio') return 'portfolio'
  return 'gallery'
}

export function looksLikeCameraName(name: string) {
  const stem = name.replace(/\.[^.]+$/, '').trim()
  return /^(IMG[_-]?|DSC[_N]?|DCIM|PXL[_-]|WA[_-]|Screenshot|image[-_ ]?\d|PHOTO[-_ ]?\d|PIC[-_ ]?\d)/i.test(stem)
}

export function pendingForDest(items: PendingPhoto[], dest: MediaUploadDest) {
  const key = destKey(dest)
  return items.filter((item) => destKey(item.dest) === key)
}
