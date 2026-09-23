## 1. Schema + codes

- [ ] 1.1 Add unique `short_code` on `deliveries`; guest list/view rules accept token or short_code via query
- [ ] 1.2 Generate short_code on Delivery create; backfill existing rows in ensure-schema / hook

## 2. Public resolve + share surfaces

- [ ] 2.1 `getDeliveryByToken` / Delivery page resolve short or long; file URLs keep using record.token
- [ ] 2.2 `deliveryPublicUrl` prefers short_code; Studio copy uses it
- [ ] 2.3 Client gallery mail + delivery-og prefer short `/g/{short_code}`

## 3. Verify

- [ ] 3.1 Lint/typecheck clean for touched files
- [ ] 3.2 Smoke: create Delivery → copy short link → open gallery; long token still works; OG path with short code
