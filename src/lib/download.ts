/** Uncompressed ZIP (STORE). JPEGs are already compressed; this packs them into one file. */

const CRC_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  CRC_TABLE[i] = c >>> 0
}

function crc32(data: Uint8Array) {
  let c = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function u16(n: number) {
  const b = new Uint8Array(2)
  new DataView(b.buffer).setUint16(0, n, true)
  return b
}

function u32(n: number) {
  const b = new Uint8Array(4)
  new DataView(b.buffer).setUint32(0, n, true)
  return b
}

function concat(parts: Uint8Array[]) {
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

export function zipStore(files: { name: string; data: Uint8Array }[]) {
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const name = new TextEncoder().encode(file.name)
    const crc = crc32(file.data)
    const size = file.data.length
    const local = concat([
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(size),
      u32(size),
      u16(name.length),
      u16(0),
      name,
      file.data,
    ])
    const central = concat([
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(size),
      u32(size),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ])
    locals.push(local)
    centrals.push(central)
    offset += local.length
  }

  const centralDir = concat(centrals)
  const eocd = concat([
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ])

  return new Blob([concat([...locals, centralDir, eocd])], { type: 'application/zip' })
}

const IMAGE_EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
}

export function isIosDevice() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

function mimeForImage(blob: Blob, filename: string) {
  if (blob.type.startsWith('image/')) return blob.type
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXT_MIME[ext] || ''
}

export function imageFileFromBlob(blob: Blob, filename: string) {
  const type = mimeForImage(blob, filename)
  if (!type) return null
  return new File([blob], filename, { type })
}

export function canShareImage(file: File) {
  if (typeof navigator.share !== 'function') return false
  try {
    return typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] })
  } catch {
    return false
  }
}

/** iPhone/iPad can put a photo in the gallery only through the share sheet. */
export function iosSavesImagesViaShare() {
  if (!isIosDevice() || typeof navigator.share !== 'function') return false
  try {
    const probe = new File([new Blob(['x'], { type: 'image/jpeg' })], 'photo.jpg', { type: 'image/jpeg' })
    return canShareImage(probe)
  } catch {
    return true
  }
}

function isUserAbort(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError'
}

function isLostActivation(err: unknown) {
  return err instanceof DOMException && err.name === 'NotAllowedError'
}

export type SaveImageResult = { status: 'done' } | { status: 'needs-gesture'; file: File }

export async function shareImageFile(file: File): Promise<'done' | 'needs-gesture'> {
  try {
    await navigator.share({ files: [file], title: file.name })
    return 'done'
  } catch (err) {
    if (isUserAbort(err)) return 'done'
    if (isLostActivation(err)) return 'needs-gesture'
    throw err
  }
}

/**
 * Save a photograph to the device. On iPhone this opens Share so the photo can
 * go to Photos; a plain download always lands in Files.
 */
export async function saveImageToDevice(blob: Blob, filename: string): Promise<SaveImageResult> {
  const file = imageFileFromBlob(blob, filename)
  if (file && isIosDevice() && canShareImage(file)) {
    try {
      const status = await shareImageFile(file)
      if (status === 'needs-gesture') return { status, file }
      return { status: 'done' }
    } catch {
      /* fall through to a Files download */
    }
  }
  saveBlob(blob, filename)
  return { status: 'done' }
}

export function saveBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2_000)
}

export async function fetchAsBlob(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Download failed.')
  return res.blob()
}

export function photographDownloadName(file: string | undefined, index: number) {
  const match = file?.match(/\.(jpe?g|png|webp)$/i)
  const ext = match ? match[0].toLowerCase().replace('jpeg', 'jpg') : '.jpg'
  return `photograph-${index + 1}${ext}`
}
