/**
 * Shared helpers for pb_hooks handlers.
 * PocketBase serializes each handler into an isolated VM — top-level functions
 * in *.pb.js are NOT visible inside routerAdd/onRecord callbacks. Load this
 * module with require(`${__hooks}/ibrahim_utils.js`) inside the handler.
 */

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

function escapeOg(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

module.exports = {
  siteUrl,
  deliveryShortCode,
  ensureDeliveryShortCode,
  deliverySharePath,
  escapeOg,
}
