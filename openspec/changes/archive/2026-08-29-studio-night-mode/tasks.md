## 1. Tokens and preference

- [x] 1.1 Add night CSS variable overrides under `.studio-shell[data-studio-appearance="night"]` (Soft-night–related bg/panel/border/fg/muted; night accent/danger; `color-scheme: dark`)
- [x] 1.2 Add a small Studio appearance helper (read/write `localStorage`, default `light`, type `light | night`)
- [x] 1.3 Apply `data-studio-appearance` on Studio layout shell and ensure SurfaceProvider / portalled Studio roots receive the same attribute (or inherit via existing `studio-shell` class wiring)

## 2. Header toggle and login

- [x] 2.1 Add icon-only sun/moon header control (44px hit, aria-label for switch-to-night / switch-to-light) that toggles and persists appearance
- [x] 2.2 Wire Studio login (and RequireAuth loading shell if needed) to the same preference so first paint matches stored mode

## 3. PWA chrome and config

- [x] 3.1 Update Studio PWA head helper so `theme-color` and status-bar style follow light vs night; leave splash images light for v1
- [x] 3.2 Revise `openspec/config.yaml` Design line: Studio defaults light; Soft-night–related night is opt-in (update design rule wording accordingly)

## 4. Contrast and stragglers

- [x] 4.1 Spot-fix Studio for hardcoded light-only colours (`bg-white`, raw hex) that break night; switch stragglers to Studio tokens
- [x] 4.2 Manually verify night: Gallery long scroll, a dialog, login, accent/danger/badge contrast ≥4.5:1, native control chrome legible
