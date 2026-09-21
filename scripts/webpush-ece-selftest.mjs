/**
 * Self-test for the JSVM Web Push aes128gcm stack (same algorithms as 00_vapid.pb.js).
 * Run: node scripts/webpush-ece-selftest.mjs
 */
import crypto from 'node:crypto'
import assert from 'node:assert/strict'

function rotr(n, x) {
  return ((x >>> n) | (x << (32 - n))) >>> 0
}

function sha256(msg) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]
  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19
  const bitLen = msg.length * 8
  const pad = msg.slice()
  pad.push(0x80)
  while (pad.length % 64 !== 56) pad.push(0)
  for (let i = 0; i < 4; i++) pad.push(0)
  pad.push((bitLen >>> 24) & 255, (bitLen >>> 16) & 255, (bitLen >>> 8) & 255, bitLen & 255)
  for (let off = 0; off < pad.length; off += 64) {
    const w = new Array(64)
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4
      w[i] = ((pad[j] << 24) | (pad[j + 1] << 16) | (pad[j + 2] << 8) | pad[j + 3]) >>> 0
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3)
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0
    }
    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    let f = h5
    let g = h6
    let h = h7
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e)
      const ch = (e & f) ^ (~e & g)
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (S0 + maj) >>> 0
      h = g
      g = f
      f = e
      e = (d + t1) >>> 0
      d = c
      c = b
      b = a
      a = (t1 + t2) >>> 0
    }
    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + h) >>> 0
  }
  const out = []
  for (const v of [h0, h1, h2, h3, h4, h5, h6, h7]) {
    out.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255)
  }
  return out
}

function hmacSha256(key, data) {
  const block = 64
  let k = key.slice()
  if (k.length > block) k = sha256(k)
  while (k.length < block) k.push(0)
  const opad = k.map((b) => b ^ 0x5c)
  const ipad = k.map((b) => b ^ 0x36)
  return sha256(opad.concat(sha256(ipad.concat(data))))
}

function hkdf(salt, ikm, info, len) {
  const prk = hmacSha256(salt, ikm)
  const out = []
  let t = []
  let i = 0
  while (out.length < len) {
    i += 1
    t = hmacSha256(prk, t.concat(info, [i]))
    for (let j = 0; j < t.length && out.length < len; j++) out.push(t[j])
  }
  return out
}

const SBOX = [
  99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173,
  212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199,
  35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41,
  227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51,
  133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210,
  205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238,
  184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109,
  141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75,
  189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217,
  142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187,
  22,
]

function xtime(a) {
  a &= 255
  return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 255
}

function mixCol(s, i) {
  const a = s[i]
  const b = s[i + 1]
  const c = s[i + 2]
  const d = s[i + 3]
  const e = a ^ b ^ c ^ d
  s[i] ^= e ^ xtime(a ^ b)
  s[i + 1] ^= e ^ xtime(b ^ c)
  s[i + 2] ^= e ^ xtime(c ^ d)
  s[i + 3] ^= e ^ xtime(d ^ a)
}

function aesKeyExpand(key) {
  const w = key.slice()
  let rc = 1
  for (let i = 16; i < 176; i += 4) {
    let t = w.slice(i - 4, i)
    if (i % 16 === 0) {
      t = [SBOX[t[1]] ^ rc, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]]
      rc = xtime(rc)
    }
    for (let j = 0; j < 4; j++) w[i + j] = w[i - 16 + j] ^ t[j]
  }
  return w
}

function aesEncryptBlock(exp, input) {
  const s = input.slice()
  for (let i = 0; i < 16; i++) s[i] ^= exp[i]
  for (let round = 1; round <= 10; round++) {
    for (let i = 0; i < 16; i++) s[i] = SBOX[s[i]]
    const t = s.slice()
    s[1] = t[5]
    s[5] = t[9]
    s[9] = t[13]
    s[13] = t[1]
    s[2] = t[10]
    s[6] = t[14]
    s[10] = t[2]
    s[14] = t[6]
    s[3] = t[15]
    s[7] = t[3]
    s[11] = t[7]
    s[15] = t[11]
    if (round !== 10) {
      mixCol(s, 0)
      mixCol(s, 4)
      mixCol(s, 8)
      mixCol(s, 12)
    }
    const off = round * 16
    for (let i = 0; i < 16; i++) s[i] ^= exp[off + i]
  }
  return s
}

function bytesToBig(b) {
  let n = 0n
  for (const x of b) n = (n << 8n) + BigInt(x)
  return n
}

function bigToBytes(n, len) {
  const out = new Array(len)
  let x = n
  for (let i = len - 1; i >= 0; i--) {
    out[i] = Number(x & 255n)
    x >>= 8n
  }
  return out
}

function gfMul(x, y) {
  let z = 0n
  let v = y
  for (let i = 0; i < 128; i++) {
    if ((x >> BigInt(127 - i)) & 1n) z ^= v
    const lsb = v & 1n
    v >>= 1n
    if (lsb) v ^= 0xe1000000000000000000000000000000n
  }
  return z
}

function ghash(h, ciphertext) {
  const H = bytesToBig(h)
  let y = 0n
  const padded = ciphertext.slice()
  while (padded.length % 16 !== 0) padded.push(0)
  for (let i = 0; i < padded.length; i += 16) {
    y = gfMul(y ^ bytesToBig(padded.slice(i, i + 16)), H)
  }
  const lenBlock = bigToBytes(0n, 8).concat(bigToBytes(BigInt(ciphertext.length * 8), 8))
  y = gfMul(y ^ bytesToBig(lenBlock), H)
  return bigToBytes(y, 16)
}

