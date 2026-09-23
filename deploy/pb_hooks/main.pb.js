/// <reference path="../pb_data/types.d.ts" />

function requestInfo(e) {
  try {
    return e.requestInfo()
  } catch {
    return { query: {}, body: {} }
  }
}

/** Client IP for guest rate limits (proxy headers when behind Caddy/CF). */
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

/** In-memory sliding window. Fine for a single PocketBase process. */
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
  } catch {
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
  } catch {
    return false
  }
}

/** Unset matches Studio (`!== false`). Only an explicit off blocks client mail. */
function clientPrefOn(settings, field) {
  if (!settings) return true
  try {
    return settings.get(field) !== false
  } catch {
    return true
  }
}

function siteUrl() {
  const env = ($os.getenv("SITE_URL") || "").replace(/\/$/, "")
  if (env) return env
  try {
    const appURL = ($app.settings().meta.appURL || "").replace(/\/$/, "")
    if (appURL) return appURL
  } catch {
    // fall through
  }
  return "https://ibrahimlens.com.ng"
}

function photographerRecord() {
  try {
    return $app.findFirstRecordByFilter("users", "email != ''")
  } catch {
    return null
  }
}

function parseJson(raw, fallback) {
  if (raw == null || raw === "") return fallback
  if (typeof raw === "object") return raw
  try {
    return JSON.parse(String(raw))
  } catch {
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
  } catch {
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
  } catch {
    return 0
  }
  const pending = { title: title, body: body, url: url }
  let sent = 0
  for (let i = 0; i < rows.length; i++) {
    try {
      rows[i].set("pending", pending)
      $app.save(rows[i])
      const sub = notifyAddress(loadNoticeSettings())
      sendWebPush(
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
        } catch {
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

onRecordCreateRequest((e) => {
  if (e.auth) {
    e.next()
    return
  }
  let info
  try {
    info = e.requestInfo()
  } catch {
    info = { query: {}, body: {} }
  }
  const q = info.query || {}
  const b = info.body || {}
  const trap = String(q.hp || q.company || b.hp || b.company || "").trim()
  if (trap) {
    throw new BadRequestError("Invalid request.")
  }
  e.next()
}, "people")

onRecordCreateRequest((e) => {
  if (e.auth) {
    e.next()
    return
  }
  let info
  try {
    info = e.requestInfo()
  } catch {
    info = { query: {}, body: {} }
  }
  const q = info.query || {}
  const b = info.body || {}
  const trap = String(q.hp || q.company || b.hp || b.company || "").trim()
  if (trap) {
    throw new BadRequestError("Invalid request.")
  }
  const ip = clientIp(e, info)
  // Per-IP first so one noisy network cannot fill the global ceiling alone.
  if (!guestRateLimit("book:ip:" + ip, 3, 10 * 60 * 1000)) {
    throw new BadRequestError("Please try again in a few minutes.")
  }
  if (!guestRateLimit("book:global", 30, 10 * 60 * 1000)) {
    throw new BadRequestError("Please try again in a few minutes.")
  }
  try {
    let answers = {}
    const rawAnswers = String(b.answers || e.record.get("answers") || "")
    if (rawAnswers.length > 8000) {
      throw new BadRequestError("Booking answers are too long.")
    }
    if (rawAnswers && rawAnswers.charAt(0) === "{") {
      try {
        answers = JSON.parse(rawAnswers)
      } catch (_) {
        answers = {}
      }
    }
    const identName = String(
      answers["_guest_name"] || b.name || b.guest_name || q.guest_name || "",
    ).trim()
    const identPhone = String(
      answers["_guest_phone"] || b.phone || b.guest_phone || q.guest_phone || "",
    ).trim()
    const identEmail = String(
      answers["_guest_email"] || b.email || b.guest_email || q.guest_email || "",
    ).trim()
    delete answers["_guest_name"]
    delete answers["_guest_phone"]
    delete answers["_guest_email"]
    e.record.set("answers", answers)
    if (!identName) throw new BadRequestError("Name is required.")
    if (identName.length > 160) throw new BadRequestError("Name is too long.")
    if (identEmail.length > 120) throw new BadRequestError("Email is too long.")
    let digits = identPhone.replace(/\D/g, "")
    if (digits.indexOf("234") === 0) digits = digits.slice(3)
    while (digits.indexOf("0") === 0) digits = digits.slice(1)
    if (digits.length < 7 || digits.length > 11) throw new BadRequestError("Enter a valid Nigerian phone number.")
    const phoneDigits = "234" + digits
    const phoneE164 = "+" + phoneDigits
    let person
    try {
      person = $app.findFirstRecordByFilter("people", "phone_digits = {:digits}", { digits: phoneDigits })
    } catch (_) {
      person = null
    }
    if (!person) {
      const peopleCol = $app.findCollectionByNameOrId("people")
      person = new Record(peopleCol)
      person.set("name", identName)
      person.set("phone_e164", phoneE164)
      person.set("phone_digits", phoneDigits)
      person.set("email", identEmail)
      person.set("notes", "")
      $app.save(person)
    }
    e.record.set("person", person.id)
    e.record.set("status", "needs_contact")
    e.record.set("source", "website")
    e.record.set("studio_notes", "")
    e.record.set("fee_ngn", 0)
    e.record.set("amount_paid_ngn", 0)
  } catch (err) {
    if (
      String(err).indexOf("valid Nigerian") !== -1 ||
      String(err).indexOf("Name is required") !== -1 ||
      String(err).indexOf("too long") !== -1
    ) {
      throw err
    }
    console.log("guest booking normalize failed: " + err)
    throw new BadRequestError("Could not save this booking request.")
  }
  e.next()
}, "bookings")

onRecordCreateRequest((e) => {
  if (e.auth) {
    e.next()
    return
  }
  let info
  try {
    info = e.requestInfo()
  } catch {
    info = { query: {}, body: {} }
  }
  const q = info.query || {}
  const b = info.body || {}
  const trap = String(q.hp || q.company || b.hp || b.company || "").trim()
  if (trap) {
    throw new BadRequestError("Invalid request.")
  }
  if (e.record.getString("kind") !== "contact") {
    throw new BadRequestError("Invalid request.")
  }
  const ip = clientIp(e, info)
  if (!guestRateLimit("write:ip:" + ip, 3, 10 * 60 * 1000)) {
    throw new BadRequestError("Please try again in a few minutes.")
  }
  if (!guestRateLimit("write:global", 30, 10 * 60 * 1000)) {
    throw new BadRequestError("Please try again in a few minutes.")
  }
  let payload = e.record.get("payload")
  if (payload == null) payload = b.payload
  let payloadStr = ""
  try {
    payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload || {})
  } catch (_) {
    payloadStr = ""
  }
  if (payloadStr.length > 4000) {
    throw new BadRequestError("Message is too long.")
  }
  try {
    const parsed = typeof payload === "string" ? JSON.parse(payload) : payload
    if (!parsed || typeof parsed !== "object") throw new Error("bad")
    const name = String(parsed.name || "").trim()
    const message = String(parsed.message || parsed.body || "").trim()
    if (!name) throw new BadRequestError("Name is required.")
    if (name.length > 160) throw new BadRequestError("Name is too long.")
    if (message.length > 2000) throw new BadRequestError("Message is too long.")
    e.record.set("payload", {
      name: name,
      email: String(parsed.email || "").trim().slice(0, 120),
      phone: String(parsed.phone || "").trim().slice(0, 40),
      message: message,
    })
  } catch (err) {
    if (String(err).indexOf("required") !== -1 || String(err).indexOf("too long") !== -1) throw err
    throw new BadRequestError("Invalid message.")
  }
  e.next()
}, "form_inquiries")

onRecordAfterCreateSuccess((e) => {
  e.next()
  const fromWebsite = e.record.getString("source") === "website"
  // Public website bookings must notify even when a Studio session cookie is
  // present (photographer testing Contact in the same browser).
  if (!e.auth || fromWebsite) {
    try {
      const evCol = $app.findCollectionByNameOrId("booking_events")
      const ev = new Record(evCol)
      ev.set("booking", e.record.id)
      ev.set("type", "created")
      ev.set("actor", fromWebsite ? "public" : e.auth ? "studio" : "public")
      ev.set("before", {})
      ev.set("after", {
        status: e.record.getString("status"),
        preferred_at: e.record.getString("preferred_at") || "",
        studio_notes: "",
        fee_ngn: 0,
        amount_paid_ngn: 0,
        person: e.record.getString("person"),
      })
      $app.save(ev)
    } catch (err) {
      console.log("booking created event failed: " + err)
    }
  }
  if (!fromWebsite) return
  const origin = siteUrl()
  notifyPhotographerEvent(
    "booking",
    "New booking request — Ibrahim Lens",
    brandedMail(
      "New booking request",
      "<p>A visitor asked to book. Accept it in Inbox to add it to Bookings, or delete it.</p>",
      origin + "/studio/clients?tab=inbox",
      "Open Inbox",
    ),
    "/studio/clients?tab=inbox",
  )
}, "bookings")

onRecordAfterCreateSuccess((e) => {
  e.next()
  // Guest token path must notify even if a Studio session cookie is present
  // (photographer testing the Delivery link in the same browser).
  let guestToken = ""
  try {
    const info = e.requestInfo()
    guestToken = String((info.query && info.query.token) || "")
  } catch (_) {}
  if (e.auth && !guestToken) return
  try {
    const origin = siteUrl()
    const name = String(e.record.getString("client_name") || "A client")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    try {
      const inboxCol = $app.findCollectionByNameOrId("form_inquiries")
      const inbox = new Record(inboxCol)
      inbox.set("kind", "feedback")
      inbox.set("payload", {
        inbox_read: false,
        feedback_id: e.record.id,
        delivery_id: e.record.getString("delivery"),
        client_name: e.record.getString("client_name"),
        message: String(e.record.getString("message") || "").slice(0, 200),
      })
      $app.save(inbox)
    } catch (err) {
      console.log("feedback inbox event failed: " + err)
    }
    notifyPhotographerEvent(
      "feedback",
      "New delivery feedback — Ibrahim Lens",
      brandedMail(
        "New delivery feedback",
        "<p>" + name + " left feedback on a delivery.</p>",
        origin + "/studio/clients?tab=feedback",
        "Open Feedback",
      ),
      "/studio/clients?tab=feedback",
    )
  } catch (_) {}
}, "delivery_feedback")

onRecordAfterCreateSuccess((e) => {
  e.next()
  if (e.record.getString("kind") !== "contact") return
  // Public Write must notify even when a Studio session cookie is present.
  try {
  const origin = siteUrl()
  const payload = parseJson(e.record.get("payload"), {})
  const rawName = String(payload.name || payload.from || "Someone").trim() || "Someone"
  try {
    let digits = String(payload.phone || "").replace(/\D/g, "")
    if (digits.indexOf("234") === 0) digits = digits.slice(3)
    while (digits.indexOf("0") === 0) digits = digits.slice(1)
    if (rawName && digits.length >= 7 && digits.length <= 11) {
      const phoneDigits = "234" + digits
      let person
      try {
        person = $app.findFirstRecordByFilter("people", "phone_digits = {:digits}", { digits: phoneDigits })
      } catch (_) {
        person = null
      }
      if (!person) {
        const peopleCol = $app.findCollectionByNameOrId("people")
        person = new Record(peopleCol)
        person.set("name", rawName)
        person.set("phone_e164", "+" + phoneDigits)
        person.set("phone_digits", phoneDigits)
        person.set("email", String(payload.email || "").trim())
        person.set("notes", "")
        $app.save(person)
      }
    }
  } catch (err) {
    console.log("contact person upsert failed: " + err)
  }
  const name = rawName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  notifyPhotographerEvent(
    "message",
    "New message — Ibrahim Lens",
    brandedMail(
      "New message",
      "<p>" + name + " wrote via Contact.</p>",
      origin + "/studio/clients?tab=inbox&folder=messages",
      "Open Messages",
    ),
    "/studio/clients?tab=inbox&folder=messages",
  )
  } catch (err) {
    console.log("contact after-create failed: " + err)
  }
}, "form_inquiries")

onRecordAfterCreateSuccess((e) => {
  e.next()
  const delivery = e.record
  const rawImages = delivery.get("images")
  const ids = []
  if (typeof rawImages === "string" && rawImages) {
    try {
      const parsed = JSON.parse(rawImages)
      if (Array.isArray(parsed)) {
        for (let p = 0; p < parsed.length; p++) ids.push(parsed[p])
      } else {
        ids.push(rawImages)
      }
    } catch {
      ids.push(rawImages)
    }
  } else if (rawImages && rawImages.length) {
    for (let r = 0; r < rawImages.length; r++) {
      const item = rawImages[r]
      ids.push(typeof item === "string" ? item : item && item.id)
    }
  }
  let copied = 0
  let lastErr = ""
  try {
    const collection = $app.findCollectionByNameOrId("delivery_files")
    const dataDir = $app.dataDir()
    for (let i = 0; i < ids.length; i++) {
      if (!ids[i]) continue
      let media
      try {
        media = $app.findRecordById("media", ids[i])
      } catch (findErr) {
        lastErr = "media " + ids[i] + ": " + findErr
        continue
      }
      const filename = String(media.get("file") || "")
      if (!filename) {
        lastErr = "media " + media.id + " has no file"
        continue
      }
      const key = media.baseFilesPath() + "/" + filename
      const abs = $filepath.join(dataDir, "storage", key)
      let file
      try {
        const bytes = $os.readFile(abs)
        file = $filesystem.fileFromBytes(bytes, filename)
      } catch (diskErr) {
        try {
          file = $filesystem.fileFromPath(abs)
        } catch (pathErr) {
          try {
            const fsys = $app.newFilesystem()
            try {
              const reader = fsys.getFile(key)
              const bytes = toString(reader, 80 * 1024 * 1024)
              try {
                reader.close()
              } catch (_) {}
              file = $filesystem.fileFromBytes(bytes, filename)
            } finally {
              fsys.close()
            }
          } catch (fsErr) {
            lastErr =
              "read " +
              abs +
              " disk:" +
              diskErr +
              " path:" +
              pathErr +
              " fs:" +
              fsErr
            continue
          }
        }
      }
      try {
        const row = new Record(collection)
        row.set("delivery", delivery.id)
        row.set("media", media.id)
        row.set("file", file)
        row.set("caption", String(media.get("caption") || ""))
        row.set("sort", i)
        $app.save(row)
        copied++
      } catch (saveErr) {
        lastErr = "save " + filename + ": " + saveErr
      }
    }
  } catch (err) {
    lastErr = String(err)
  }
  if (!copied) {
    try {
      $app.delete(delivery)
    } catch (_) {}
    throw new BadRequestError(lastErr || "Delivery has no files to copy.")
  }
  const settings = loadNoticeSettings()
  if (!clientPrefOn(settings, "client_gallery")) return
  const email = (e.record.getString("client_email") || "").trim()
  if (!email) return
  const token = e.record.getString("token")
  const origin = siteUrl()
  const name = String(e.record.getString("client_name") || "there")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  try {
    if (
      sendMail(
        email,
        "Your gallery is ready — Ibrahim Lens",
        brandedMail(
          "Your gallery is ready",
          "<p>Hi " +
            name +
            ",</p><p>Your photographs are ready to view and download. The link expires in 7 days.</p>",
          origin + "/g/" + token,
          "Open your gallery",
        ),
      )
    ) {
      recordMailOk()
    }
  } catch (err) {
    recordMailError(err)
  }
}, "deliveries")

onRecordCreateRequest((e) => {
  if (e.auth) {
    e.next()
    return
  }
  const info = requestInfo(e)
  const ip = clientIp(e, info)
  if (!guestRateLimit("feedback:ip:" + ip, 5, 10 * 60 * 1000)) {
    throw new BadRequestError("Please try again in a few minutes.")
  }
  const msg = String(e.record.getString("message") || "")
  if (msg.length > 4000) throw new BadRequestError("Feedback is too long.")
  e.record.set("reviewed", false)
  e.record.set("promoted", false)
  e.next()
}, "delivery_feedback")

onFileDownloadRequest((e) => {
  if (!e.collection || e.collection.name !== "delivery_files") {
    e.next()
    return
  }
  const deliveryId = e.record.getString("delivery")
  const delivery = $app.findRecordById("deliveries", deliveryId)
  if (delivery.getBool("revoked")) {
    throw new NotFoundError("Not found.")
  }
  const exp = delivery.getDateTime("expires_at")
  if (exp.time().unixMilli() < Date.now()) {
    throw new NotFoundError("Not found.")
  }
  if (!e.auth) {
    // File-download events in this PocketBase build expose an empty URL
    // (no query, no requestURI). Guests use /api/ibrahim/delivery-file/...
    throw new NotFoundError("Not found.")
  }
  e.next()
})

cronAdd("ibrahim-prune-delivery-files", "20 3 * * *", () => {
  try {
    const expired = $app.findRecordsByFilter(
      "deliveries",
      "expires_at < @now || revoked = true",
      "-created",
      200,
      0,
    )
    for (let i = 0; i < expired.length; i++) {
      const files = $app.findRecordsByFilter(
        "delivery_files",
        "delivery = {:id}",
        "",
        500,
        0,
        { id: expired[i].id },
      )
      for (let j = 0; j < files.length; j++) {
        $app.delete(files[j])
      }
    }
  } catch (err) {
    console.log("ibrahim-prune-delivery-files", err)
  }
})

cronAdd("ibrahim-client-expiry-mail", "20 * * * *", () => {
  const settings = loadNoticeSettings()
  if (!clientPrefOn(settings, "client_expiring") || !smtpReady()) return
  const now = Date.now()
  const from = new Date(now + 23 * 3600 * 1000).toISOString().replace("T", " ")
  const to = new Date(now + 25 * 3600 * 1000).toISOString().replace("T", " ")
  let rows = []
  try {
    rows = $app.findRecordsByFilter(
      "deliveries",
      "revoked = false && client_email != '' && expires_at > {:from} && expires_at < {:to}",
      "",
      50,
      0,
      { from: from, to: to },
    )
  } catch (err) {
    console.log("ibrahim-client-expiry-mail", err)
    return
  }
  const origin = siteUrl()
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i]
    if (hasDate(d, "downloaded_at") || hasDate(d, "expiry_mail_sent_at")) continue
    const email = (d.getString("client_email") || "").trim()
    if (!email) continue
    const name = String(d.getString("client_name") || "there")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    const token = d.getString("token")
    try {
      if (
        sendMail(
          email,
          "Your gallery expires soon — Ibrahim Lens",
          brandedMail(
            "Your gallery expires soon",
            "<p>Hi " +
              name +
              ",</p><p>Your gallery expires in about a day. Download your photographs if you have not already.</p>",
            origin + "/g/" + token,
            "Open your gallery",
          ),
        )
      ) {
        d.set("expiry_mail_sent_at", new Date().toISOString().replace("T", " "))
        $app.save(d)
        recordMailOk()
      }
    } catch (err) {
      recordMailError(err)
    }
  }
})

routerAdd(
  "POST",
  "/api/ibrahim/resend-gallery",
  (e) => {
    const info = requestInfo(e)
    const body = info.body || {}
    const query = info.query || {}
    const deliveryId = String(body.deliveryId || body.delivery_id || query.deliveryId || "").trim()
    if (!deliveryId) throw new BadRequestError("Missing delivery.")
    let delivery
    try {
      delivery = $app.findRecordById("deliveries", deliveryId)
    } catch (_) {
      throw new NotFoundError("Delivery not found.")
    }
    if (delivery.getBool("revoked")) throw new BadRequestError("This delivery link was revoked.")
    const exp = delivery.getDateTime("expires_at")
    if (exp.time().unixMilli() < Date.now()) throw new BadRequestError("This delivery link has expired.")
    const email = (delivery.getString("client_email") || "").trim()
    if (!email) throw new BadRequestError("Add a client email before sending.")
    const settings = loadNoticeSettings()
    if (!clientPrefOn(settings, "client_gallery")) {
      throw new BadRequestError("Client gallery email is turned off in Settings → Notifications.")
    }
    if (!smtpReady()) throw new BadRequestError("Outbound mail is not configured.")
    const token = delivery.getString("token")
    const origin = siteUrl()
    const name = String(delivery.getString("client_name") || "there")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    try {
      if (
        !sendMail(
          email,
          "Your gallery is ready — Ibrahim Lens",
          brandedMail(
            "Your gallery is ready",
            "<p>Hi " +
              name +
              ",</p><p>Your photographs are ready to view and download. The link expires in 7 days.</p>",
            origin + "/g/" + token,
            "Open your gallery",
          ),
        )
      ) {
        throw new BadRequestError("Could not send mail. Check SMTP.")
      }
      recordMailOk()
    } catch (err) {
      recordMailError(err)
      throw new BadRequestError(String(err))
    }
    return e.json(200, { ok: true })
  },
  $apis.requireAuth(),
)

routerAdd(
  "POST",
  "/api/ibrahim/test-mail",
  (e) => {
    const settings = loadNoticeSettings()
    if (!settings) throw new BadRequestError("Notification settings are missing.")
    const to = notifyAddress(settings)
    const origin = siteUrl()
    let mailed = false
    let pushed = 0
    if (smtpReady() && to) {
      try {
        sendMail(
          to,
          "Test notice — Ibrahim Lens",
          brandedMail(
            "Test notice",
            "<p>This is a sample from Studio → Notifications. Bookings and Deliveries were not changed.</p>",
            origin + "/studio/settings?tab=notifications",
            "Open Notifications",
          ),
        )
        mailed = true
        recordMailOk()
      } catch (err) {
        recordMailError(err)
      }
    }
    try {
      pushed = enqueuePush(
        "Test notice",
        "This is a sample phone notice from Studio.",
        origin + "/studio/settings?tab=notifications",
      )
    } catch (err) {
      recordMailError(err)
    }
    if (!mailed && !pushed) {
      throw new BadRequestError(
        "No phone is subscribed yet. On the installed Studio app, turn Mobile on, tap Save notices (or Allow phone notices), then try again.",
      )
    }
    return e.json(200, { ok: true, mail: mailed, push: pushed > 0 })
  },
  $apis.requireAuth(),
)

routerAdd(
  "GET",
  "/api/ibrahim/vapid-public",
  (e) => {
    return e.json(200, { publicKey: vapidPublicKey() })
  },
  $apis.requireAuth(),
)

routerAdd(
  "GET",
  "/api/ibrahim/mail-health",
  (e) => {
    return e.json(200, { smtp: smtpReady() })
  },
  $apis.requireAuth(),
)

function escapeOg(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Crawler-facing HTML for Delivery share links (messengers do not run the SPA). */
routerAdd("GET", "/api/ibrahim/delivery-og/{token}", (e) => {
  const token = String((e.request && e.request.pathValue && e.request.pathValue("token")) || "")
  if (!token) throw new NotFoundError("Not found.")
  let delivery
  try {
    delivery = $app.findFirstRecordByFilter("deliveries", "token = {:token}", { token: token })
  } catch (_) {
    throw new NotFoundError("Not found.")
  }
  if (delivery.getBool("revoked")) throw new NotFoundError("Not found.")
  const exp = delivery.getDateTime("expires_at")
  if (exp.time().unixMilli() < Date.now()) throw new NotFoundError("Not found.")

  const origin = siteUrl()
  const clientName = String(delivery.getString("client_name") || "Client").trim() || "Client"
  const title = "Gallery for " + clientName
  const description = "Private photographs from Ibrahim Lens."
  const pageUrl = origin + "/g/" + token
  let imageUrl = origin + "/og-default.jpg"
  try {
    const files = $app.findRecordsByFilter(
      "delivery_files",
      "delivery = {:id}",
      "created",
      1,
      0,
      { id: delivery.id },
    )
    if (files && files.length) {
      const row = files[0]
      const stored = String(row.get("file") || "")
      if (stored) {
        imageUrl =
          origin +
          "/api/ibrahim/delivery-file/" +
          encodeURIComponent(token) +
          "/" +
          encodeURIComponent(row.id) +
          "/" +
          encodeURIComponent(stored) +
          "?thumb=1200x0"
      }
    }
  } catch (_) {}

  const html =
    "<!doctype html><html lang=\"en\"><head>" +
    "<meta charset=\"utf-8\"/>" +
    "<title>" +
    escapeOg(title) +
    " · Ibrahim Lens</title>" +
    "<meta property=\"og:type\" content=\"website\"/>" +
    "<meta property=\"og:site_name\" content=\"Ibrahim Lens\"/>" +
    "<meta property=\"og:title\" content=\"" +
    escapeOg(title) +
    "\"/>" +
    "<meta property=\"og:description\" content=\"" +
    escapeOg(description) +
    "\"/>" +
    "<meta property=\"og:url\" content=\"" +
    escapeOg(pageUrl) +
    "\"/>" +
    "<meta property=\"og:image\" content=\"" +
    escapeOg(imageUrl) +
    "\"/>" +
    "<meta name=\"twitter:card\" content=\"summary_large_image\"/>" +
    "<meta name=\"twitter:title\" content=\"" +
    escapeOg(title) +
    "\"/>" +
    "<meta name=\"twitter:description\" content=\"" +
    escapeOg(description) +
    "\"/>" +
    "<meta name=\"twitter:image\" content=\"" +
    escapeOg(imageUrl) +
    "\"/>" +
    "<link rel=\"canonical\" href=\"" +
    escapeOg(pageUrl) +
    "\"/>" +
    "</head><body><p>" +
    escapeOg(title) +
    "</p></body></html>"

  return e.html(200, html)
})

function deliveryFileExists(fsys, key) {
  let reader
  try {
    reader = fsys.getReader ? fsys.getReader(key) : fsys.getFile(key)
    return true
  } catch (_) {
    return false
  } finally {
    try {
      if (reader) reader.close()
    } catch (_) {}
  }
}

routerAdd("GET", "/api/ibrahim/delivery-file/{token}/{id}/{filename}", (e) => {
  const token = String((e.request && e.request.pathValue && e.request.pathValue("token")) || "")
  const id = String((e.request && e.request.pathValue && e.request.pathValue("id")) || "")
  const filename = String((e.request && e.request.pathValue && e.request.pathValue("filename")) || "")
  if (!token || !id || !filename) throw new NotFoundError("Not found.")
  let delivery
  try {
    delivery = $app.findFirstRecordByFilter("deliveries", "token = {:token}", { token: token })
  } catch (_) {
    throw new NotFoundError("Not found.")
  }
  if (delivery.getBool("revoked")) throw new NotFoundError("Not found.")
  const exp = delivery.getDateTime("expires_at")
  if (exp.time().unixMilli() < Date.now()) throw new NotFoundError("Not found.")
  const row = $app.findRecordById("delivery_files", id)
  if (row.getString("delivery") !== delivery.id) throw new NotFoundError("Not found.")
  const stored = String(row.get("file") || "")
  if (!stored || stored !== filename) throw new NotFoundError("Not found.")
  let thumb = ""
  let download = false
  try {
    if (e.request && e.request.formValue) {
      thumb = String(e.request.formValue("thumb") || "")
      download = String(e.request.formValue("dl") || "") === "1"
    }
    if (e.request && e.request.url && e.request.url.query) {
      const query = e.request.url.query()
      if (!thumb) thumb = String(query.get("thumb") || "")
      if (!download) download = String(query.get("dl") || "") === "1"
    }
  } catch (_) {}
  const allowed = { "200x200": 1, "400x400": 1, "800x800": 1, "1200x0": 1, "1600x900": 1 }
  if (download && !thumb && !hasDate(delivery, "downloaded_at")) {
    try {
      delivery.set("downloaded_at", new Date().toISOString().replace("T", " "))
      $app.save(delivery)
      const inboxCol = $app.findCollectionByNameOrId("form_inquiries")
      const inbox = new Record(inboxCol)
      inbox.set("kind", "delivery_event")
      inbox.set("payload", {
        inbox_read: false,
        event: "download",
        delivery_id: delivery.id,
        client_name: delivery.getString("client_name"),
        media_id: row.getString("media") || row.id,
      })
      $app.save(inbox)
    } catch (err) {
      console.log("delivery download stamp failed: " + err)
    }
  }

  const candidates = []
  const deliveryBase = row.baseFilesPath()
  if (thumb && allowed[thumb]) {
    candidates.push({
      key: deliveryBase + "/thumbs_" + stored + "/" + thumb + "_" + stored,
      name: thumb + "_" + stored,
    })
  }
  candidates.push({ key: deliveryBase + "/" + stored, name: stored })

  const mediaId = String(row.getString("media") || "")
  if (mediaId) {
    try {
      const media = $app.findRecordById("media", mediaId)
      const mediaFile = String(media.get("file") || "")
      if (mediaFile) {
        const mediaBase = media.baseFilesPath()
        if (thumb && allowed[thumb]) {
          candidates.push({
            key: mediaBase + "/thumbs_" + mediaFile + "/" + thumb + "_" + mediaFile,
            name: thumb + "_" + mediaFile,
          })
        }
        candidates.push({ key: mediaBase + "/" + mediaFile, name: mediaFile })
      }
    } catch (_) {}
  }

  try {
    e.response.header().set("Cache-Control", "private, no-store")
  } catch (_) {}
  if (download && !thumb) {
    try {
      e.response.header().set(
        "Content-Disposition",
        'attachment; filename="' + stored.replace(/"/g, "") + '"',
      )
    } catch (_) {}
  }

  const fsys = $app.newFilesystem()
  try {
    let served = false
    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i]
      if (!deliveryFileExists(fsys, cand.key)) continue
      try {
        fsys.serve(e.response, e.request, cand.key, cand.name)
        served = true
        break
      } catch (serveErr) {
        console.log("delivery-file serve failed " + cand.key + ": " + serveErr)
      }
    }
    if (!served) throw new NotFoundError("File not found.")
  } finally {
    try {
      fsys.close()
    } catch (_) {}
  }
})

routerAdd("GET", "/api/ibrahim/push-pending", (e) => {
  const info = requestInfo(e)
  const ip = clientIp(e, info)
  if (!guestRateLimit("push:ip:" + ip, 30, 60 * 1000)) {
    throw new BadRequestError("Too many requests.")
  }
  let secret = ""
  try {
    secret = String(e.request.header.get("X-Ibrahim-Push-Secret") || "").trim()
  } catch (_) {}
  // Query fallback kept briefly for old SW installs; prefer header.
  if (!secret) secret = String((info.query || {}).secret || "").trim()
  if (secret.length < 16 || secret.length > 80) throw new BadRequestError("Missing secret.")
  let row
  try {
    row = $app.findFirstRecordByFilter("push_subscriptions", "device_secret = {:s}", { s: secret })
  } catch {
    throw new NotFoundError()
  }
  const pending = parseJson(row.get("pending"), null)
  row.set("pending", null)
  $app.save(row)
  try {
    e.response.header().set("Cache-Control", "private, no-store")
  } catch (_) {}
  return e.json(200, pending || {})
})
