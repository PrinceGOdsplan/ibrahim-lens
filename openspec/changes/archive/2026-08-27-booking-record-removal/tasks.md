# Tasks

## 1. Schema

- [x] 1.1 In `scripts/ensure-schema.ts`, set `booking_events.deleteRule` to the authenticated rule and `cascadeDelete: true` on its `booking` relation
- [x] 1.2 Apply both as an explicit update against the existing collection, outside the `if (!collection)` creation branch, so installs that already have `booking_events` receive them
- [x] 1.3 Run the script against the local database and confirm the rule and cascade are present

## 2. Data layer

- [x] 2.1 Add `deliveriesForBooking(bookingId)` to `src/lib/clients.ts`, returning the deliveries that reference a booking
- [x] 2.2 Add `removeBooking(bookingId)` to `src/lib/bookings.ts`: refuse with a message naming the blocking delivery's client when one exists, otherwise delete the booking and let the cascade take its events
- [x] 2.3 Add `personReferences(personId)` to `src/lib/clients.ts`, reporting remaining booking and delivery counts
- [x] 2.4 Add `removePerson(personId)` that refuses when either count is non-zero
- [x] 2.5 Route both failures through `pbErrorMessage` so the photographer sees plain language

## 3. Studio action

- [x] 3.1 Add a removal action to the Bookings detail pane in `src/pages/studio/ClientsPage.tsx`, placed away from the primary action row and styled with `text-studio-danger`
- [x] 3.2 Wire it to the existing `useConfirm` dialog, naming the person and stating that the booking and its history are removed and cannot be recovered
- [x] 3.3 Run it through the existing scoped `busyScope` so only the affected row is disabled
- [x] 3.4 On success, clear the selected booking, refresh the list, and report the outcome through the existing `Alert`
- [x] 3.5 When the removal leaves the person unreferenced, offer a second confirmation to remove the person; declining leaves them in place
- [x] 3.6 Surface the blocked case as an error naming the delivery rather than a silent no-op

## 4. Verification

- [x] 4.1 `npm run build` and `npm run lint` pass
- [x] 4.2 Removing a booking with no delivery removes it and its events, and the Dashboard and Clients counts drop
- [x] 4.3 Removing a booking that a delivery references is refused, and the message names that delivery
- [x] 4.4 Dismissing the confirmation leaves the booking unchanged
- [x] 4.5 A person with another booking is retained with no offer; a person left with nothing is offered for removal and declining keeps them
- [x] 4.6 Setting a booking to `cancelled` still leaves it listed with its history
