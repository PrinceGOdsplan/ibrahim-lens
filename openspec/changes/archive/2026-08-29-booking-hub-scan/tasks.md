## 1. Helpers

- [x] 1.1 Add hub view type, list filter, schedule sort, and unpaid-balance helper in `bookings.ts`

## 2. Hub list and views

- [x] 2.1 Replace status/payment selects with Upcoming / Incomplete / Unpaid / All chips; persist `view` in the URL; default Upcoming
- [x] 2.2 List rows show person, date/time, status, payment; mark incomplete and outstanding; sort soonest date first
- [x] 2.3 Outstanding total switches to the Unpaid view

## 3. Read-first card

- [x] 3.1 Default card shows facts and next-step actions (Confirm, Complete, Record payment, Set fee); editor behind Edit details
- [x] 3.2 Record payment adds received NGN up to the fee; Set fee clears the incomplete alert

## 4. Verify

- [x] 4.1 Smoke: Upcoming list readable without click; Confirm from card; Incomplete then Set fee; Unpaid then Record payment; Edit details still saves schedule/notes; reload keeps view

## 5. Manual create

- [x] 5.1 New booking form collects person (with email), schedule, fee/paid, notes, and website questions; lands as pending; only clears after a successful save
