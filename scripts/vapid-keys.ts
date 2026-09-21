import { createHash, generateKeyPairSync } from 'node:crypto'

/**
 * Prints a VAPID key pair for Web Push. Put the public key in Vite env and both
 * keys on the PocketBase container. Never commit the private key.
 */
const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
const pubJwk = publicKey.export({ format: 'jwk' })
const privJwk = privateKey.export({ format: 'jwk' })

function b64urlToBuf(s: string) {
  return Buffer.from(s, 'base64url')
}

const x = b64urlToBuf(String(pubJwk.x))
const y = b64urlToBuf(String(pubJwk.y))
const d = b64urlToBuf(String(privJwk.d))
const uncompressed = Buffer.concat([Buffer.from([0x04]), x, y]).toString('base64url')
const priv = d.toString('base64url')

const fingerprint = createHash('sha256').update(uncompressed).digest('hex').slice(0, 8)

console.log(`# VAPID pair ${fingerprint}`)
console.log(`VITE_VAPID_PUBLIC_KEY=${uncompressed}`)
console.log(`VAPID_PUBLIC_KEY=${uncompressed}`)
console.log(`VAPID_PRIVATE_KEY=${priv}`)
