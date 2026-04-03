import {
	DEFAULT_PUBLIC_CONFIG,
	normalizePublicConfig,
	resolveTocConfig,
} from "./config.js";
import {
	PUBLIC_CONFIG_PATH,
	type PublicTocRuntimeConfig,
	type TocHeadingItem,
	type TocInstanceOverrides,
	type TocResolvedConfig,
} from "./types.js";
import {
	buildHeadingTree,
	collectFlatHeadings,
	meetsHeadingThreshold,
	resolveTargetContainer,
} from "./lib/headings.js";

declare global {
	interface Window {
		__emdashTableOfContentsBooted?: boolean;
		__emdashTableOfContentsConfigPromise?: Promise<PublicTocRuntimeConfig>;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readInstanceOverrides(root: HTMLElement): TocInstanceOverrides {
	const raw = root.dataset.emdashTocConfig;
	if (!raw) return {};

	try {
		const parsed = JSON.parse(raw) as unknown;
		return isRecord(parsed) ? (parsed as TocInstanceOverrides) : {};
	} catch {
		return {};
	}
}

async function getPublicConfig(): Promise<PublicTocRuntimeConfig> {
	if (!window.__emdashTableOfContentsConfigPromise) {
		window.__emdashTableOfContentsConfigPromise = fetch(PUBLIC_CONFIG_PATH, {
			headers: { accept: "application/json" },
		})
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`Failed to load TOC config (${response.status})`);
				}

				const body = (await response.json()) as unknown;
				return isRecord(body) ? normalizePublicConfig(body.data) : DEFAULT_PUBLIC_CONFIG;
			})
			.catch(() => DEFAULT_PUBLIC_CONFIG);
	}

	return window.__emdashTableOfContentsConfigPromise;
}

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildList(items: TocHeadingItem[], config: TocResolvedConfig): HTMLOListElement {
	const list = document.createElement("ol");
	list.className = "emdash-toc__list";

	for (const item of items) {
		const listItem = document.createElement("li");
		listItem.className = "emdash-toc__item";
		listItem.dataset.level = String(item.level);

		const link = document.createElement("a");
		link.className = "emdash-toc__link";
		link.href = `#${item.id}`;
		link.textContent = item.text;

		if (config.smoothScroll) {
			link.addEventListener("click", (event) => {
				const target = document.getElementById(item.id);
				if (!target || prefersReducedMotion()) return;

				event.preventDefault();
				target.scrollIntoView({ behavior: "smooth", block: "start" });
				window.history.pushState(null, "", `#${item.id}`);
			});
		}

		listItem.append(link);

		if (item.children.length > 0) {
			const childList = buildList(item.children, config);
			childList.classList.add("emdash-toc__sublist");
			listItem.append(childList);
		}

		list.append(listItem);
	}

	return list;
}

function resolveInitialOpenState(config: TocResolvedConfig): boolean {
	if (typeof config.collapsed === "boolean") {
		return !config.collapsed;
	}

	if (config.collapseOnMobile && window.matchMedia("(max-width: 768px)").matches) {
		return false;
	}

	return true;
}

async function enhanceRoot(root: HTMLElement): Promise<void> {
	const details = root.querySelector<HTMLDetailsElement>("[data-emdash-toc-details]");
	const summary = root.querySelector<HTMLElement>("[data-emdash-toc-summary]");
	const body = root.querySelector<HTMLElement>("[data-emdash-toc-body]");

	if (!details || !summary || !body) return;

	const overrides = readInstanceOverrides(root);
	const globalConfig = await getPublicConfig();

	if (!root.isConnected) return;

	const config = resolveTocConfig(globalConfig, overrides);
	const targetContainer = resolveTargetContainer(root, config.targetSelector);

	if (!targetContainer) return;

	const headings = collectFlatHeadings(root, targetContainer, config);
	if (!meetsHeadingThreshold(headings, config.minHeadings)) return;

	const tree = buildHeadingTree(headings);
	if (tree.length === 0) return;

	root.dataset.variant = config.variant;
	summary.textContent = config.title;
	body.replaceChildren(buildList(tree, config));
	details.open = resolveInitialOpenState(config);
	root.hidden = false;
}

async function initRoots(): Promise<void> {
	const roots = Array.from(
		document.querySelectorAll<HTMLElement>("[data-emdash-toc-root]"),
	).filter((root) => root.dataset.emdashTocBound !== "true");

	for (const root of roots) {
		root.dataset.emdashTocBound = "true";
		await enhanceRoot(root);
	}
}

export function bootTableOfContents(): void {
	if (typeof window === "undefined" || typeof document === "undefined") return;

	const run = () => {
		void initRoots();
	};

	if (!window.__emdashTableOfContentsBooted) {
		window.__emdashTableOfContentsBooted = true;
		document.addEventListener("astro:page-load", run);
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", run, { once: true });
		}
	}

	if (document.readyState === "loading") return;
	run();
}

