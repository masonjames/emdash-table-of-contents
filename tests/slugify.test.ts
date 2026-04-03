import { describe, expect, it } from "vitest";

import { slugify, uniqueSlug } from "../src/lib/slugify.js";

describe("slugify", () => {
	it("removes diacritics and normalizes whitespace", () => {
		expect(slugify("Café naïve déjà vu")).toBe("cafe-naive-deja-vu");
		expect(slugify("Hello__world   again")).toBe("hello-world-again");
	});

	it("strips punctuation and falls back to section", () => {
		expect(slugify("Docs! & Guides?")).toBe("docs-guides");
		expect(slugify("___")).toBe("section");
	});

	it("truncates safely without leaving a trailing hyphen", () => {
		expect(slugify("A ".repeat(60), 20)).toBe("a-a-a-a-a-a-a-a-a-a");
	});
});

describe("uniqueSlug", () => {
	it("adds stable numeric suffixes for collisions", () => {
		const used = new Set<string>();

		expect(uniqueSlug("Overview", used)).toBe("overview");
		expect(uniqueSlug("Overview", used)).toBe("overview-2");
		expect(uniqueSlug("Overview", used)).toBe("overview-3");
	});
});
