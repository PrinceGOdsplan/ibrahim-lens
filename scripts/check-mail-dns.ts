/**
 * Asserts live DNS for Ibrahim Lens mail: Resend sending on `send.` /
 * `resend._domainkey`, Cloudflare Email Routing on apex MX.
 *
 * Sending records missing → exit 1.
 * Apex still on SES inbound, or missing DMARC → warn (exit 1 only if
 * MAIL_INBOUND_STRICT=1).
 *
 * Usage: npx tsx scripts/check-mail-dns.ts
 */
const DOMAIN = 'ibrahimlens.com.ng'
const SES_INBOUND = 'inbound-smtp.us-east-1.amazonaws.com'
const RESEND_BOUNCE = 'feedback-smtp.us-east-1.amazonses.com'
const CF_MX = /(?:^|\.)mx\.cloudflare\.net$/i

const strictInbound = process.env.MAIL_INBOUND_STRICT === '1'
const warnings: string[] = []
const failures: string[] = []

type DnsJson = {
  Status: number
  Answer?: { type: number; data: string }[]
}

async function lookup(name: string, type: 'MX' | 'TXT'): Promise<string[]> {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`DNS lookup failed for ${name} ${type}: HTTP ${res.status}`)
  const json = (await res.json()) as DnsJson
  if (json.Status === 3 || !json.Answer) return []
  return json.Answer.map((a) => a.data.replace(/\.$/, '').replace(/^"|"$/g, ''))
}

function has(haystacks: string[], needle: string) {
  const n = needle.toLowerCase()
  return haystacks.some((h) => h.toLowerCase().includes(n))
}

function mxExchange(record: string) {
  const parts = record.trim().split(/\s+/)
  return (parts[1] || parts[0] || '').replace(/\.$/, '').toLowerCase()
}

async function main() {
  const dkim = await lookup(`resend._domainkey.${DOMAIN}`, 'TXT')
  if (!dkim.some((v) => /\bp=/i.test(v))) {
    failures.push(`Missing Resend DKIM TXT at resend._domainkey.${DOMAIN}`)
  } else {
    console.log(`ok  DKIM  resend._domainkey.${DOMAIN}`)
  }

  const sendMx = await lookup(`send.${DOMAIN}`, 'MX')
  if (!sendMx.some((r) => mxExchange(r) === RESEND_BOUNCE)) {
    failures.push(`Missing Resend bounce MX send.${DOMAIN} → ${RESEND_BOUNCE}`)
  } else {
    console.log(`ok  MX    send.${DOMAIN} → ${RESEND_BOUNCE}`)
  }

  const sendSpf = await lookup(`send.${DOMAIN}`, 'TXT')
  if (!has(sendSpf, 'v=spf1') || !has(sendSpf, 'amazonses.com')) {
    failures.push(`Missing Resend SPF TXT at send.${DOMAIN}`)
  } else {
    console.log(`ok  SPF   send.${DOMAIN}`)
  }

  const apexMx = await lookup(DOMAIN, 'MX')
  const exchanges = apexMx.map(mxExchange)
  const ses = exchanges.some((ex) => ex === SES_INBOUND)
  const cloudflare = exchanges.some((ex) => CF_MX.test(ex))

  if (cloudflare && !ses) {
    console.log(`ok  MX    ${DOMAIN} → Cloudflare Email Routing`)
  } else if (ses) {
    const msg = `Apex MX is SES inbound (${SES_INBOUND}). Mail to hello@ is dropped while Resend receiving is off. Enable Cloudflare Email Routing, then remove this MX.`
    if (strictInbound) failures.push(msg)
    else warnings.push(msg)
  } else if (exchanges.length === 0) {
    const msg = `No apex MX on ${DOMAIN}. Inbound to hello@ will bounce until Cloudflare Email Routing is enabled.`
    if (strictInbound) failures.push(msg)
    else warnings.push(msg)
  } else {
    const msg = `Apex MX is ${exchanges.join(', ')} — expected Cloudflare route*.mx.cloudflare.net (not Resend receiving).`
    if (strictInbound) failures.push(msg)
    else warnings.push(msg)
  }

  const dmarc = await lookup(`_dmarc.${DOMAIN}`, 'TXT')
  if (!dmarc.some((v) => /v=dmarc1/i.test(v))) {
    const msg = `Missing _dmarc.${DOMAIN} TXT (add v=DMARC1; p=none;)`
    if (strictInbound) failures.push(msg)
    else warnings.push(msg)
  } else {
    console.log(`ok  DMARC _dmarc.${DOMAIN}`)
  }

  for (const w of warnings) console.warn(`warn ${w}`)
  for (const f of failures) console.error(`fail ${f}`)

  if (failures.length) {
    process.exitCode = 1
    return
  }
  if (warnings.length) {
    console.log('Sending DNS is in place. Inbound/DMARC still needs Cloudflare Email Routing (see README).')
    return
  }
  console.log('Mail DNS matches Resend send + Cloudflare Email Routing receive.')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
