## Why

Contact is only a booking form, so press, collabs, and “just a question” still create `needs_contact` jobs. Inbox already presents contact messages but the public site never sends them, and several intake links (person, delivery, tab switch) do not land on the record. The photographer needs Write and Book as two intents, both in Inbox, with Bookings staying clear until he accepts.

## What Changes

- Public Contact becomes two intents on one page: **Write** (name, phone, message) and **Book** (existing request form). No `/book` nav item. Header Book still goes to `/contact#booking`.
- Write creates a `form_inquiries` row `kind: contact` (honeypot + rate limit like booking). It does not create a Booking. A Person MAY be upserted from the phone so WhatsApp is possible. No “convert to booking” action.
- Book still creates Person + Booking `needs_contact`. That request appears in Inbox only. The Bookings hub still lists accepted jobs (`pending` and after). Accept from Inbox remains the door into Bookings.
- Home drops the on-page booking form. Hero **Book** stays visible over the film header and goes to `/contact#booking`. A Write link may live in the footer or Contact intro, not as a second Home form.
- Inbox is **Requests** and **Messages**. Delivery download/created activity is not a first-class Inbox folder. Dashboard Needs-you adds unread Write messages and still links booking requests to Inbox.
- Connect-path fixes on this same flow: `?person=` opens that person; Clients tab switches keep `delivery` / `person` / `booking` params; People phone saves on blur like email; Choice questions get an options list and a required toggle; labels `htmlFor` on Write/Book and the People/delivery fields used here; film grain sits below the mobile menu; Home CMS load shows retry instead of an empty page.
- Website Contact & booking may edit a short Write blurb. It SHALL NOT grow a contact-question builder.

## Non-goals

- Contact-question CMS, “turn message into a booking”, a third public form on Home, or a `/book` route in primary nav.
- Inbox as a mail client (no reply-from-Studio). WhatsApp/phone stay the reply.
- Field design-system rewrite, Linear-style right sheets, command palette, SSR/OG share cards, TypeScript `strict`, `getFullList` picker paging, delivery hook/client dual-copy rewrite, PWA/SMTP polish, identity/SEO/About H1, Dashboard pipeline widgets or Library pulse, forgot-password, calendar/availability.
- Expanding FAQ, testimonials, notice matrix, or Gallery rooms.

Those audit items stay parked. This change is the intake spine plus the bugs that make it lie.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `public-contact`: Write + Book on Contact; contact inquiries are created from Write.
- `public-home`: Book CTA only; no Home booking form; Home error/retry; Book visible on film hero.
- `app-shell`: Book on Home chrome; grain below dialogs; `#booking` / optional `#write` hashes.
- `website-forms`: Write is a public intake path; still no contact-question builder; Choice options + required in the booking-question editor.
- `client-inbox`: Messages + Requests; show `kind: contact`; booking requests stay here until Accept.
- `booking-manager`: Public Write is a second intake; `needs_contact` is not listed in the Bookings hub.
- `client-bookings`: Unaccepted web requests are Inbox work, not hub rows.
- `admin-dashboard`: Needs-you includes unread Write messages; booking requests link to Inbox.
- `client-people`: Directory phone saves on blur; `?person=` focuses that person.
- `studio-app-shell`: Clients tab changes merge query params; View client deep link works.

## Impact

- `PublicContentPages.tsx` Contact + Home, `BookingSection.tsx`, new short Write form (or a sibling), `PublicLayout.tsx`, `index.css` grain z-index.
- `website.ts` (`submitInquiry` revived for contact only), `ContactBookingTab.tsx` (options, required, Write blurb).
- `ClientsPage.tsx` Inbox filter, folders, URL params, People phone, `dashboard.ts`, `BookingsPage.tsx` View client.
- `openspec/config.yaml` Design: Home booking block becomes a CTA; Contact is Write + Book.
- PocketBase: existing `form_inquiries` + people/bookings hooks (honeypot/rate limit) cover Write; no new collection.
