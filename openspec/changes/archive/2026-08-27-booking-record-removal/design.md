## Context

Bookings are written by anyone who can reach the public form, but nothing in Studio removes them. The audit capability compounds this: `booking_events` currently sets `deleteRule: null`, so events cannot be deleted by anyone through the API, and its `booking` relation is declared without `cascadeDelete`. Deleting a booking today would therefore leave events pointing at a record that no longer exists.

Two collections reference a booking: `booking_events` (always, one per material change) and `deliveries` (optionally, when a delivery was created from a booking). Those two references want opposite treatment — events belong to the booking and should go with it, while a delivery is client-facing and must not be silently orphaned.

## Goals / Non-Goals

Goals:

- Remove a booking and its audit trail together, from Studio, behind a confirmation.
- Refuse removal when it would orphan a client-facing delivery, and say what blocks it.
- Avoid stranding a person record that exists only because of the removed booking.

Non-Goals:

- Bulk removal or a selection mode. Removal is a per-record correction, and a bulk path multiplies the blast radius of a misclick.
- A trash or restore window. PocketBase gives no soft-delete primitive here, and building one for junk rows is not worth the state it adds to every query.
- Changing what `cancelled` means, or folding removal into the status lifecycle.

## Decisions

### Removal cascades to events, not to deliveries

Set `cascadeDelete: true` on the `booking_events.booking` relation and open its delete rule to authenticated users. The cascade is what makes the operation atomic in the database rather than a client-side loop that can half-fail.

The alternative — deleting events client-side before the booking — was rejected because a failure midway leaves a booking whose history is partly gone, which is worse than either outcome on its own.

Deliveries deliberately do not cascade. A delivery has a live token a client may hold, so it is a blocker, not collateral.

### The delivery check happens before the delete, and reports the blocker

Query deliveries filtered by the booking id first. If any exist, throw with the delivery's client name rather than a generic refusal, so the photographer knows what to deal with. This read is cheap and only runs on an explicit removal.

This means removal is not race-free: a delivery created between the check and the delete would be orphaned. That window is a single operator acting alone in a single-photographer tool, so a guard is not worth a transaction the backend does not offer.

### Person removal is offered, never automatic

After a booking is removed, count the person's remaining bookings and deliveries. Only at zero of both is a second confirmation offered. Automatic removal was rejected because a person is durable identity — the photographer may have added notes or a phone they still want — and because the count is a weaker signal than intent.

### Schema changes must reach existing installs

`ensure-schema.ts` currently declares rules inside the `if (!collection)` creation branch, so a rule change there never reaches a database that already has the collection. The delete rule and the cascade must be applied with an explicit update against the existing collection, in the same shape the script already uses for `website_globals`.

## Risks / Trade-offs

Removal is irreversible, and the audit trail goes with it. Mitigated by requiring confirmation that names the person and states the consequence, and by keeping removal off the primary action row. Accepted because the records this exists for are ones with no history worth keeping.

Opening `booking_events` to authenticated delete widens what a compromised Studio session can destroy. The Studio session already permits deleting the bookings themselves, so this does not add a materially new capability.

## Migration Plan

Run `ensure-schema.ts` against the existing database to apply the delete rule and the cascade. No data migration: existing events keep their relation, and the cascade only governs future deletes. The change is additive to the UI, so a partially applied schema shows the action but fails the delete with a permission error rather than corrupting anything.

## Open Questions

None.
