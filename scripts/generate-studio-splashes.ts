import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

function crc32(buf: Buffer) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]!
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type: string, data: Buffer) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

/** Solid #F7F7F5 RGB PNG (no alpha). */
function solidPng(w: number, h: number) {
  const r = 0xf7
  const g = 0xf7
  const b = 0xf5
  const row = Buffer.alloc(1 + w * 3)
  for (let x = 0; x < w; x++) {
    row[1 + x * 3] = r
    row[2 + x * 3] = g
    row[3 + x * 3] = b
  }
  const raw = Buffer.alloc((1 + w * 3) * h)
  for (let y = 0; y < h; y++) row.copy(raw, y * row.length)
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const out = join('public', 'studio')
const sizes: [number, number][] = [
  [1170, 2532],
  [1179, 2556],
  [1206, 2622],
  [1290, 2796],
  [1320, 2868],
]
for (const [w, h] of sizes) {
  const path = join(out, `splash-${w}x${h}.png`)
  writeFileSync(path, solidPng(w, h))
  console.log('wrote', path)
}
