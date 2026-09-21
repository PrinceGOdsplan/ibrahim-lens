import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'studio')
mkdirSync(dir, { recursive: true })

function crc32(buf: Buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let b = 0; b < 8; b++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size: number, r: number, g: number, b: number) {
  const raw = Buffer.alloc((size * 3 + 1) * size)
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x++) {
      const cx = x + 0.5 - size / 2
      const cy = y + 0.5 - size / 2
      const dist = Math.hypot(cx, cy)
      const ring = Math.abs(dist - size * 0.28) < size * 0.04
      const dot = dist < size * 0.08
      const i = row + 1 + x * 3
      if (ring || dot) {
        raw[i] = 201
        raw[i + 1] = 146
        raw[i + 2] = 46
      } else {
        raw[i] = r
        raw[i + 1] = g
        raw[i + 2] = b
      }
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

writeFileSync(path.join(dir, 'icon-192.png'), png(192, 247, 247, 245))
writeFileSync(path.join(dir, 'icon-512.png'), png(512, 247, 247, 245))
console.log('Wrote public/studio/icon-192.png and icon-512.png')
