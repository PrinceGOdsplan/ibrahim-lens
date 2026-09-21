## 1. Product copy and hooks

- [x] 1.1 Update `openspec/config.yaml` Design: Home Book is a CTA to `/contact#booking` (no on-page Home form); Contact is Write then Book.
- [x] 1.2 Ensure `form_inquiries` create applies the same trap + origin rate limit as booking people-create; reject filled trap; do not create a Booking from Write.
- [x] 1.3 Confirm no new PocketBase collection; existing `pb_data` backup docs still apply (no extra volume).

## 2. Public Write + Contact page

- [x] 2.1 Add a Write form (name, +234 phone, message, honeypot) that calls `submitInquiry('contact')` and MAY upsert a Person by phone; no Booking.
- [x] 2.2 Restack `/contact`: page voice, Write (`#write`), Book (`#booking`, shared form without its own H1), reach-me, FAQ. Wire `htmlFor` on Write fields.
- [x] 2.3 Show field-level phone errors on Write; in-flight submit lock like booking; outcome next to the submit control.

## 3. Public Home and chrome

- [x] 3.1 Remove the Home `BookingSection`; hero Book and header Book (including film hero) go to `/contact#booking`.
- [x] 3.2 Footer (and/or Contact intro) may link to `/contact#write`; do not add a Home Write form.
- [x] 3.3 Lower `.street-grain` z-index below header and mobile menu.
- [x] 3.4 Home content fetch failure shows an error with retry, not an empty page.
- [x] 3.5 Hash `#booking` / `#write` on Contact still scroll into view after load.

## 4. Website editor (booking questions + Write blurb)

- [x] 4.1 Contact & booking: optional Write blurb field; no contact-question builder.
- [x] 4.2 Choice questions: options add/remove; seed options when type becomes choice; required checkbox per question honored on the public Book form.

## 5. Inbox and Dashboard

- [x] 5.1 Stop filtering `kind === 'contact'` out of Inbox; primary folders are Requests and Messages (not Activity/Everything as intake).
- [x] 5.2 Requests remain `needs_contact` bookings; Accept still sets `pending` and opens `/studio/bookings?booking=`.
- [x] 5.3 Dashboard Needs-you: unread Write messages + booking requests both link to Inbox; unpaid accepted jobs still link to Bookings.

## 6. Connect-path Studio bugs

- [x] 6.1 `setTab` merges query params; keep `person` / `booking` / `delivery` / `feedback` when they still apply.
- [x] 6.2 `?tab=people&person=` selects that person (`peopleFocusId` from URL).
- [x] 6.3 People phone persists on blur (or explicit save), not each keystroke; label `htmlFor` + PhoneNgInput `id` on add and edit.
- [x] 6.4 Delivery create / People fields used on this path get `htmlFor`/`id` (Person, Booking, Client name).

## 7. Check the spine

- [x] 7.1 Public: Write → Inbox Messages; Book → Inbox Requests; Accept → Bookings hub; Bookings list has no `needs_contact` row.
- [x] 7.2 Public: Home has no form; Book from hero and film header reaches Contact booking; mobile menu is not under grain.
- [x] 7.3 Studio: View client opens the person; Inbox → People keeps `person` in the URL.
