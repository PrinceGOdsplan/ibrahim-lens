## Context

See proposal.md — Why. Public site already uses bold near-black tokens, Portraits · Fashion · Lifestyle lanes, and WhatsApp helpers. Gaps: hero still shows WhatsApp; Contact still mounts an inquiry form above booking; demo media is Picsum; chrome lacks sparse street-energy craft. Studio and PocketBase schema stay unchanged.

## Goals / Non-Goals

**Goals:**
- Hero: Book + Portfolio (`/portfolio`) only
- WhatsApp only in footer + Contact (under booking)
- Contact: booking → details/WhatsApp → FAQ; remove inquiry UI
- Sparse ornaments: grain + thin ribbons/print marks; intense, professional
- One-shot IG stills → seed-assets → FORCE seed prefers them

**Non-Goals:**
- Runtime IG; Meta Graph product; floating WA widgets; Studio redesign; heavy decoration

## Decisions

### 1. Hero Portfolio link targets `/portfolio`
**Choice:** Label “Portfolio”, route `/portfolio` (grid), not `/work`.  
**Why:** User locked Portfolio; Work remains a separate proof surface lower on Home / in nav.  
**Alt:** Label Portfolio but link Work — rejected (misleading).

### 2. WhatsApp placement
**Choice:** Footer + Contact under booking only. Remove from hero CTA row; remove from Home booking side-link if present; nav may keep or drop — **prefer drop from nav** so “secondary direct contact” is footer/Contact, not always-on chrome.  
**Why:** Matches locked decision; Book stays primary.  
**Alt:** Keep nav WhatsApp — optional later if he wants always-one-tap.

### 3. Drop inquiry form in UI
**Choice:** Remove `ContactInquiryForm` from Contact page (and unused export if nothing else uses it). Spec already forbids public contact-kind intake.  
**Alt:** Hide behind flag — unnecessary.

### 4. Ornament kit (sparse)
**Choice:** CSS-only on public root:
- Light film grain overlay (`pointer-events: none`)
- Thin diagonal gold/white hairline “ribbons” on 1–2 Home section openers + subtle footer rule treatment
- Optional oversized faint lane stamp behind one section
- Motion: grain settle + one ribbon draw / section reveal; honor `prefers-reduced-motion`
**Why:** Energy without card frames or neon. Photos remain the party.  
**Alt:** Full ribbon frames / watermarks — rejected (non-goals / product no watermarks).

### 5. Instagram one-shot fetch
**Choice:** Dev script (e.g. `scripts/fetch-ig-seed.ts` or npm script wrapping `gallery-dl` / `instaloader`) targeting `ibra.himlens`, writing stills to `scripts/seed-assets/instagram/`. Prefer all public stills; soft-cap only if needed for disk/time (document cap). Seed demo prefers those files when present; on failure warn and keep existing / Picsum fallback.  
**Why:** User chose path 2 (no manual export).  
**Alt:** Meta API — out of scope. Manual export — rejected.

### 6. Design context update
**Choice:** Update `openspec/config.yaml` Design: hero Book + Portfolio; WhatsApp footer/Contact; street-craft ornaments; IG seed one-shot only.  
**Why:** Design section is the editable public craft source of truth.

## Risks / Trade-offs

- [IG blocks / login wall] → Warn; do not fail entire seed; keep existing media  
- [Too many IG images] → Soft max (e.g. 40) with log; Portfolio can be curated later in Studio  
- [Ornaments fight photos] → Keep grain opacity low; ribbons only at section openers  
- [ToS / fragile tooling] → Document as local demo only; never call from production request path  
- [Nav still has WhatsApp] → Explicitly remove from nav in this change unless feedback asks to restore

## Migration Plan

1. Implement UI/CTA/Contact/ornament changes (no schema migrate)
2. Add IG fetch script + wire seed preference
3. Run fetch once locally → FORCE seed
4. Smoke Home hero, Contact order, footer WA, Portfolio grid images
5. Rollback UI via git; seed media remains in PocketBase until re-seeded

## Open Questions

None blocking — nav WhatsApp removal is decided above (remove). Soft IG image cap number can be tuned during implement without spec change.
