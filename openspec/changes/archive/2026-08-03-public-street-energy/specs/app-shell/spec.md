## ADDED Requirements

### Requirement: Footer WhatsApp as secondary direct contact
When a public phone number is configured, the public footer SHALL include a WhatsApp link so visitors can contact the photographer directly without using the Home hero.

#### Scenario: Footer WhatsApp present
- **WHEN** contact phone is configured and a visitor views the public footer
- **THEN** a WhatsApp link is available alongside other contact/social links

### Requirement: No WhatsApp in Home hero chrome
Public site chrome SHALL NOT place WhatsApp in the Home hero CTA row. WhatsApp belongs in footer and on Contact (under booking).

#### Scenario: Hero without WhatsApp chrome
- **WHEN** a visitor views the Home hero
- **THEN** WhatsApp is not offered as a hero CTA (footer/Contact remain available)
