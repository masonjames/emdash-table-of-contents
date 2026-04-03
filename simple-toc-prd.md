---
title: "PRD: EmDash Table of Contents"
status: draft
priority: P1
inspired_by: "SimpleTOC"
plugin_id: "table-of-contents"
package_name: "@emdash-cms/plugin-table-of-contents"
execution_mode: "Trusted-first, sandbox-compatible target"
---

# PRD: EmDash Table of Contents

## Product summary

EmDash Table of Contents gives publishers a structured, reusable way to generate a heading-based table of contents for long-form pages. The greenfield version should be designed around **explicit placement** and **DOM-aware rendering**, not a WordPress-style content filter.

The MVP should allow a team to:

- place a TOC block near the top of a Portable Text article,
- optionally render a TOC component from the theme,
- configure heading levels and presentation globally,
- avoid public routes, plugin storage, and page-wide script injection as a default.

## Problem

Long articles are hard to scan. Readers want quick navigation, especially for tutorials, documentation, and evergreen guides. Editors want a TOC that does not require hand-maintained anchor lists.

In EmDash, the cleanest way to do this is not to mutate final article HTML globally. Instead, we need an opt-in component that can discover headings in the rendered page and build a nested TOC with minimal operational complexity.

## Goals

1. Generate a useful TOC from article headings with zero manual anchor maintenance for the common case.
2. Make the feature easy to place in content or templates.
3. Support nested heading levels such as H2 and H3.
4. Keep the MVP low-risk and marketplace-friendly.
5. Avoid hard dependencies on global page injection hooks.

## Non-goals

- Rewriting editor heading behavior
- Arbitrary anchor editing UI in v1
- Full sitewide auto-insertion
- Scrollspy-heavy interactions in the first release
- Managing heading hierarchy beyond what the page already renders

## Primary users

### Editors
They want to drop a TOC into a long article without hand-building links.

### Theme developers
They want to render a TOC component above content or in a side rail.

### Readers
They want to jump between sections quickly on long pages.

## Key user stories

1. As an editor, I can insert a TOC block near the top of a page.
2. As a reader, I can click a TOC entry and jump to the matching section.
3. As an admin, I can choose which heading levels count toward the TOC.
4. As a theme developer, I can render a TOC component in a layout without special routing.
5. As a mobile reader, I can collapse or hide the TOC when it would dominate the screen.

## MVP scope

### In scope

- a `tableOfContents` Portable Text block
- a theme-imported TOC component
- client-light heading discovery within a configurable article container
- nested list rendering for selected heading levels
- global settings for:
  - heading levels,
  - minimum heading count before showing,
  - list title,
  - collapse on mobile,
  - smooth-scroll behavior

### Out of scope

- editor-side anchor management UI
- heading exclusion rules on individual headings in v1
- server-side persistence of heading maps
- scrollspy and active-section tracking
- sitewide automatic injection

## Functional requirements

### Editor experience

The block must support:

- TOC title override
- heading levels override
- target selector override
- collapsed by default yes/no

### Frontend behavior

- The TOC must discover headings from a target content container.
- The TOC must hide itself if the page has fewer headings than the minimum threshold.
- Links must point to stable heading IDs generated from rendered heading text or existing anchors.
- Nested levels must preserve heading structure where possible.

### Responsive behavior

- On narrow viewports, the TOC can render collapsed when configured.
- The experience must remain usable without JavaScript, even if enhancement is reduced.

## UX and integration model

The recommended pattern is:

- editors place the TOC block near the top of content, or
- theme authors import a TOC component and place it beside the article.

The implementation should rely on a small, local enhancement script inside the component rather than `page:fragments`. That keeps the feature explicit and avoids widening trust boundaries.

## Technical approach for EmDash

### Plugin surfaces

- `admin.settingsSchema`
- `admin.portableTextBlocks`
- `componentsEntry`

### Capabilities

None required for MVP.

### Storage

No storage required in v1.

### Routes

No routes required in v1.

### Settings

- `settings:defaultHeadingLevels`
- `settings:minHeadings`
- `settings:defaultTitle`
- `settings:collapseOnMobile`
- `settings:smoothScroll`
- `settings:defaultTargetSelector`

### Block/component contract

Suggested block props:

- `title`
- `levels`
- `targetSelector`
- `collapsed`
- `variant`

## Success metrics

- TOC renders correctly on long-form articles with headings.
- Editors can add TOC behavior without manual link upkeep.
- Sites do not need plugin routes or storage for the core feature.
- The component works in at least one theme layout and one in-content placement.

## Risks and mitigations

### Risk: heading IDs differ across themes
Mitigation: document a shared slugging helper and prefer existing heading IDs when present.

### Risk: pages contain multiple heading regions
Mitigation: allow a configurable target selector and sane default such as `article`.

### Risk: no TOC exclusion controls in v1
Mitigation: make this a v1.1 enhancement rather than complicating the launch.

## Milestones

1. Define block schema and settings.
2. Build heading discovery and nested rendering logic.
3. Add responsive collapse behavior.
4. Validate anchor behavior across sample themes.
5. Ship docs for content and theme integration paths.

## Acceptance criteria

- The TOC can be inserted as a Portable Text block.
- A theme can import the same TOC behavior as a component.
- The component hides when the heading threshold is not met.
- The plugin launches without routes, storage, or capabilities.

## Open questions

1. Should v1.1 support excluding individual headings through a decorator or class-based convention?
2. Should we add scrollspy in a later phase, or keep the product intentionally simpler?
3. Do we want a sticky side-rail layout recipe in the package docs?
