import { describe, expect, it } from "vitest";

import {
	DEFAULT_PUBLIC_CONFIG,
	blockValueToOverrides,
	normalizePublicConfig,
	parseHeadingLevels,
	resolveTocConfig,
} from "../src/config.js";

describe("parseHeadingLevels", () => {
	it("accepts comma-separated heading tags and digits", () => {
		expect(parseHeadingLevels("h2, 3, H4, h2")).toEqual(["h2", "h3", "h4"]);
	});

	it("falls back to defaults when the input is empty or invalid", () => {
		expect(parseHeadingLevels("beep, boop")).toEqual(DEFAULT_PUBLIC_CONFIG.defaultHeadingLevels);
		expect(parseHeadingLevels(undefined)).toEqual(DEFAULT_PUBLIC_CONFIG.defaultHeadingLevels);
	});
});

describe("normalizePublicConfig", () => {
	it("normalizes malformed values back to safe defaults", () => {
		expect(
			normalizePublicConfig({
				defaultHeadingLevels: "2, 3, nope",
				minHeadings: 999,
				defaultTitle: "  Useful guide  ",
				collapseOnMobile: "yes",
				smoothScroll: false,
				defaultTargetSelector: "  article .content  ",
			}),
		).toEqual({
			defaultHeadingLevels: ["h2", "h3"],
			minHeadings: 20,
			defaultTitle: "Useful guide",
			collapseOnMobile: true,
			smoothScroll: false,
			defaultTargetSelector: "article .content",
		});
	});
});

describe("blockValueToOverrides", () => {
	it("treats blank override values as absent", () => {
		expect(
			blockValueToOverrides({
				_type: "tableOfContents",
				title: "   ",
				targetSelector: "",
				levels: [],
			}),
		).toEqual({
			title: undefined,
			levels: DEFAULT_PUBLIC_CONFIG.defaultHeadingLevels,
			targetSelector: undefined,
			collapsed: undefined,
			variant: undefined,
		});
	});

	it("supports tri-state collapsed overrides from the block editor", () => {
		expect(
			blockValueToOverrides({
				_type: "tableOfContents",
				collapsed: "inherit",
			}),
		).toEqual({
			title: undefined,
			levels: undefined,
			targetSelector: undefined,
			collapsed: undefined,
			variant: undefined,
		});

		expect(
			blockValueToOverrides({
				_type: "tableOfContents",
				collapsed: "collapsed",
			}),
		).toMatchObject({ collapsed: true });

		expect(
			blockValueToOverrides({
				_type: "tableOfContents",
				collapsed: "expanded",
			}),
		).toMatchObject({ collapsed: false });
	});
});

describe("resolveTocConfig", () => {
	it("merges global config with explicit instance overrides", () => {
		expect(
			resolveTocConfig(
				{
					defaultHeadingLevels: ["h2", "h3"],
					minHeadings: 4,
					defaultTitle: "On this page",
					collapseOnMobile: true,
					smoothScroll: false,
					defaultTargetSelector: "article",
				},
				{
					title: "Guide outline",
					levels: ["h2", "h4"],
					targetSelector: ".docs-article",
					collapsed: true,
					variant: "plain",
					minHeadings: 2,
				},
			),
		).toEqual({
			title: "Guide outline",
			levels: ["h2", "h4"],
			minHeadings: 2,
			targetSelector: ".docs-article",
			collapsed: true,
			collapseOnMobile: true,
			smoothScroll: false,
			variant: "plain",
		});
	});

	it("preserves global defaults when overrides are absent or blank", () => {
		expect(
			resolveTocConfig(DEFAULT_PUBLIC_CONFIG, {
				title: " ",
				targetSelector: " ",
				levels: "",
			}),
		).toEqual({
			title: "On this page",
			levels: ["h2", "h3"],
			minHeadings: 3,
			targetSelector: "article",
			collapsed: undefined,
			collapseOnMobile: true,
			smoothScroll: true,
			variant: "default",
		});
	});
});