function inc32(block) {
  const out = block.slice()
  for (let i = 15; i >= 12; i--) {
    out[i] = (out[i] + 1) & 255
    if (out[i] !== 0) break
  }
  return out
}

function xor16(a, b) {
  return a.map((v, i) => v ^ b[i])
}

function aesGcmEncrypt(key, nonce12, plaintext) {
  const exp = aesKeyExpand(key)
  const H = aesEncryptBlock(exp, new Array(16).fill(0))
  const j0 = nonce12.concat([0, 0, 0, 1])
  let ctr = inc32(j0)
  const ciphertext = []
  for (let i = 0; i < plaintext.length; i += 16) {
    const ks = aesEncryptBlock(exp, ctr)
    ctr = inc32(ctr)
    const chunk = plaintext.slice(i, i + 16)
    for (let j = 0; j < chunk.length; j++) ciphertext.push(chunk[j] ^ ks[j])
  }
  const s = ghash(H, ciphertext)
  const tag = xor16(aesEncryptBlock(exp, j0), s)
  return ciphertext.concat(tag)
}

function encryptWebPush(userPublic, userAuth, plaintext) {
  const local = crypto.createECDH('prime256v1')
  const localPub = [...local.generateKeys()]
  const shared = [...local.computeSecret(Buffer.from(userPublic))]
  const salt = [...crypto.randomBytes(16)]
  const prkInfo = [...Buffer.from('WebPush: info\0', 'ascii'), ...userPublic, ...localPub]
  const ikm = hkdf(userAuth, shared, prkInfo, 32)
  const cek = hkdf(salt, ikm, [...Buffer.from('Content-Encoding: aes128gcm\0', 'ascii')], 16)
  const nonce = hkdf(salt, ikm, [...Buffer.from('Content-Encoding: nonce\0', 'ascii')], 12)
  const padded = plaintext.concat([2])
  const encrypted = aesGcmEncrypt(cek, nonce, padded)
  return salt.concat([0, 0, 16, 0, 65], localPub, encrypted)
}

// --- tests ---
const aesVec = aesEncryptBlock(
  aesKeyExpand([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
  [0, 17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187, 204, 221, 238, 255],
)
assert.equal(
  Buffer.from(aesVec).toString('hex'),
  '69c4e0d86a7b0430d8cdb78070b4c55a',
)

const hello = [...Buffer.from('abc')]
const digest = Buffer.from(sha256(hello)).toString('hex')
assert.equal(digest, crypto.createHash('sha256').update('abc').digest('hex'))

const hk = Buffer.from(hkdf([...Buffer.from('salt')], [...Buffer.from('ikm')], [...Buffer.from('info')], 32))
const nodeHk = Buffer.from(crypto.hkdfSync('sha256', Buffer.from('ikm'), Buffer.from('salt'), Buffer.from('info'), 32))
assert.equal(hk.toString('hex'), nodeHk.toString('hex'))

const key = [...crypto.randomBytes(16)]
const nonce = [...crypto.randomBytes(12)]
const pt = [...Buffer.from('hello-web-push', 'utf8')]
const js = aesGcmEncrypt(key, nonce, pt)
const dec = crypto.createDecipheriv('aes-128-gcm', Buffer.from(key), Buffer.from(nonce))
dec.setAuthTag(Buffer.from(js.slice(-16)))
const out = Buffer.concat([dec.update(Buffer.from(js.slice(0, -16))), dec.final()])
assert.equal(out.toString(), 'hello-web-push')

const ua = crypto.createECDH('prime256v1')
const uaPub = [...ua.generateKeys()]
const uaAuth = [...crypto.randomBytes(16)]
const payload = [...Buffer.from(JSON.stringify({ title: 'Test', body: 'Hi', url: '/studio' }))]
const body = encryptWebPush(uaPub, uaAuth, payload)
assert.ok(body.length > 21 + 65 + 16)

const salt = Buffer.from(body.slice(0, 16))
const rs = (body[16] << 24) | (body[17] << 16) | (body[18] << 8) | body[19]
const idlen = body[20]
assert.equal(rs, 4096)
assert.equal(idlen, 65)
const senderPub = Buffer.from(body.slice(21, 21 + 65))
const rec = Buffer.from(body.slice(21 + 65))

const shared = ua.computeSecret(senderPub)
const ikm = Buffer.from(
  crypto.hkdfSync(
    'sha256',
    shared,
    Buffer.from(uaAuth),
    Buffer.concat([Buffer.from('WebPush: info\0'), Buffer.from(uaPub), senderPub]),
    32,
  ),
)
const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16))
const nn = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12))
const d2 = crypto.createDecipheriv('aes-128-gcm', cek, nn)
d2.setAuthTag(rec.subarray(rec.length - 16))
const plain = Buffer.concat([d2.update(rec.subarray(0, rec.length - 16)), d2.final()])
assert.equal(plain[plain.length - 1], 2)
assert.equal(plain.subarray(0, -1).toString(), JSON.stringify({ title: 'Test', body: 'Hi', url: '/studio' }))

console.log('webpush ece self-test ok')
