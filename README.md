# EmDash Table of Contents

A polished, heading-driven table of contents plugin for [EmDash CMS](https://github.com/emdash-cms/emdash).

It gives editors an explicit Portable Text block for in-article placement and gives theme authors a reusable Astro component for sidebars, rails, or article headers.

## Features

- **Explicit placement** via a `tableOfContents` Portable Text block
- **Theme component** for layout-driven placement
- **Nested heading support** for any mix of `h1`–`h6`
- **Global settings** for title, heading levels, selector, minimum headings, smooth scrolling, and mobile collapse
- **Per-instance overrides** for title, heading levels, selector, collapsed state, and visual variant
- **Zero storage, zero capabilities**
- **Graceful fallback** — when JavaScript is unavailable, content still reads cleanly and the TOC simply stays hidden

## Installation

```bash
npm install @emdash-cms/plugin-table-of-contents
```

Then enable it in your EmDash site:

```ts
// astro.config.mjs
import { defineConfig } from "astro/config";
import { emdash } from "emdash/astro";
import { tableOfContentsPlugin } from "@emdash-cms/plugin-table-of-contents";

export default defineConfig({
	integrations: [
		emdash({
			plugins: [tableOfContentsPlugin()],
		}),
	],
});
```

## Usage

### 1. Portable Text block

Once installed, editors can insert the **Table of Contents** block into Portable Text content. The block exposes optional overrides for:

- title
- heading levels
- target selector
- collapsed by default
- variant

If an override is left blank, the plugin falls back to the global plugin settings.

### 2. Theme component

You can also render the same TOC behavior directly from a theme:

```astro
---
import { TableOfContents } from "@emdash-cms/plugin-table-of-contents/astro";
---

<aside class="article-rail">
	<TableOfContents
		title="On this page"
		levels={["h2", "h3"]}
		targetSelector="article"
		variant="default"
	/>
</aside>
```

### 3. Plugin settings

The plugin auto-generates an admin settings UI from `admin.settingsSchema`. Available settings:

- default heading levels
- minimum headings before showing
- default title
- collapse on mobile
- smooth scroll
- default target selector

## Behavior notes

### Trusted / native plugin

This plugin uses EmDash native plugin surfaces (`componentsEntry` and `admin.portableTextBlocks`), so it is intended for trusted installation through `plugins: []`.

### Read-only runtime config route

Current EmDash plugin APIs do not expose `admin.settingsSchema` values directly to site-side Astro components. To keep global settings authoritative without changing EmDash core, this plugin exposes one small public read-only route:

```text
/_emdash/api/plugins/table-of-contents/public-config
```

That route returns only non-sensitive display settings.

### Marketplace compatibility

Because it relies on native plugin rendering surfaces, this package is **npm-publishable** but not a current EmDash marketplace bundle candidate.

## Design goals

This plugin is intentionally:

- **explicit**, not globally injected
- **DOM-aware**, not a global HTML content filter
- **theme-friendly**, not tied to one layout
- **lightweight**, not scrollspy-heavy in v1

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
```

## License

MIT

