## Context

See proposal.md — Why. Studio already exposes CSS tokens (`--color-studio-*`) and Tailwind `studio-*` utilities, with `.studio-shell` carrying type + `color-scheme: light` for the layout and portalled dialogs via `SurfaceProvider`. Public Soft night tokens live beside them in `@theme`. Preference persistence already exists for nav collapse and Gallery columns. PWA head (`studio-pwa.ts`) hard-codes light `#F7F7F5` theme-color and status-bar `default`.

OpenSpec Design currently says Studio stays light-only; this change revises that to default light + opt-in Soft-night–related night.

## Goals / Non-Goals

**Goals:**

- Swap Studio token values under the shell for light vs night without rewriting hub markup
- One header control; localStorage restore; login + portals + theme-color follow
- Keep Studio type and tool patterns; night colour kinship with Soft night

**Non-Goals:**

- Night splash asset set, system preference auto, Settings Appearance UI
- Cool gray palette, Gallery-only dim, public Soft night type in Studio

## Decisions

### 1. Attribute on `.studio-shell`, not a second shell class

**Choice:** `data-studio-appearance="light" | "night"` on `.studio-shell` (and the same attribute/class pair on portalled Studio roots). CSS overrides Studio CSS variables under `[data-studio-appearance="night"]`.

**Why:** Existing components already use `bg-studio-bg` / `text-studio-fg` / etc. Token swap is the lowest-churn path. Alternatives: duplicate utility classes per mode (rejected — huge surface), or `next-themes` (rejected — overkill for two Studio-only modes).

### 2. Night palette = Soft night cousins, Studio accent flips

**Choice:** Night maps Studio bg/panel/border/fg/muted to Soft night ground/raised/fg/muted kinship (`#100e0b`, `#16120e`, ivory, muted). Accent on night uses Soft night brass `#c9922e`; light keeps deep `#7a5210`. Danger stays mode-appropriate (public danger warm red is fine on night; light keeps Studio danger).

**Why:** Matches “related to Soft night” without adopting Syne/Sora. Alternative: cooler zinc night (rejected — user chose Soft night kinship).

### 3. Small preference module + header toggle

**Choice:** `localStorage` key (e.g. `studio-appearance`) with `light` | `night`, read on Studio mount (layout + login). Header icon-only Moon (when light → go night) / Sun (when night → go light), 44px hit, `aria-label` for the action. No Settings mirror in v1.

**Why:** Same pattern as `studio-nav-collapsed` / gallery cols; one-tap during Gallery sessions. Alternative: Settings-only (rejected — too many taps mid-session).

### 4. PWA chrome follows; splash stays light

**Choice:** `useStudioPwaSurface` / theme-color / `apple-mobile-web-app-status-bar-style` follow the active mode (`default` vs `black-translucent` or black as appropriate for night). Splash PNGs unchanged for v1.

**Why:** Spec allows light splash flash; regenerating five splash sizes is out of proportion for glare relief.

### 5. Revise OpenSpec config Design line on implement/archive

**Choice:** Update `openspec/config.yaml` Design: Studio defaults light `#F7F7F5`; night Soft-night–related and opt-in. Design rule “Studio stays light tool” becomes “Studio defaults light; night Soft-night–related opt-in.”

**Why:** Avoid the next change re-asserting light-only forever.

## Risks / Trade-offs

- **[Hardcoded non-token colours]** → Spot-check Studio for `bg-white` / raw hex; migrate stragglers to tokens where they break night.
- **[Light splash → night shell flash]** → Accept for v1; document; optional later splash set.
- **[Studio night ≈ public Soft night]** → Keep Cormorant/Figtree and tool chrome density so identity stays “desk,” not “site.”
- **[Contrast regressions]** → Verify accent, danger, badge invert, muted text on night at ≥4.5:1.
- **[FOUC on first paint]** → Prefer applying stored preference as early as practical on Studio routes (inline read before paint where easy; otherwise accept brief light flash only on cold load).

## Migration Plan

- Ship as UI-only preference; no schema/API migration.
- Existing installs stay light until the photographer toggles night.
- Rollback: remove toggle + night CSS; light tokens remain the `@theme` defaults.

## Open Questions

(none — naming is icon-only; splash and Settings deferred by proposal)
