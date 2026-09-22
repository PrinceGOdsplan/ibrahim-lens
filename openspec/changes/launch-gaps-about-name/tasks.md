## 1. Share image + 404

- [x] 1.1 Add compressed `public/og-default.jpg` (≈1200×630) and verify content-type on deploy
- [x] 1.2 Caddy: allowlist SPA routes; unknown paths respond 404 with a short HTML body

## 2. About display name

- [x] 2.1 About page H1 + portrait alt use `site_display_name` (fallback Ibrahim Lens)
- [x] 2.2 About Studio tab: edit site display name with subtitle/body

## 3. Verify

- [x] 3.1 `curl -sI /og-default.jpg` is image/jpeg; unknown path is 404; About uses saved name after deploy
