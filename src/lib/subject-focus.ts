import { mediaThumbUrl, type MediaRecord } from '@/lib/library'

export type SubjectFocus = { x: number; y: number }

const cache = new Map<string, SubjectFocus>()

function clamp(n: number) {
  return Math.min(100, Math.max(0, n))
}

/** Stored photographer focus, if both axes are set. */
export function storedSubjectFocus(record: Pick<MediaRecord, 'focal_x' | 'focal_y'>): SubjectFocus | null {
  const x = Number(record.focal_x)
  const y = Number(record.focal_y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return { x: clamp(x), y: clamp(y) }
}

/** Heads sit high in portraits; landscapes stay centered until a subject is found. */
export function fallbackSubjectFocus(width = 0, height = 0): SubjectFocus {
  if (height > width * 1.1) return { x: 50, y: 28 }
  return { x: 50, y: 50 }
}

export function objectPosition(focus: SubjectFocus) {
  return `${focus.x}% ${focus.y}%`
}

type FaceBox = { x: number; y: number; width: number; height: number }
type FaceHit = { boundingBox: FaceBox }
type FaceDetectorLike = { detect: (image: ImageBitmapSource) => Promise<FaceHit[]> }

function getFaceDetector(): FaceDetectorLike | null {
  const Ctor = (
    window as unknown as {
      FaceDetector?: new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => FaceDetectorLike
    }
  ).FaceDetector
  if (!Ctor) return null
  try {
    return new Ctor({ fastMode: true, maxDetectedFaces: 8 })
  } catch {
    return null
  }
}

function loadCorsImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function area(box: FaceBox) {
  return box.width * box.height
}

async function detectByFace(img: HTMLImageElement): Promise<SubjectFocus | null> {
  const detector = getFaceDetector()
  if (!detector) return null
  try {
    const faces = await detector.detect(img)
    if (!faces.length) return null
    const main = faces.reduce((best, face) => (area(face.boundingBox) > area(best.boundingBox) ? face : best))
    const box = main.boundingBox
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    if (!w || !h) return null
    return {
      x: clamp(((box.x + box.width / 2) / w) * 100),
      y: clamp(((box.y + box.height * 0.6) / h) * 100),
    }
  } catch {
    return null
  }
}

/** Pin to the busiest region — usually the person against a quieter ground. */
function detectBySaliency(img: HTMLImageElement): SubjectFocus | null {
  const nw = img.naturalWidth || img.width
  const nh = img.naturalHeight || img.height
  if (!nw || !nh) return null
  const long = 72
  const scale = long / Math.max(nw, nh)
  const w = Math.max(8, Math.round(nw * scale))
  const h = Math.max(8, Math.round(nh * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, w, h)
  let pixels: Uint8ClampedArray
  try {
    pixels = ctx.getImageData(0, 0, w, h).data
  } catch {
    return null
  }

  const gray = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const o = i * 4
    gray[i] = 0.299 * pixels[o] + 0.587 * pixels[o + 1] + 0.114 * pixels[o + 2]
  }

  const energy = new Float32Array(w * h)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx =
        -gray[i - w - 1] +
        gray[i - w + 1] -
        2 * gray[i - 1] +
        2 * gray[i + 1] -
        gray[i + w - 1] +
        gray[i + w + 1]
      const gy =
        -gray[i - w - 1] -
        2 * gray[i - w] -
        gray[i - w + 1] +
        gray[i + w - 1] +
        2 * gray[i + w] +
        gray[i + w + 1]
      energy[i] = Math.hypot(gx, gy)
    }
  }

  // Portraits: prefer the upper body (faces sit high). Landscapes: mild centre bias.
  // Ignore the extreme edges — wall frames and clothing hems sit there more often than faces.
  const portrait = nh > nw * 1.1
  const cy = portrait ? 0.28 : 0.5
  const sigma = portrait ? 0.18 : 0.32

  function inset(t: number, margin = 0.14) {
    if (t < margin) return t / margin
    if (t > 1 - margin) return (1 - t) / margin
    return 1
  }

  let best = 0
  let bx = (w - 1) / 2
  let by = (h - 1) / 2
  const r = 2
  for (let y = r; y < h - r; y++) {
    const yn = y / (h - 1)
    const yWeight = Math.exp(-((yn - cy) ** 2) / (2 * sigma * sigma)) * inset(yn)
    for (let x = r; x < w - r; x++) {
      const xn = x / (w - 1)
      let sum = 0
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) sum += energy[(y + dy) * w + (x + dx)]
      }
      const score = sum * yWeight * inset(xn)
      if (score > best) {
        best = score
        bx = x
        by = y
      }
    }
  }
  if (best < 1) return null
  return { x: clamp((bx / (w - 1)) * 100), y: clamp((by / (h - 1)) * 100) }
}

/**
 * Find the main person in a photograph and return the image point that
 * `object-position` should pin to the centre of the crop.
 */
export async function detectSubjectFocus(record: MediaRecord): Promise<SubjectFocus | null> {
  const stored = storedSubjectFocus(record)
  if (stored) return stored
  const cached = cache.get(record.id)
  if (cached) return cached

  const src = mediaThumbUrl(record, '1200x0')
  if (!src) return null
  const img = await loadCorsImage(src)
  if (!img) return null

  const focus = (await detectByFace(img)) ?? detectBySaliency(img)
  if (focus) cache.set(record.id, focus)
  return focus
}
