## 1. Studio shell

- [x] 1.1 Make Studio `<main>` fill the remaining viewport height and stop scrolling (`overflow-hidden` column)
- [x] 1.2 Give each hub root (`Dashboard`, `Website`, `Clients`, `Settings`, `Gallery`) a fill-height column whose work surface scrolls inside leftover height
- [x] 1.3 Confirm no PocketBase schema, seed, or `pb_data` migration is required (front-end only)
- [x] 1.4 Lock document scroll while Studio is open; sidebar is overflow-hidden and never a scroller

## 2. Gallery chrome

- [x] 2.1 Pin Gallery title, rooms, and filters above the wall; remove the large dashed upload card from the header
- [x] 2.2 Add a compact Add photos control on the title row that opens the existing file picker
- [x] 2.3 Accept dropped files on the Gallery and Portfolio walls

## 3. Windowed wall

- [x] 3.1 Add a paged media list helper (vault + optional tag, date or name sort) and keep `listMedia()` for pickers
- [x] 3.2 Load the first page when opening Gallery or Portfolio; append the next page when the wall scrolls near the end
- [x] 3.3 Reset to page 1 when room, sort, or tag filter changes

## 4. Verify

- [x] 4.1 `npm run build` and `npm run lint` pass
- [x] 4.2 Scrolling the Gallery wall leaves hub nav and Gallery chrome still
- [x] 4.3 Opening Gallery with many photos does not request every thumbnail up front; more appear as the wall scrolls
