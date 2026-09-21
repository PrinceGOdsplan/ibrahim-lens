/// <reference path="../pb_data/types.d.ts" />

function eceRotr(n, x) {
  return ((x >>> n) | (x << (32 - n))) >>> 0
}

function eceSha256(msg) {
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
      const s0 = eceRotr(7, w[i - 15]) ^ eceRotr(18, w[i - 15]) ^ (w[i - 15] >>> 3)
      const s1 = eceRotr(17, w[i - 2]) ^ eceRotr(19, w[i - 2]) ^ (w[i - 2] >>> 10)
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
      const S1 = eceRotr(6, e) ^ eceRotr(11, e) ^ eceRotr(25, e)
      const ch = (e & f) ^ (~e & g)
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0
      const S0 = eceRotr(2, a) ^ eceRotr(13, a) ^ eceRotr(22, a)
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
  const hs = [h0, h1, h2, h3, h4, h5, h6, h7]
  for (let i = 0; i < hs.length; i++) {
    const v = hs[i]
    out.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255)
  }
  return out
}

function eceHmacSha256(key, data) {
  const block = 64
  let k = key.slice()
  if (k.length > block) k = eceSha256(k)
  while (k.length < block) k.push(0)
  const opad = []
  const ipad = []
  for (let i = 0; i < block; i++) {
    opad.push(k[i] ^ 0x5c)
    ipad.push(k[i] ^ 0x36)
  }
  return eceSha256(opad.concat(eceSha256(ipad.concat(data))))
}

function eceHkdf(salt, ikm, info, len) {
  const prk = eceHmacSha256(salt, ikm)
  const out = []
  let t = []
  let i = 0
  while (out.length < len) {
    i += 1
    t = eceHmacSha256(prk, t.concat(info, [i]))
    for (let j = 0; j < t.length && out.length < len; j++) out.push(t[j])
  }
  return out
}

const ECE_SBOX = [
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

function eceXtime(a) {
  a &= 255
  return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 255
}

function eceMixCol(s, i) {
  const a = s[i]
  const b = s[i + 1]
  const c = s[i + 2]
  const d = s[i + 3]
  const e = a ^ b ^ c ^ d
  s[i] ^= e ^ eceXtime(a ^ b)
  s[i + 1] ^= e ^ eceXtime(b ^ c)
  s[i + 2] ^= e ^ eceXtime(c ^ d)
  s[i + 3] ^= e ^ eceXtime(d ^ a)
}

function eceAesKeyExpand(key) {
  const w = key.slice()
  let rc = 1
  for (let i = 16; i < 176; i += 4) {
    let t = w.slice(i - 4, i)
    if (i % 16 === 0) {
      t = [ECE_SBOX[t[1]] ^ rc, ECE_SBOX[t[2]], ECE_SBOX[t[3]], ECE_SBOX[t[0]]]
      rc = eceXtime(rc)
    }
    for (let j = 0; j < 4; j++) w[i + j] = w[i - 16 + j] ^ t[j]
  }
  return w
}

function eceAesEncryptBlock(exp, input) {
  const s = input.slice()
  for (let i = 0; i < 16; i++) s[i] ^= exp[i]
  for (let round = 1; round <= 10; round++) {
    for (let i = 0; i < 16; i++) s[i] = ECE_SBOX[s[i]]
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
      eceMixCol(s, 0)
      eceMixCol(s, 4)
      eceMixCol(s, 8)
      eceMixCol(s, 12)
    }
    const off = round * 16
    for (let i = 0; i < 16; i++) s[i] ^= exp[off + i]
  }
  return s
}

function eceBytesToBig(b) {
  let n = 0n
  for (let i = 0; i < b.length; i++) n = (n << 8n) + BigInt(b[i])
  return n
}

function eceBigToBytes(n, len) {
  const out = new Array(len)
  let x = n
  for (let i = len - 1; i >= 0; i--) {
    out[i] = Number(x & 255n)
    x >>= 8n
  }
  return out
}

function eceGfMul(x, y) {
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

function eceGhash(h, ciphertext) {
  const H = eceBytesToBig(h)
  let y = 0n
  const padded = ciphertext.slice()
  while (padded.length % 16 !== 0) padded.push(0)
  for (let i = 0; i < padded.length; i += 16) {
    y = eceGfMul(y ^ eceBytesToBig(padded.slice(i, i + 16)), H)
  }
  const lenBlock = eceBigToBytes(0n, 8).concat(eceBigToBytes(BigInt(ciphertext.length * 8), 8))
  y = eceGfMul(y ^ eceBytesToBig(lenBlock), H)
  return eceBigToBytes(y, 16)
}

function eceInc32(block) {
  const out = block.slice()
  for (let i = 15; i >= 12; i--) {
    out[i] = (out[i] + 1) & 255
    if (out[i] !== 0) break
  }
  return out
}

function eceAesGcmEncrypt(key, nonce12, plaintext) {
  const exp = eceAesKeyExpand(key)
  const zeros = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const H = eceAesEncryptBlock(exp, zeros)
  const j0 = nonce12.concat([0, 0, 0, 1])
  let ctr = eceInc32(j0)
  const ciphertext = []
  for (let i = 0; i < plaintext.length; i += 16) {
    const ks = eceAesEncryptBlock(exp, ctr)
    ctr = eceInc32(ctr)
    const end = i + 16 < plaintext.length ? i + 16 : plaintext.length
    for (let j = i; j < end; j++) ciphertext.push(plaintext[j] ^ ks[j - i])
  }
  const s = eceGhash(H, ciphertext)
  const tagBlock = eceAesEncryptBlock(exp, j0)
  const tag = []
  for (let i = 0; i < 16; i++) tag.push(tagBlock[i] ^ s[i])
  return ciphertext.concat(tag)
}

function eceBytesToSendBody(arr) {
  const u = new Uint8Array(arr.length)
  for (let i = 0; i < arr.length; i++) u[i] = arr[i] & 255
  return u
}
