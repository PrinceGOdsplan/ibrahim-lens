/**
 * Shared helpers for pb_hooks handlers.
 * PocketBase serializes each handler into an isolated VM — top-level functions
 * in *.pb.js are NOT visible inside routerAdd/onRecord/cron callbacks. Load this
 * module with require(`${__hooks}/ibrahim_utils.js`) inside the handler.
 */

const vapid = require(`${__hooks}/vapid_push.js`)

function siteUrl() {
  const env = ($os.getenv("SITE_URL") || "").replace(/\/$/, "")
  if (env) return env
  try {
    const appURL = ($app.settings().meta.appURL || "").replace(/\/$/, "")
    if (appURL) return appURL
  } catch (_) {
    // fall through
  }
  return "https://ibrahimlens.com.ng"
}

function deliveryShortCode() {
  try {
    return $security.randomStringWithAlphabet(
      8,
      "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
    )
  } catch (_) {
    const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    let out = ""
    for (let i = 0; i < 8; i++) out += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
    return out
  }
}

function ensureDeliveryShortCode(record) {
  if ((record.getString("short_code") || "").trim()) return record
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      record.set("short_code", deliveryShortCode())
      $app.save(record)
      return record
    } catch (_) {}
  }
  return record
}

function deliverySharePath(record) {
  const short = (record.getString("short_code") || "").trim()
  if (short) return "/g/" + short
  return "/g/" + record.getString("token")
}

/** Resolve an active Delivery by long token or short share code. Throws NotFoundError. */
function findActiveDeliveryByShareCode(code) {
  const value = String(code || "").trim()
  if (!value) throw new NotFoundError("Not found.")
  let delivery
  try {
    delivery = $app.findFirstRecordByFilter("deliveries", "token = {:code}", { code: value })
  } catch (_) {
    try {
      delivery = $app.findFirstRecordByFilter("deliveries", "short_code = {:code}", { code: value })
    } catch (_) {
      throw new NotFoundError("Not found.")
    }
  }
  if (delivery.getBool("revoked")) throw new NotFoundError("Not found.")
  const exp = delivery.getDateTime("expires_at")
  if (exp.time().unixMilli() < Date.now()) throw new NotFoundError("Not found.")
  return delivery
}

