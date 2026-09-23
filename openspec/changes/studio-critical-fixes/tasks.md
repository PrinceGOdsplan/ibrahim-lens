## 1. Delivery file serve

- [x] 1.1 Rewrite `GET /api/ibrahim/delivery-file/...` to serve via `$app.newFilesystem()` (thumb key → original → linked media fallback)
- [x] 1.2 Honor `dl=1` with attachment disposition; keep download stamp + inbox event

## 2. Photographer notices

- [x] 2.1 Stop suppressing booking (`source=website`) and Write (`kind=contact`) notices when `e.auth` is set
- [x] 2.2 Add Studio toast/banner for newly arrived in-app notices while Studio is open

## 3. List pagination

- [x] 3.1 Add shared batched list helper; switch bookings/clients/website/dashboard/library secondary lists off unbounded `getFullList`
- [x] 3.2 Add Load more on Bookings and Clients primary lists

## 4. Verify

- [x] 4.1 Lint/typecheck clean for touched files
- [x] 4.2 Smoke: delivery thumb + single + zip download; booking/Write notify with Studio cookie; toast in Studio; Load more on Bookings/Clients
