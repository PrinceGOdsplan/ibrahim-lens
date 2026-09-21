const DEFAULT_MAX_UPLOAD_MB = 25

export function getMaxUploadMb(): number {
  const raw = import.meta.env.VITE_MAX_UPLOAD_MB ?? import.meta.env.MAX_UPLOAD_MB
  const n = Number(raw ?? DEFAULT_MAX_UPLOAD_MB)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_UPLOAD_MB
}

export function getMaxUploadBytes(): number {
  return getMaxUploadMb() * 1024 * 1024
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
