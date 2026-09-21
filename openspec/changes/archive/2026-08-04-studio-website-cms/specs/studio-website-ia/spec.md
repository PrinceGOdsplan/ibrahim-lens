## Purpose

Defines Soft night–shaped Website hub information architecture: primary Home / About / Contact & booking tabs, secondary Testimonials and FAQ, and tucked Site chrome for rare CMS fields — with open-public-page affordances and progressive disclosure.

## ADDED Requirements

### Requirement: Soft night Website hub layout
The Website hub SHALL present primary tabs for Home, About, and Contact & booking; secondary tabs for Testimonials and FAQ; and a tucked Site chrome area (collapsed by default) for footer, eyebrows, SEO, legal bodies, and rare fallbacks. It SHALL NOT present a Services packages tab or a top-level Globals tab.

#### Scenario: Photographer opens Website
- **WHEN** an authenticated photographer opens `/studio/website`
- **THEN** they see Soft night–shaped primary and secondary navigation plus a tucked Site chrome control, without Services or Globals as top tabs

### Requirement: Open public page from Website tabs
Each primary Website tab SHALL offer a control to open the corresponding public page (Home → `/`, About → `/about`, Contact & booking → `/contact`) in a new browsing context.

#### Scenario: Preview Contact from Studio
- **WHEN** the photographer activates Open public page on Contact & booking
- **THEN** `/contact` opens for verification

### Requirement: Hub coaching copy
The Website hub SHALL use Soft night coaching language (curate Home, About, and Contact; chrome under Site settings) rather than generic “globals / services” framing.

#### Scenario: Hub subtitle
- **WHEN** the photographer views the Website hub header
- **THEN** coaching copy reflects Soft night curation, not the removed Services/Globals IA
