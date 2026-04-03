import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_PUBLIC_CONFIG, resolveTocConfig } from "../src/config.js";
import {
	buildHeadingTree,
	collectFlatHeadings,
	meetsHeadingThreshold,
	resolveTargetContainer,
} from "../src/lib/headings.js";

describe("heading discovery", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("prefers the nearest matching ancestor container", () => {
		document.body.innerHTML = `
			<main>
				<article class="content">
					<div id="toc"></div>
					<h2>Overview</h2>
				</article>
			</main>
		`;

		const root = document.getElementById("toc") as HTMLElement;
		const target = resolveTargetContainer(root, ".content");

		expect(target).toBe(root.closest(".content"));
	});

	it("falls back to a document query when the toc sits outside the target container", () => {
		document.body.innerHTML = `
			<aside><div id="toc"></div></aside>
			<article class="content"><h2>Overview</h2></article>
		`;

		const root = document.getElementById("toc") as HTMLElement;
		const target = resolveTargetContainer(root, ".content");

		expect(target).toBe(document.querySelector(".content"));
	});

	it("returns null for invalid selectors", () => {
		document.body.innerHTML = `<div id="toc"></div>`;
		const root = document.getElementById("toc") as HTMLElement;

		expect(resolveTargetContainer(root, "article[")).toBeNull();
	});

	it("collects headings, preserves unique ids, and excludes headings inside the toc root", () => {
		document.body.innerHTML = `
			<article class="content">
				<h2 id="overview">Overview</h2>
				<div id="toc"><h2>Ignore me</h2></div>
				<h3 id="overview">More overview</h3>
				<h3>Overview</h3>
			</article>
		`;

		const root = document.getElementById("toc") as HTMLElement;
		const container = document.querySelector(".content") as HTMLElement;
		const headings = collectFlatHeadings(
			root,
			container,
			resolveTocConfig(DEFAULT_PUBLIC_CONFIG, {}),
		);

		expect(headings.map((heading) => heading.text)).toEqual([
			"Overview",
			"More overview",
			"Overview",
		]);
		expect(headings.map((heading) => heading.id)).toEqual([
			"overview",
			"more-overview",
			"overview-2",
		]);
	});

	it("builds a nested tree without inventing missing heading levels", () => {
		document.body.innerHTML = `
			<article class="content">
				<div id="toc"></div>
				<h2>Top level</h2>
				<h4>Deep child</h4>
				<h3>Middle child</h3>
				<h4>Nested again</h4>
			</article>
		`;

		const root = document.getElementById("toc") as HTMLElement;
		const container = document.querySelector(".content") as HTMLElement;
		const headings = collectFlatHeadings(
			root,
			container,
			resolveTocConfig(DEFAULT_PUBLIC_CONFIG, { levels: ["h2", "h3", "h4"] }),
		);
		const tree = buildHeadingTree(headings);

		expect(tree).toHaveLength(1);
		expect(tree[0]?.children.map((child) => child.text)).toEqual([
			"Deep child",
			"Middle child",
		]);
		expect(tree[0]?.children[1]?.children.map((child) => child.text)).toEqual([
			"Nested again",
		]);
	});

	it("applies the heading-count threshold after filtering", () => {
		document.body.innerHTML = `
			<article class="content">
				<div id="toc"></div>
				<h2>One</h2>
				<h3>Two</h3>
			</article>
		`;

		const root = document.getElementById("toc") as HTMLElement;
		const container = document.querySelector(".content") as HTMLElement;
		const headings = collectFlatHeadings(
			root,
			container,
			resolveTocConfig(DEFAULT_PUBLIC_CONFIG, {}),
		);

		expect(meetsHeadingThreshold(headings, 3)).toBe(false);
		expect(meetsHeadingThreshold(headings, 2)).toBe(true);
	});
});

