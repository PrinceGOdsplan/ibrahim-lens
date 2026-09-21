## 1. Schema and cleanup

- [x] 1.1 Extend `website_globals` for Home curator (lanes, atmosphere mode+ids, home_work ids, about tease), Contact voice, Site chrome (footer blurb, eyebrows map, legal bodies, site display name); stop using `contact_fields` for intake
- [x] 1.2 Add `media` Artist portrait flag; one-time migrate caption=`Artist` → flag; enforce single Artist when setting
- [x] 1.3 Remove `service_packages` from schema ensure + delete Studio/lib package APIs; drop seed/create paths
- [x] 1.4 Note pb_data backup before destructive package collection removal in ops/docs or script comment

## 2. Library media and Work

- [x] 2.1 Library: caption edit UI + save
- [x] 2.2 Library: Artist portrait flag UI (clear previous)
- [x] 2.3 Work: cover image picker from attached images
- [x] 2.4 Work: reorder / sort controls for list order

## 3. Website hub IA

- [x] 3.1 Restructure Website tabs: primary Home · About · Contact & booking; secondary Testimonials · FAQ; tucked ▼ Site chrome; remove Services and Globals top tabs; Soft night hub subtitle
- [x] 3.2 Home curator UI: featured + caption callouts, lanes (3), Work picks (max 3), atmosphere auto/manual, About tease; empty-state coaching
- [x] 3.3 About tab: body, subtitle, Artist portrait status + Library guidance
- [x] 3.4 Contact & booking tab: H1/intro, booking help/calendar/questions, reach-me (phone/email/location/IG)
- [x] 3.5 Site chrome: footer blurb, eyebrows, SEO (with missing Home/Contact description hints), Privacy/Terms bodies, rare fallbacks
- [x] 3.6 Open public page controls on primary tabs; Testimonials promote-from-feedback affordance

## 4. Public Soft night consumers

- [x] 4.1 Home: lanes, atmosphere mode, Work picks, About tease, eyebrows from CMS; no services teaser
- [x] 4.2 About: Artist flag portrait + subtitle; Contact: voice + reach-me from merged editor
- [x] 4.3 Footer blurb + legal bodies from Site chrome; defaults when empty
- [x] 4.4 Fix Work detail SEO application if still discarded; keep Soft night craft code-only

## 5. Verify

- [x] 5.1 Smoke Studio→public: Home curator, About Artist, Contact & booking, FAQ secondary, Site chrome footer/legal/SEO, no packages UI
- [x] 5.2 Build passes; seed/ensure-schema still boots; Clients/Dashboard unchanged aside from testimonials promote entry if linked
