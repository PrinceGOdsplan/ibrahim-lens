## Why

Bookings can be created but never removed. The public form is open to anyone, so the Bookings list accumulates records that are not real work — test submissions, spam, and accidental duplicates — and the only way to clear them today is to edit the database directly. Setting a booking to `cancelled` is the wrong tool: cancelling records that a real engagement did not happen, which is a fact worth keeping, whereas a junk row is a fact that was never true.

This surfaced during verification of `app-ux-integrity`, where exercising the public booking form left records in the list with no way to remove them from Studio.

## What Changes

- Add a permanent removal action for a booking in Clients → Bookings, distinct from the `cancelled` status.
- Require an explicit confirmation that names the person and states what is removed, consistent with the existing destructive-action contract.
- Remove a booking's audit events along with the booking, so removal does not leave an unreachable trail. This is a deliberate carve-out from the append-only audit contract: events are immutable for as long as their booking exists, and are removed only with it.
- Refuse removal while a delivery still references the booking, and say which delivery blocks it, so client-facing links cannot be orphaned.
- Leave the linked person in place. Offer to remove the person too only when that person has no other bookings and no deliveries.
- **BREAKING** (schema): `booking_events` must permit authenticated delete, and its `booking` relation must cascade, so a booking and its trail are removed together.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `booking-manager`: adds permanent removal of a booking as a distinct operation from the status lifecycle, with a blocking rule when a delivery references it.
- `booking-audit`: narrows the append-only guarantee so events are immutable for the life of their booking and are removed with it, rather than outliving it unreachable.
- `client-people`: adds the conditional offer to remove a person left with no bookings and no deliveries.

## Impact

- `src/lib/bookings.ts`: a removal function that checks for referencing deliveries, deletes the booking's events, then the booking.
- `src/lib/clients.ts`: a helper reporting whether a person is unreferenced.
- `src/pages/studio/ClientsPage.tsx`: the removal action in the Bookings detail pane, wired to the existing `useConfirm` dialog and scoped busy state.
- `scripts/ensure-schema.ts`: `booking_events` delete rule and `cascadeDelete` on its `booking` relation, applied to existing installs rather than only new collections.
- Counts on the Dashboard and Clients hub shift when records are removed; no migration of existing data is required.
