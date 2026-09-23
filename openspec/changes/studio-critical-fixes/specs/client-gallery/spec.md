## MODIFIED Requirements

### Requirement: Download originals
Clients SHALL be able to download delivered images at original resolution without watermarks. Guest preview thumbs and original downloads SHALL be served through the tokenized delivery-file path using the app’s configured file storage (local disk or object storage). When a Delivery file copy is missing from storage but the linked Library media still exists, the route SHALL serve that media file for the valid token so the gallery remains usable. Individual download and bulk (zip) download SHALL both obtain bytes from that path.

#### Scenario: Download original
- **WHEN** a client downloads an image from a valid Delivery
- **THEN** the file provided is the original-resolution asset without a watermark overlay

#### Scenario: Preview thumb on object storage
- **WHEN** a client opens a valid Delivery gallery whose delivery files are stored on object storage
- **THEN** photograph thumbs and immersive previews load successfully

#### Scenario: Bulk download zip
- **WHEN** a client chooses download all on a valid Delivery with multiple photographs
- **THEN** each original is fetched successfully and packed into one downloadable archive

#### Scenario: Missing delivery copy falls back to media
- **WHEN** a valid Delivery file row has no blob at its storage key but still references Library media that exists
- **THEN** the tokenized route serves that media file for preview and download
