import { definePlugin } from "emdash";
import type { ResolvedPlugin } from "emdash";

import { DEFAULT_PUBLIC_CONFIG, normalizePublicConfig } from "./config.js";
import {
	HEADING_TAGS,
	PUBLIC_CONFIG_ROUTE,
	TABLE_OF_CONTENTS_PLUGIN_ID,
	TABLE_OF_CONTENTS_VERSION,
	type PublicTocRuntimeConfig,
} from "./types.js";

async function loadPublicRuntimeConfig(ctx: {
	kv: { get<T>(key: string): Promise<T | null> };
}): Promise<PublicTocRuntimeConfig> {
	const [
		defaultHeadingLevels,
		minHeadings,
		defaultTitle,
		collapseOnMobile,
		smoothScroll,
		defaultTargetSelector,
	] = await Promise.all([
		ctx.kv.get<string>("settings:defaultHeadingLevels"),
		ctx.kv.get<number>("settings:minHeadings"),
		ctx.kv.get<string>("settings:defaultTitle"),
		ctx.kv.get<boolean>("settings:collapseOnMobile"),
		ctx.kv.get<boolean>("settings:smoothScroll"),
		ctx.kv.get<string>("settings:defaultTargetSelector"),
	]);

	return normalizePublicConfig({
		defaultHeadingLevels,
		minHeadings,
		defaultTitle,
		collapseOnMobile,
		smoothScroll,
		defaultTargetSelector,
	});
}

export function createPlugin(): ResolvedPlugin {
	return definePlugin({
		id: TABLE_OF_CONTENTS_PLUGIN_ID,
		version: TABLE_OF_CONTENTS_VERSION,
		capabilities: [],
		routes: {
			[PUBLIC_CONFIG_ROUTE]: {
				public: true,
				handler: async (ctx) => loadPublicRuntimeConfig(ctx),
			},
		},
		admin: {
			settingsSchema: {
				defaultHeadingLevels: {
					type: "string",
					label: "Default heading levels",
					description: "Comma-separated heading levels such as h2,h3 or 2,3.",
					default: DEFAULT_PUBLIC_CONFIG.defaultHeadingLevels.join(","),
				},
				minHeadings: {
					type: "number",
					label: "Minimum headings",
					description: "Hide the TOC until at least this many matching headings exist.",
					default: DEFAULT_PUBLIC_CONFIG.minHeadings,
					min: 1,
					max: 20,
				},
				defaultTitle: {
					type: "string",
					label: "Default title",
					description: "Displayed above the generated table of contents.",
					default: DEFAULT_PUBLIC_CONFIG.defaultTitle,
				},
				collapseOnMobile: {
					type: "boolean",
					label: "Collapse on mobile",
					description: "Start collapsed below 768px unless a block or theme instance overrides it.",
					default: DEFAULT_PUBLIC_CONFIG.collapseOnMobile,
				},
				smoothScroll: {
					type: "boolean",
					label: "Smooth scroll",
					description: "Animate TOC link jumps unless the visitor prefers reduced motion.",
					default: DEFAULT_PUBLIC_CONFIG.smoothScroll,
				},
				defaultTargetSelector: {
					type: "string",
					label: "Default target selector",
					description: "CSS selector used to find the heading container.",
					default: DEFAULT_PUBLIC_CONFIG.defaultTargetSelector,
				},
			},
			portableTextBlocks: [
				{
					type: "tableOfContents",
					label: "Table of Contents",
					icon: "list",
					description: "Generate a nested table of contents from headings on the page.",
					fields: [
						{
							type: "text_input",
							action_id: "title",
							label: "Title override",
							placeholder: "Leave blank to use the global title",
						},
						{
							type: "checkbox",
							action_id: "levels",
							label: "Heading levels override",
							options: HEADING_TAGS.map((tag) => ({
								label: tag.toUpperCase(),
								value: tag,
							})),
						},
						{
							type: "text_input",
							action_id: "targetSelector",
							label: "Target selector override",
							placeholder: "Leave blank to use the global selector",
						},
						{
							type: "select",
							action_id: "collapsed",
							label: "Initial state",
							options: [
								{ label: "Use global behavior", value: "inherit" },
								{ label: "Start collapsed", value: "collapsed" },
								{ label: "Start expanded", value: "expanded" },
							],
							initial_value: "inherit",
						},
						{
							type: "select",
							action_id: "variant",
							label: "Variant",
							options: [
								{ label: "Default", value: "default" },
								{ label: "Plain", value: "plain" },
							],
							initial_value: "default",
						},
					],
				},
			],
		},
	});
}

export { loadPublicRuntimeConfig };
export default createPlugin;

