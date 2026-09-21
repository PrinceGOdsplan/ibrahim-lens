/// <reference path="../pb_data/types.d.ts" />

// PocketBase JSVM: keep helpers inside the callback (sibling fns are not visible).
onBootstrap((e) => {
  e.next()
  var key = ""
  try {
    key = String($os.getenv("RESEND_API_KEY") || "").trim()
  } catch (_) {}
  if (!key) {
    try {
      key = String($os.readFile($filepath.join($app.dataDir(), ".resend_key")) || "").trim()
    } catch (_) {}
  }
  if (!key) {
    console.log("SMTP skipped: RESEND_API_KEY missing (env and /pb_data/.resend_key)")
    return
  }

  var from = "hello@ibrahimlens.com.ng"
  var fromName = "Ibrahim Lens"
  try {
    from = String($os.getenv("SMTP_FROM") || from).trim() || from
    fromName = String($os.getenv("SMTP_FROM_NAME") || fromName).trim() || fromName
  } catch (_) {}

  try {
    var settings = $app.settings()
    var smtp = settings.smtp
    if (
      smtp.enabled &&
      smtp.host === "smtp.resend.com" &&
      smtp.port === 587 &&
      smtp.username === "resend" &&
      smtp.password === key &&
      smtp.tls === true &&
      settings.meta.senderAddress === from &&
      settings.meta.senderName === fromName
    ) {
      console.log("SMTP already configured via Resend; From " + fromName + " <" + from + ">")
      return
    }

    smtp.enabled = true
    smtp.host = "smtp.resend.com"
    smtp.port = 587
    smtp.username = "resend"
    smtp.password = key
    smtp.tls = true
    smtp.authMethod = "PLAIN"
    settings.meta.senderAddress = from
    settings.meta.senderName = fromName
    $app.save(settings)
    console.log("SMTP enabled via Resend; From " + fromName + " <" + from + ">")
  } catch (err) {
    console.log("SMTP env apply failed: " + err)
  }
})
