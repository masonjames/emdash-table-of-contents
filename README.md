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

Install the package from npm:

```bash
npm install @masonjames/emdash-table-of-contents
```

Then register it as a trusted EmDash plugin in `astro.config.mjs`:

```ts
import { defineConfig } from "astro/config";
import { emdash } from "emdash/astro";
import { tableOfContentsPlugin } from "@masonjames/emdash-table-of-contents";

export default defineConfig({
	integrations: [
		emdash({
			plugins: [tableOfContentsPlugin()],
		}),
	],
});
```

This is the official installation path for this package today.

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
import { TableOfContents } from "@masonjames/emdash-table-of-contents/astro";
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

### Marketplace and `emdash plugin publish`

`emdash plugin publish` targets sandboxed marketplace bundles. EmDash currently rejects plugins that declare `admin.portableTextBlocks` for marketplace bundling, and sandboxed plugins cannot ship `componentsEntry` Astro components for site rendering.

That means this plugin is currently **officially distributed as a trusted npm package**, not as an EmDash Marketplace package.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
```

## Releasing

This repo is configured with an OIDC-ready GitHub Actions publish workflow.

### Bootstrap the package once

For the very first publish, create the package on npm manually, then attach the GitHub workflow as the trusted publisher:

```bash
npm publish --access public --provenance=false
npm trust github @masonjames/emdash-table-of-contents --repo masonjames/emdash-table-of-contents --file publish.yml --yes
```

If your current npm credential cannot manage trust relationships, keep `NPM_TOKEN` configured in GitHub until you attach the trusted publisher from a full npm account session.

### Ongoing releases

1. bump `package.json` and `src/types.ts` to the new version
2. run `pnpm check`
3. merge the release commit to `main`
4. create and push a matching stable tag such as `v0.1.1`
5. GitHub Actions creates the GitHub Release and publishes to npm via OIDC trusted publishing

## License

MIT
