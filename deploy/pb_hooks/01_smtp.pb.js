/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next()
  const key = ($os.getenv("RESEND_API_KEY") || "").trim()
  if (!key) return

  const from = ($os.getenv("SMTP_FROM") || "hello@ibrahimlens.com.ng").trim()
  const fromName = ($os.getenv("SMTP_FROM_NAME") || "Ibrahim Lens").trim()

  try {
    const settings = $app.settings()
    const smtp = settings.smtp
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
