## Why

Studio email, mobile push, and related notify routes fail because PocketBase runs each `routerAdd` / `onRecord` / `cronAdd` handler in an isolated JSVM. Top-level helpers in `*.pb.js` (`sendMail`, `notifyPhotographerEvent`, `vapidPublicKey`, …) are `undefined` inside those handlers, so Send test and booking/Write/feedback alerts never send.

## What Changes

- Move mail, push, and share helpers into CommonJS modules under `pb_hooks/` and `require()` them from every notify handler
- Convert ECE + VAPID push crypto into requireable modules (same isolation issue)
- Keep public behavior: email channels, Mobile Web Push, and in-app bell/toast data paths work again when channels are on
- Non-goals: new notice channels, redesign Settings UI, change Resend/VAPID credentials

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `studio-notifications`: Photographer email and Mobile push from Studio events and Send test must actually deliver when configured; hooks must not rely on out-of-scope top-level functions

## Impact

- `deploy/pb_hooks/main.pb.js`, `ibrahim_utils.js`, new `ece.js` / `vapid_push.js`, thin `00_ece.pb.js` / `00_vapid.pb.js`
- Live VPS hooks reload; Settings → Send test; booking / Write / feedback notify paths
