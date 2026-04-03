import { describe, expect, it, vi } from "vitest";

import tableOfContentsPlugin from "../src/index.js";
import createPlugin from "../src/plugin.js";
import {
	PUBLIC_CONFIG_ROUTE,
	TABLE_OF_CONTENTS_PACKAGE_NAME,
	TABLE_OF_CONTENTS_PLUGIN_ID,
	TABLE_OF_CONTENTS_VERSION,
} from "../src/types.js";

describe("tableOfContentsPlugin", () => {
	it("returns the expected native descriptor", () => {
		expect(tableOfContentsPlugin()).toEqual({
			id: TABLE_OF_CONTENTS_PLUGIN_ID,
			version: TABLE_OF_CONTENTS_VERSION,
			format: "native",
			entrypoint: `${TABLE_OF_CONTENTS_PACKAGE_NAME}/plugin`,
			componentsEntry: `${TABLE_OF_CONTENTS_PACKAGE_NAME}/astro`,
			options: {},
		});
	});
});

describe("createPlugin", () => {
	it("exposes the expected settings, block config, and public route", async () => {
		const plugin = createPlugin();
		const publicConfigRoute = plugin.routes[PUBLIC_CONFIG_ROUTE];
		const kvGet = vi.fn(async (key: string) => {
			switch (key) {
				case "settings:defaultHeadingLevels":
					return "h2,h4";
				case "settings:minHeadings":
					return 5;
				case "settings:defaultTitle":
					return "Guide outline";
				case "settings:collapseOnMobile":
					return false;
				case "settings:smoothScroll":
					return true;
				case "settings:defaultTargetSelector":
					return ".article";
				default:
					return null;
			}
		});

		expect(plugin.capabilities).toEqual([]);
		expect(publicConfigRoute?.public).toBe(true);
		expect(plugin.admin.settingsSchema).toMatchObject({
			defaultHeadingLevels: { type: "string" },
			minHeadings: { type: "number" },
			defaultTitle: { type: "string" },
			collapseOnMobile: { type: "boolean" },
			smoothScroll: { type: "boolean" },
			defaultTargetSelector: { type: "string" },
		});

		expect(plugin.admin.portableTextBlocks?.[0]).toMatchObject({
			type: "tableOfContents",
			label: "Table of Contents",
			icon: "list",
		});
		expect(plugin.admin.portableTextBlocks?.[0]?.fields?.map((field) => field.action_id)).toEqual([
			"title",
			"levels",
			"targetSelector",
			"collapsed",
			"variant",
		]);
		expect(plugin.admin.portableTextBlocks?.[0]?.fields?.[3]).toMatchObject({
			type: "select",
			action_id: "collapsed",
			initial_value: "inherit",
		});

		await expect(
			publicConfigRoute?.handler({
				input: undefined,
				request: new Request("https://example.com"),
				requestMeta: {
					ip: null,
					userAgent: null,
					referer: null,
					geo: null,
				},
				plugin: { id: TABLE_OF_CONTENTS_PLUGIN_ID, version: TABLE_OF_CONTENTS_VERSION },
				kv: { get: kvGet },
				storage: {},
				log: {
					debug: vi.fn(),
					info: vi.fn(),
					warn: vi.fn(),
					error: vi.fn(),
				},
				site: {
					name: "Example",
					url: "https://example.com",
					locale: "en",
				},
			} as never),
		).resolves.toEqual({
			defaultHeadingLevels: ["h2", "h4"],
			minHeadings: 5,
			defaultTitle: "Guide outline",
			collapseOnMobile: false,
			smoothScroll: true,
			defaultTargetSelector: ".article",
		});
	});
});

