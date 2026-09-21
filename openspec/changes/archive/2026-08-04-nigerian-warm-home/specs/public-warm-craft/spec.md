## Purpose

Warm, light public craft system for Ibrahim Lens — Nigerian-feeling premium surfaces, bold rich footer patterns, and cohesive section rhythm shared across public pages (replacing cool ink atelier as the public default).

## ADDED Requirements

### Requirement: Warm light public ground
Public pages SHALL use a warm, lighter visual ground with deep warm text and a sparse warm accent (soft gold / bronze family). Cool near-black ink and muted-steel-as-primary-accent SHALL NOT remain the public default.

#### Scenario: Visitor opens public home
- **WHEN** a visitor loads `/`
- **THEN** the page reads as warm and light (not cool near-black atelier)

### Requirement: Bold rich public footer
The public footer SHALL present as a bold brand moment: Ibrahim Lens name at strong weight, short supporting line, reachable contact (+234 phone and/or Instagram when configured in globals), primary nav links, and optional lane hints (Events · Portraits · Fashion). Legal links remain secondary within that footer.

#### Scenario: Footer contact visible
- **WHEN** globals include a public phone and/or Instagram
- **THEN** the footer shows those as reachable links alongside brand and nav

#### Scenario: Footer without social configured
- **WHEN** Instagram is not configured
- **THEN** the footer still feels bold and rich with brand, nav, and legal links

### Requirement: Cohesive section rhythm
Shared public section spacing, type hierarchy, and non-card editorial patterns SHALL keep Home and sibling public pages feeling like one site family.

#### Scenario: Navigate Home to Portfolio
- **WHEN** a visitor moves from `/` to `/portfolio`
- **THEN** ground, type, and gallery craft remain recognizably the same warm premium system

### Requirement: Intentional motion retained
Public surfaces SHALL keep at least two intentional presence motions (e.g. hero settle, section reveal) with reduced-motion respect.

#### Scenario: Reduced motion
- **WHEN** the visitor prefers reduced motion
- **THEN** decorative motion does not run in a way that conflicts with accessibility settings
