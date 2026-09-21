# seed-demo-media Specification

## Purpose

Provides a developer one-shot path to fetch public Instagram stills from the photographer’s profile into local seed assets and upload them into PocketBase Portfolio/hero demo media for realistic local preview — never at public runtime.

## Requirements

### Requirement: One-shot Instagram stills for seed
The system SHALL provide a seed/dev path that attempts to download public still images from Instagram handle `ibra.himlens` into a local seed-assets directory for demo seeding only.

#### Scenario: Successful fetch
- **WHEN** an operator runs the Instagram seed-fetch step and the profile is reachable
- **THEN** still images are saved under the project’s seed-assets path for later FORCE seed upload

#### Scenario: Prefer volume then fall back
- **WHEN** the fetch runs
- **THEN** it attempts to collect as many public stills as practical (prefer all available posts’ stills) and continues with whatever subset succeeds if the source rate-limits or truncates

### Requirement: Seed prefers local IG assets over stock
When FORCE demo seed runs and local Instagram seed-assets exist, demo Portfolio/hero media seeding SHALL prefer those files over generic stock placeholders.

#### Scenario: Assets present
- **WHEN** FORCE seed runs and seed-assets contain Instagram stills
- **THEN** Portfolio/featured demo media are populated from those files

#### Scenario: Fetch unavailable
- **WHEN** Instagram fetch fails or no local assets exist
- **THEN** seed SHALL warn and MAY keep existing media or fall back to prior placeholder behavior without failing the whole seed pipeline

### Requirement: No runtime Instagram dependency
The public site SHALL NOT fetch, scrape, or embed Instagram media at request time. Instagram is seed/dev only.

#### Scenario: Public page load
- **WHEN** a visitor loads any public page
- **THEN** images are served from PocketBase (or static app assets), not from a live Instagram request
