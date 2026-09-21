## Why

Long Gallery sessions on the light Studio desk cause glare. The photographer needs one Soft-night–related night mode for the whole Studio shell — opt-in, one tap from the header — without turning Studio into the public site or adding a gray/cool dark variant.

## What Changes

- Add a two-mode Studio appearance: **light** (default, today’s desk) and **night** (warm Soft-night–related token ladder).
- Persist the preference in `localStorage` (same pattern as nav collapse / Gallery columns).
- Put an icon-only sun/moon toggle in the Studio app header (44px hit), available while working any hub including Gallery.
- Apply night tokens through `.studio-shell` (and portalled Studio surfaces) so chrome, hubs, dialogs, and login follow the preference.
- When night is active: Soft-night–cousin colours, Studio Cormorant/Figtree unchanged, accent that clears contrast on the night ground (Soft night brass is appropriate on night; deep Studio brass stays on light).
- Sync browser `theme-color` / `color-scheme` (and Apple status-bar style where we already set it) with the preference. Launch splash images may stay light for v1.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `studio-app-shell`: Light + Soft-night–related night modes; header sun/moon toggle; preference persistence; shell/portals/login follow mode; accent role per mode
- `public-soft-night`: Soft night remains public craft; Studio may opt into a Soft-night–related night desk (no longer “Studio always light only”)
- `studio-quiet-panels`: Quiet inputs follow the active Studio mode (light or night), still not public Soft night form chrome
- `ux-accessibility`: Studio night declares a dark colour scheme so native control chrome stays legible

## Impact

- `src/index.css` — night token overrides under `.studio-shell`
- `StudioLayout.tsx` — header toggle; preference applied to shell
- `StudioLoginPage` / RequireAuth — follow preference so first paint matches
- `studio-pwa.ts` — `theme-color` / status-bar follow mode; splash stays light for v1
- `SurfaceProvider` / dialog portals — inherit night via `studio-shell`
- OpenSpec `config.yaml` Design line: Studio defaults light; night Soft-night–related and opt-in
- No PocketBase, public Soft night visitor craft, or Delivery (`/g/`) changes

## Non-goals

- Cool graphite / SaaS gray as a third or substitute mode
- Three-way light / gray / dark, or `prefers-color-scheme` auto in v1
- Gallery-only dimming (chrome stays light)
- Syne/Sora or Soft night voice inside Studio
- Regenerating night splash PNGs (v1 keeps light splash)
- Settings Appearance panel (header toggle is enough)
- User-editable theme CMS or per-hub themes
