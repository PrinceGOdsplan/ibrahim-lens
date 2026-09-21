## 1. Tokens and public shell

- [x] 1.1 Update public CSS `@theme` tokens to atelier ink / cool ivory / muted steel (de-emphasize champagne as primary accent); keep Studio tokens unchanged
- [x] 1.2 Rebuild `PublicLayout`: film-thin/transparent header over hero surfaces + dedicated mobile menu; footer stays secondary legal links
- [x] 1.3 Add reduced-motion-safe presence utilities (hero fade/scale, brand settle) used by Home

## 2. Home as bar

- [x] 2.1 Hero: full-bleed or overlapping dominant plane from first `home_featured`; brand + one line + Book only; scrim for contrast; intentional empty fallback
- [x] 2.2 Selected strip: remaining featured picks as horizontal asymmetric scroll below hero (not hero tile collage)
- [x] 2.3 Below-fold services + testimonials as editorial (non-card) layouts; booking section without bordered card chrome; Book still scrolls to `#booking`

## 3. Immersive open + galleries

- [x] 3.1 Shared public immersive image open (focus trap, Esc, prev/next, no watermarks)
- [x] 3.2 Portfolio: uneven / mixed-scale gallery rhythm + wire immersive open
- [x] 3.3 Work index covers as artistic planes; Work detail gallery + immersive open

## 4. About, Contact, Delivery

- [x] 4.1 About: editorial photo+text rhythm (or strong typographic fallback)
- [x] 4.2 Contact + booking forms: atelier editorial presentation (hairlines/spacing, no card panel default)
- [x] 4.3 Delivery `/g/:token`: atelier styling, quiet countdown, immersive open; download/feedback behavior unchanged

## 5. Verify

- [x] 5.1 Desktop + mobile smoke: Home bar, Selected strip, mobile menu, lightbox a11y, `prefers-reduced-motion`
- [x] 5.2 Confirm no PocketBase schema/seed changes required for this craft-only change; Studio UI visually unchanged
