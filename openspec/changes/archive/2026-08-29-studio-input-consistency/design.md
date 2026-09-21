## Context

See proposal.md — Why. Shared `Input` is underline + transparent. Website uses `quietTextareaClass` (underline, `outline-none`). Bookings/Clients/Work hand-roll boxed `textarea`/`select` with `bg-studio-bg`. `PhoneNgInput` studio tone is a boxed split beside underline `Input`. Gallery search is a one-off underline; Clients search uses `Input`. ImageSheet Saved uses `text-emerald-800`. Night appearance already swaps Studio tokens; boxed `bg-studio-bg` equals the page ground.

## Goals / Non-Goals

**Goals:**

- One primitive set: `Input` (unchanged idea), `Textarea`, form `Select`, toolbar `Select`
- Phone + money + search align with that set
- Night: panel fill on boxed leftovers; contrast-safe Saved

**Non-Goals:**

- Public Soft night form restyle
- Custom date widget
- Rewriting notice product rules

## Decisions

### 1. Underline is the text default; boxes are for closed controls

**Choice:** Text and textarea stay bottom-border, transparent fill. Select and the phone prefix stay closed shapes filled with `studio-panel`.

**Why:** Matches existing `Input` and Website quiet panels. Boxing every field on night still fights the desk. Alternative: box everything with panel (rejected — louder than current Website, worse for long CMS text).

### 2. Shared primitives, not more class strings

**Choice:** `Textarea` mirrors `Input` (same border/focus/type size). `Select` has `size="form" | "toolbar"`. `quietTextareaClass` becomes the Textarea classes (or re-exports them) so Website imports stay thin.

**Why:** Bookings/Clients copy-paste is how the boxed family spread.

### 3. Phone: underline field + quiet prefix

**Choice:** Studio tone: `+234` as muted prefix (panel or transparent, no heavy split box) and national digits as underline `input` matching `Input`. Public tone unchanged.

**Why:** Same row as name/email. Alternative: one full boxed row (clearer tap target, but reintroduces a second family in the grid).

### 4. Money: ₦ + text/numeric, not spinner

**Choice:** Small `NairaField` (or inline prefix + `Input` with `inputMode="decimal"` and `type="text"` pattern) wrapping fee/paid. Avoid `type="number"` spinners on blur-save.

**Why:** Placeholder “NGN” disappears when typing; spinners steal blur.

### 5. Focus ring everywhere text-like

**Choice:** Same `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg` on Input, Textarea, Select, Gallery search. Drop `outline-none` on quiet textarea.

**Why:** Accessibility spec already forbids 1px-border-only focus.

## Risks / Trade-offs

- **[Bookings density]** Underline notes in a 3-col grid may feel lighter than boxes — acceptable; labels stay.
- **[Native select]** UA paint still varies; `color-scheme` + panel fill is enough.
- **[NairaField vs inline]** Keep a tiny helper in `components/ui` or `studio` to avoid a third money style.

## Migration Plan

- Replace hand-rolled classes in place; no data migration.
- Rollback: primitives stay; pages can revert class names.

## Open Questions

(none)
