## Purpose

Defines app-like Studio interaction for Ibrahim Lens Website and Library hubs: short scrolling shell, full-screen modals, a shared image gallery picker, layman labels, and phone-first usability for a single photographer operator.

## ADDED Requirements

### Requirement: Short Studio shell scroll
Website and Library hub screens SHALL keep primary content within a short shell (checklist and primary actions). Long forms and large image grids SHALL open in full-screen modals so the hub itself barely scrolls. Scrolling inside modals is allowed.

#### Scenario: Open Website Home on phone
- **WHEN** the photographer opens Website → Home on a phone-width viewport
- **THEN** they see a compact checklist and primary edit actions without an endless page of inline editors

### Requirement: Full-screen edit modals
Editing Featured, Services, Work on Home, Portfolio strip, About tease/photo, and comparable Website or Library image/detail tasks SHALL open a full-screen (or near full-screen) modal rather than navigating away to a disconnected page for the same task.

#### Scenario: Edit Services
- **WHEN** the photographer activates Edit Services
- **THEN** a full-screen modal opens for that task and closing it returns them to the Website Home surface

### Requirement: Shared modal image gallery
Studio SHALL provide a shared image gallery modal to select one or more Library images with filter chips at least for All, Portfolio only, and by tag. After confirming selection, the photographer SHALL return to the calling panel to set captions or other details (pick first, caption after).

#### Scenario: Pick Featured then caption
- **WHEN** the photographer picks Featured images in the gallery modal and confirms
- **THEN** they return to the Featured editor where they can set captions for those picks without a separate Library page hop as the only path

### Requirement: Layman Studio labels
Studio Website copy SHALL use layman labels: Services (Home booked-for cards), Portfolio strip (Home masonry), About photo, More site settings, and Featured. It SHALL NOT require the photographer to know internal names such as lanes, atmosphere, or Site chrome.

#### Scenario: Home actions readable
- **WHEN** the photographer views Website → Home primary actions
- **THEN** labels include Edit Featured, Edit Services, Edit Work on Home, Portfolio strip, and About tease (or equivalent plain wording)

### Requirement: Phone-first Studio modals
Full-screen modals SHALL be usable on phone viewports as the primary Studio device class for this change.

#### Scenario: Gallery on phone
- **WHEN** the photographer opens the image gallery modal on a phone
- **THEN** they can filter, select, and confirm without relying on desktop-only chrome
