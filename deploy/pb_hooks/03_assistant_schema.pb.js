/// <reference path="../pb_data/types.d.ts" />
/**
 * Ensures assistant_thread exists on boot. Production deploys that ship
 * Assistant hooks without a prior ensure-schema run hit
 * "Missing collection context" until this collection is present.
 *
 * Note: PocketBase JSVM does not resolve sibling function declarations from
 * route/bootstrap callbacks — keep this file self-contained inside onBootstrap.
 */
onBootstrap((e) => {
  e.next()
  try {
    var AUTHED = '@request.auth.id != ""'
    var col
    try {
      col = $app.findCollectionByNameOrId("assistant_thread")
    } catch (_) {
      col = null
    }

    if (!col) {
      col = new Collection({
        type: "base",
        name: "assistant_thread",
        listRule: AUTHED,
        viewRule: AUTHED,
        createRule: AUTHED,
        updateRule: AUTHED,
        deleteRule: AUTHED,
        fields: [
          { name: "key", type: "text", required: true, min: 1, max: 40 },
          { name: "messages", type: "json" },
          { name: "model_messages", type: "json" },
          { name: "summary", type: "text", max: 8000 },
          { name: "in_flight", type: "bool" },
          { name: "in_flight_at", type: "date" },
          { name: "credit_warned_at", type: "date" },
          { name: "credit_empty", type: "bool" },
          { name: "picker_token", type: "text", max: 80 },
          { name: "flight_token", type: "text", max: 80 },
          { name: "meta", type: "json" },
          { name: "memory", type: "text", max: 8000 },
          { name: "assistant_name", type: "text", max: 64 },
          {
            name: "assistant_avatar",
            type: "file",
            maxSelect: 1,
            maxSize: 5000000,
            mimeTypes: ["image/jpeg", "image/png", "image/webp"],
            thumbs: ["200x200"],
          },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_assistant_thread_key ON assistant_thread (key)"],
      })
      $app.save(col)
      console.log("assistant: created assistant_thread collection")
    } else {
      var needed = ["memory", "assistant_name", "flight_token", "assistant_avatar"]
      var changed = false
      var i
      for (i = 0; i < needed.length; i++) {
        var fname = needed[i]
        var has = false
        try {
          has = !!col.fields.getByName(fname)
        } catch (_) {
          has = false
        }
        if (has) continue
        try {
          if (fname === "assistant_avatar") {
            col.fields.add(
              new FileField({
                name: "assistant_avatar",
                maxSelect: 1,
                maxSize: 5000000,
                mimeTypes: ["image/jpeg", "image/png", "image/webp"],
                thumbs: ["200x200"],
              }),
            )
          } else if (fname === "memory" || fname === "assistant_name" || fname === "flight_token") {
            var max = fname === "memory" ? 8000 : fname === "assistant_name" ? 64 : 80
            col.fields.add(new TextField({ name: fname, max: max }))
          }
          changed = true
        } catch (errAdd) {
          console.log("assistant: field " + fname + " skip: " + errAdd)
        }
      }
      if (changed) {
        $app.save(col)
        console.log("assistant: updated assistant_thread fields")
      }
    }

    try {
      $app.findFirstRecordByFilter("assistant_thread", 'key = "studio"')
    } catch (_) {
      var row = new Record(col)
      row.set("key", "studio")
      row.set("messages", [])
      row.set("model_messages", [])
      row.set("summary", "")
      row.set("in_flight", false)
      row.set("credit_empty", false)
      row.set("picker_token", "")
      row.set("meta", [])
      $app.save(row)
      console.log("assistant: seeded studio thread row")
    }
  } catch (err) {
    console.log("assistant schema bootstrap failed: " + err)
  }
})
