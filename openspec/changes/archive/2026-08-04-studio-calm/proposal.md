## Why

Booking Ops works, but Studio Clients feels like a stressful control panel: too many peer tabs, create forms always visible, and money/status/history competing on one screen. The photographer needs a calmer daily rhythm — one next action at a time — without losing NGN finance, People, or audit power.

## What Changes

- **Today queue** as the default Clients (and Dashboard handoff) surface: Needs a reply + Collect payment — not the full cockpit
- **Progressive booking detail**: who/when/status first; money behind “Add payment” / after confirm; notes & history collapsed
- **Softer copy**: e.g. Needs a reply (not raw `needs_contact`); “They’ve paid ₦X of ₦Y”
- **People secondary**: open from a booking; Directory not a peer daily tab equal to Bookings
- **New booking** behind a quiet “+ New” control, not a permanent form block
- **Deliveries** framed as a later step from confirmed work (“Send gallery”), not a parallel daily track
- Inbox / Feedback remain available but de-emphasized vs Today + Bookings

## Capabilities

### New Capabilities
- `studio-today`: Calm daily queue (reply + collect) as the primary Studio ops surface

### Modified Capabilities
- `booking-manager`: Progressive disclosure and quieter create/edit flows in Studio
- `client-bookings`: Booking Manager UI matches calm layers and soft labels
- `admin-dashboard`: Needs you links into Today/queue items, not a dense Bookings dump
- `client-people`: People as secondary/detail, not equal daily peer to Bookings

## Impact

- Primarily Studio UI (`ClientsPage`, `DashboardPage`); same PocketBase booking/people model from `booking-ops`
- No schema/finance feature removal — presentation and IA only
- Non-goals: redesigning the public site, new statuses, Paystack/email, deleting Inbox/Feedback/Deliveries hubs, changing NGN or +234 rules
