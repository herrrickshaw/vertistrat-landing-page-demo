# Vertistrat Solutions home redesign

## What will change
- Replace only the home-page content with a precise, spacious navy/slate/amber design and a 12-column desktop grid.
- Load Plus Jakarta Sans and Inter for the home experience; leave other pages’ typography and styling intact.
- Preserve the existing logo, navigation links, footer, Insights feeds and Google Forms delivery. Give the shared header a home-only navy treatment that becomes solid on scroll.

## Page sections
1. **Hero:** requested headline and outcome-led copy, two working scroll buttons, prominent Vertistrat Solutions name, and a custom milestone/Gantt visual without stock photography.
2. **Trust strip:** four neutral sector wordmarks, visibly presented as sector coverage rather than actual client endorsements, with placeholder comments.
3. **How We Work:** three keyboard-accessible desktop tabs, mobile accordions, connected progress indicators, descriptions, deliverables and indicative durations.
4. **Impact:** the four requested counters, animated once on entering view, with “Illustrative figures for demo purposes” visible beside them.
5. **Case studies:** three explicitly illustrative anonymised cases with before/after outcomes. “Read the full case” opens an accessible detail dialog, not an invented article URL.
6. **Lead capture:** the requested heading and reassurance, with your existing Google Form embedded and its working new-tab link, styled within the navy section.

## Important assumptions
- Your existing project rule requires enquiries to stay in the Google Form, with no separate app form. I will retain that real enquiry flow rather than display custom fields or a success toast that does not deliver an enquiry. Changing the Google Form’s fields to the requested intake questions requires access to the form itself.
- No booking destination has been provided. Add a configurable booking URL placeholder; until it is supplied, the diagnostic-call link opens your existing Google Form rather than an invented Calendly account.
- Case outcomes and durations are demo examples, not verified performance promises. No real client logos or names will be invented.

## Technical details
- Small home-only modules in `src/components/landing/`, with semantic OKLCH design tokens in `src/styles.css` and content/settings in `src/config.ts`.
- Reuse existing Button, tabs, accordion and dialog components where appropriate. Preserve `ContactForm` and the shared shell.
- Smooth anchors for `#framework`, `#impact`, `#case-studies` and `#contact`; reduced-motion support, AA contrast, visible focus states and stable mobile layouts.
- Update the home page’s unique title and social description. Check other pages’ existing metadata without changing their content.

## Verification
- Run existing relevant tests and small tests for the concrete demo values and booking fallback.
- Check desktop and mobile layouts, tab/accordion interaction, case dialogs, scroll buttons, the solid-on-scroll header, and the Google Form destination in the browser.