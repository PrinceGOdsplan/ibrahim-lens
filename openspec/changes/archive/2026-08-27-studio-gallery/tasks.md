## 1. Schema and library API

- [x] 1.1 Add media `vault` and `copied_from` in ensure-schema; defaults for existing rows
- [x] 1.2 Library API: list by vault, promoteToPortfolio (one-way copy), deleteGallery with copy detection, listPortfolio from vault
- [x] 1.3 Idempotent migration: in_portfolio → Portfolio copies; originals stay Gallery

## 2. Gallery hub UI

- [x] 2.1 Rename nav/route to Gallery; redirect /studio/library
- [x] 2.2 Rebuild Gallery wall: pure thumbs, sort/filter date·name·tag, column density handle (persisted), quiet sheet
- [x] 2.3 Portfolio / Albums / Work rooms under Gallery; Portfolio shows Portfolio pile; Send to Portfolio + delete prompt

## 3. Pickers and verify

- [x] 3.1 Website StudioImageGallery can pick Gallery or Portfolio
- [x] 3.2 Production build passes
