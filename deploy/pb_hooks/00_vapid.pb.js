/// <reference path="../pb_data/types.d.ts" />

const P256_P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn
const P256_N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n
const P256_GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n
const P256_GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n
const B64ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

function b64urlToBytes(s) {
  s = String(s).replace(/-/g, "+").replace(/_/g, "/")
  while (s.length % 4) s += "="
  const out = []
  for (let i = 0; i < s.length; i += 4) {
    const a = B64ABC.indexOf(s[i])
    const b = B64ABC.indexOf(s[i + 1])
    const c = s[i + 2] === "=" ? 0 : B64ABC.indexOf(s[i + 2])
    const d = s[i + 3] === "=" ? 0 : B64ABC.indexOf(s[i + 3])
    const n = (a << 18) | (b << 12) | (c << 6) | d
    out.push((n >> 16) & 255)
    if (s[i + 2] !== "=") out.push((n >> 8) & 255)
    if (s[i + 3] !== "=") out.push(n & 255)
  }
  return out
}

function bytesToB64url(bytes) {
  let s = ""
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0)
    s += B64ABC[(n >> 18) & 63] + B64ABC[(n >> 12) & 63]
    s += i + 1 < bytes.length ? B64ABC[(n >> 6) & 63] : ""
    s += i + 2 < bytes.length ? B64ABC[n & 63] : ""
  }
  return s.replace(/\+/g, "-").replace(/\//g, "_")
}

function utf8Bytes(str) {
  const out = []
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    if (c < 128) out.push(c)
    else if (c < 2048) out.push(192 | (c >> 6), 128 | (c & 63))
    else out.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63))
  }
  return out
}

function hexToBytes(hex) {
  const h = String(hex)
  const out = []
  for (let i = 0; i < h.length; i += 2) out.push(parseInt(h.slice(i, i + 2), 16))
  return out
}

function bytesToInt(bytes) {
  let n = 0n
  for (let i = 0; i < bytes.length; i++) n = (n << 8n) + BigInt(bytes[i])
  return n
}

function intToBytes(n, len) {
  const out = []
  let x = n
  for (let i = 0; i < len; i++) {
    out.unshift(Number(x & 255n))
    x >>= 8n
  }
  return out
}

function mod(a, m) {
  a %= m
  return a < 0n ? a + m : a
}

function invMod(a, m) {
  let t = 0n
  let newt = 1n
  let r = m
  let newr = mod(a, m)
  while (newr !== 0n) {
    const q = r / newr
    const tmpT = newt
    newt = t - q * newt
    t = tmpT
    const tmpR = newr
    newr = r - q * newr
    r = tmpR
  }
  if (t < 0n) t += m
  return t
}

function pointAdd(p1, p2) {
  if (!p1) return p2
  if (!p2) return p1
  const [x1, y1] = p1
  const [x2, y2] = p2
  if (x1 === x2 && mod(y1 + y2, P256_P) === 0n) return null
  let m
  if (x1 === x2 && y1 === y2) {
    m = mod(3n * x1 * x1 * invMod(2n * y1, P256_P), P256_P)
  } else {
    m = mod((y2 - y1) * invMod(x2 - x1, P256_P), P256_P)
  }
  const x3 = mod(m * m - x1 - x2, P256_P)
  const y3 = mod(m * (x1 - x3) - y1, P256_P)
  return [x3, y3]
}

function pointMul(k, point) {
  let r = null
  let acc = point
  let n = k
  while (n > 0n) {
    if (n & 1n) r = pointAdd(r, acc)
    acc = pointAdd(acc, acc)
    n >>= 1n
  }
  return r
}

function randomScalar() {
  let hex = $security.sha256($security.randomString(48) + String(Date.now()))
  try {
    hex = $security.randomStringWithAlphabet(64, "0123456789abcdef")
  } catch {
    // PocketBase sha256 fallback
  }
  let k = bytesToInt(hexToBytes(hex)) % P256_N
  if (k === 0n) k = 1n
  return k
}

function ecdsaSign(privBytes, hashBytes) {
  const d = bytesToInt(privBytes) % P256_N
  const z = bytesToInt(hashBytes) % P256_N
  for (let attempt = 0; attempt < 8; attempt++) {
    const k = randomScalar()
    const R = pointMul(k, [P256_GX, P256_GY])
    if (!R) continue
    const r = mod(R[0], P256_N)
    if (r === 0n) continue
    const s = mod(invMod(k, P256_N) * (z + r * d), P256_N)
    if (s === 0n) continue
    const sLow = s > P256_N / 2n ? P256_N - s : s
    return intToBytes(r, 32).concat(intToBytes(sLow, 32))
  }
  throw new Error("Could not sign VAPID JWT.")
}

function b64urlJson(obj) {
  const json = JSON.stringify(obj)
  return bytesToB64url(utf8Bytes(json))
}

function createVapidJwt(audience, subject) {
  const priv = ($os.getenv("VAPID_PRIVATE_KEY") || "").trim()
  if (!priv) throw new Error("VAPID_PRIVATE_KEY is not set.")
  const now = Math.floor(Date.now() / 1000)
  const header = b64urlJson({ typ: "JWT", alg: "ES256" })
  const payload = b64urlJson({
    aud: audience,
    exp: now + 12 * 3600,
    sub: subject || "mailto:studio@ibrahimlens.com.ng",
  })
  const signing = header + "." + payload
  const hashHex = $security.sha256(signing)
  const sig = ecdsaSign(b64urlToBytes(priv), hexToBytes(hashHex))
  return signing + "." + bytesToB64url(sig)
}

function vapidPublicKey() {
  return ($os.getenv("VAPID_PUBLIC_KEY") || "").trim()
}

function endpointAudience(endpoint) {
  const u = String(endpoint)
  const cut = u.indexOf("/", u.indexOf("//") + 2)
  return cut === -1 ? u : u.slice(0, cut)
}

function sendWebPush(endpoint, subject, _notice) {
  const pub = vapidPublicKey()
  if (!pub || !endpoint) return false
  const jwt = createVapidJwt(endpointAudience(endpoint), subject)
  // Empty-body VAPID tickle (pending payload fetched by the SW). Content-Length: 0
  // helps some gateways that drop a body-less POST; Urgency high helps iOS wake.
  const res = $http.send({
    url: endpoint,
    method: "POST",
    headers: {
      Authorization: "vapid t=" + jwt + ", k=" + pub,
      TTL: "86400",
      Urgency: "high",
      "Content-Length": "0",
      "Content-Type": "application/octet-stream",
    },
    timeout: 20,
  })
  if (res.statusCode >= 400) {
    throw new Error("Web Push HTTP " + res.statusCode)
  }
  return true
}