function escapeOg(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function requestInfo(e) {
  try {
    return e.requestInfo()
  } catch (_) {
    return { query: {}, body: {} }
  }
}

function clientIp(e, info) {
  try {
    if (e && typeof e.realIP === "function") {
      const ip = String(e.realIP() || "").trim()
      if (ip) return ip
    }
  } catch (_) {}
  try {
    if (e && typeof e.remoteIP === "function") {
      const ip = String(e.remoteIP() || "").trim()
      if (ip) return ip
    }
  } catch (_) {}
  const h = (info && info.headers) || {}
  const raw = String(
    h["cf_connecting_ip"] || h["x_real_ip"] || h["x_forwarded_for"] || "",
  ).trim()
  if (raw) return raw.split(",")[0].trim()
  return "unknown"
}

/** Shared across requires — module registry is shared in PocketBase. */
var __guestRate = {}

function guestRateLimit(bucket, max, windowMs) {
  const now = Date.now()
  let arr = __guestRate[bucket] || []
  arr = arr.filter(function (t) {
    return now - t < windowMs
  })
  if (arr.length >= max) {
    __guestRate[bucket] = arr
    return false
  }
  arr.push(now)
  __guestRate[bucket] = arr
  if (Object.keys(__guestRate).length > 4000) {
    for (const k in __guestRate) {
      const kept = (__guestRate[k] || []).filter(function (t) {
        return now - t < windowMs
      })
      if (!kept.length) delete __guestRate[k]
      else __guestRate[k] = kept
    }
  }
  return true
}

function loadNoticeSettings() {
  try {
    return $app.findFirstRecordByFilter("notification_settings", 'key = "notifications"')
  } catch (_) {
    return null
  }
}

function recordMailError(message) {
  const settings = loadNoticeSettings()
  if (!settings) return
  settings.set("last_send_error", String(message).slice(0, 500))
  $app.save(settings)
}

function recordMailOk() {
  const settings = loadNoticeSettings()
  if (!settings) return
  settings.set("last_send_error", "")
  settings.set("last_sent_at", new Date().toISOString().replace("T", " "))
  $app.save(settings)
}

function smtpReady() {
  try {
    return Boolean($app.settings().smtp && $app.settings().smtp.enabled)
  } catch (_) {
    return false
  }
}

function clientPrefOn(settings, field) {
  if (!settings) return true
  try {
    return settings.get(field) !== false
  } catch (_) {
    return true
  }
}

function photographerRecord() {
  try {
    return $app.findFirstRecordByFilter("users", "email != ''")
  } catch (_) {
    return null
  }
}

function parseJson(raw, fallback) {
  if (raw == null || raw === "") return fallback
  if (typeof raw === "object") return raw
  try {
    return JSON.parse(String(raw))
  } catch (_) {
    return fallback
  }
}

function channelOn(settings, event, key) {
  if (!settings) return false
  const channels = parseJson(settings.get("channels"), null)
  if (channels && channels[event] && typeof channels[event][key] === "boolean") {
    return channels[event][key]
  }
  if (event === "booking" || event === "feedback" || event === "message") {
    if (key === "email") return settings.getBool("photographer_away") !== false
    if (key === "inApp") return true
  }
  return false
}

function brandedMail(title, bodyHtml, ctaHref, ctaLabel) {
  const origin = siteUrl()
  const link = ctaHref || origin + "/studio"
  const label = ctaLabel || "Open Studio"
  return (
    '<div style="font-family:Georgia,serif;max-width:32rem;margin:0 auto;color:#1a1a1a">' +
    '<p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b6b6b">Ibrahim Lens</p>' +
    "<h1 style=\"font-size:1.5rem;font-weight:normal;margin:0.5rem 0 1rem\">" +
    title +
    "</h1>" +
    '<div style="font-size:1rem;line-height:1.5">' +
    bodyHtml +
    "</div>" +
    '<p style="margin:1.5rem 0"><a href="' +
    link +
    '" style="display:inline-block;padding:0.65rem 1.1rem;background:#1a1a1a;color:#f7f7f5;text-decoration:none">' +
    label +
    "</a></p>" +
    '<p style="font-size:12px;color:#6b6b6b">Ibrahim Lens · Studio</p></div>'
  )
}

function hasDate(record, field) {
  try {
    const dt = record.getDateTime(field)
    return dt && dt.time().unixMilli() > 100000
  } catch (_) {
    return false
  }
}

function sendMail(to, subject, html) {
  if (!to || !smtpReady()) return false
  const meta = $app.settings().meta
  const message = new MailerMessage({
    from: {
      address: meta.senderAddress || to,
      name: meta.senderName || "Ibrahim Lens",
    },
    to: [{ address: to }],
    subject,
    html,
  })
  $app.newMailClient().send(message)
  return true
}

function notifyAddress(settings) {
  const user = photographerRecord()
  return (settings.getString("notify_email") || (user && user.getString("email")) || "").trim()
}

function enqueuePush(title, body, url) {
  let rows = []
  try {
    rows = $app.findRecordsByFilter("push_subscriptions", "id != ''", "-created", 20, 0)
  } catch (_) {
    return 0
  }
  const pending = { title: title, body: body, url: url }
  let sent = 0
  for (let i = 0; i < rows.length; i++) {
    try {
      rows[i].set("pending", pending)
      $app.save(rows[i])
      const sub = notifyAddress(loadNoticeSettings())
      vapid.sendWebPush(
        rows[i].getString("endpoint"),
        sub ? "mailto:" + sub : "mailto:studio@ibrahimlens.com.ng",
        pending,
        rows[i].getString("p256dh"),
        rows[i].getString("auth"),
      )
      sent++
    } catch (err) {
      const msg = String(err)
      if (msg.indexOf("HTTP 404") >= 0 || msg.indexOf("HTTP 410") >= 0) {
        try {
          $app.delete(rows[i])
        } catch (_) {
          /* expired endpoint */
        }
      }
      recordMailError(err)
    }
  }
  return sent
}

function notifyPhotographerEvent(event, subject, html, path) {
  const settings = loadNoticeSettings()
  if (!settings) return
  const to = notifyAddress(settings)
  if (channelOn(settings, event, "email") && to) {
    try {
      if (sendMail(to, subject, html)) recordMailOk()
    } catch (err) {
      recordMailError(err)
    }
  }
  if (channelOn(settings, event, "mobile")) {
    try {
      const n = enqueuePush(
        subject.replace(" — Ibrahim Lens", ""),
        "Open Studio",
        siteUrl() + (path || "/studio"),
      )
      if (!n) {
        recordMailError("Mobile push: no subscribed Studio phone (Allow phone notices on the installed app).")
      }
    } catch (err) {
      recordMailError(err)
    }
  }
}

module.exports = {
  siteUrl,
  deliveryShortCode,
  ensureDeliveryShortCode,
  deliverySharePath,
  findActiveDeliveryByShareCode,
  escapeOg,
  requestInfo,
  clientIp,
  guestRateLimit,
  loadNoticeSettings,
  recordMailError,
  recordMailOk,
  smtpReady,
  clientPrefOn,
  photographerRecord,
  parseJson,
  channelOn,
  brandedMail,
  hasDate,
  sendMail,
  notifyAddress,
  enqueuePush,
  notifyPhotographerEvent,
  vapidPublicKey: vapid.vapidPublicKey,
  sendWebPush: vapid.sendWebPush,
}
