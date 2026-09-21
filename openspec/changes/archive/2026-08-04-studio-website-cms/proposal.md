## Why

Soft night public is done, but Studio Website still mirrors an older CMS (Services packages nobody sees, Booking vs Globals split, hardcoded lanes/atmosphere/eyebrows/footer). The photographer needs a Soft night–shaped Website hub: CMS everything that matters for the live site, with frequent controls up front and rare chrome tucked away.

## What Changes

- **BREAKING:** Remove **service packages** entirely (collection, Studio tab, lib CRUD, orphaned Home expectation).
- Rethink **Website hub IA** around Soft night pages:
  - **Primary:** Home curator · About · Contact & booking (merged)
  - **Secondary:** Testimonials · FAQ (FAQ still publishes to Contact only)
  - **▼ Site chrome (tucked):** Footer blurb, section eyebrows, SEO, Privacy/Terms bodies, site display name / rare fallbacks
- **Home curator** editable to match live order: featured/hero, lanes (3× title/body/image), Work on Home (explicit picks, max 3), atmosphere (auto vs manual), About tease headline/lead; captions coached via Library.
- **Contact & booking** one tab: page voice (H1/intro), booking questions/help/calendar, reach-me (phone → WA, email, location, Instagram). Drop separate Globals top tab and unused contact-inquiry field builder / `contact_fields` intake path.
- **Library:** caption editor + explicit **Artist portrait** flag (replace caption=`"Artist"` hack); Work cover picker, reorder, and Home featuring support.
- **Public Soft night** consumes the new CMS fields (lanes, atmosphere, home Work, footer, eyebrows, legal bodies, artist flag).
- **Refinements:** Open public page from each tab; Home caption callouts; empty-state coaching; testimonials promote path surfaced in Website; SEO tucked with missing-description hints; hub subtitle Soft night language; no draft/publish workflow; no theme/craft CMS (tokens, fonts, sticky Book, film header stay code).

## Non-goals

- Theme builder / Soft night token or font CMS
- Draft/publish or staged preview environments
- Rebuilding Dashboard or Clients hubs
- Page builder / arbitrary section reorder beyond Soft night’s fixed composition
- Email/Resend notifications
- Standalone `/services` route (packages deleted, not relocated)
- Changing public mobile polish behavior already shipped

## Capabilities

### New Capabilities

- `studio-website-ia`: Soft night–shaped Website hub with primary / secondary / tucked Site chrome progressive disclosure, Contact & booking merge, and open-public-page affordances

### Modified Capabilities

- `website-content`: Remove services packages; Home curator (lanes, atmosphere, Work picks, about tease); footer/eyebrows/chrome fields; contact details move into Contact & booking; testimonials promote visibility
- `website-forms`: Booking settings live inside Contact & booking; remove contact inquiry builder remnants
- `website-seo`: SEO edited under Site chrome with missing-field coaching
- `library-media`: Caption editing; Artist portrait flag (not caption convention)
- `library-work`: Cover picker; sort/reorder UI; optional Home featuring (max 3 via Website Home curator)
- `public-home`: Consume CMS lanes, atmosphere, Work picks, about tease, eyebrows; drop services teaser expectation
- `public-about`: Artist portrait from Library flag; About subtitle/chrome from CMS when set
- `public-contact`: Page voice + booking + reach-me from merged editor; FAQ still Contact-only
- `public-legal`: Privacy/Terms bodies editable from Site chrome
- `app-shell`: Footer blurb (and related chrome) from CMS when set
- `public-soft-night`: Soft night remains content-fed without exposing craft tokens in Studio

## Impact

- Studio: `WebsitePage.tsx` IA rewrite; Library media/Work editors; Settings Globals overlap reduced
- Public: `PublicContentPages.tsx`, `PublicLayout.tsx`, `LegalPages.tsx`, About artist resolution
- Data: `website_globals` field expansion; drop `service_packages`; media Artist flag; Work home featuring / cover UX; remove `contact_fields` intake usage
- Specs: website-content purpose and services requirements replaced; OpenSpec `config.yaml` Product IA Website line updated on archive
- Clients/Dashboard unchanged except clearer path to promote testimonials from Website
