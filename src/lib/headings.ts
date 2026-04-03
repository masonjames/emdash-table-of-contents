import type { FlatHeading, TocHeadingItem, TocResolvedConfig } from "../types.js";
import { uniqueSlug } from "./slugify.js";

function headingLevel(tagName: string): number {
	return Number.parseInt(tagName.toLowerCase().slice(1), 10);
}

function headingText(element: HTMLHeadingElement): string {
	const text = element.textContent?.trim();
	return text && text.length > 0 ? text : "Section";
}

export function resolveTargetContainer(root: HTMLElement, selector: string): Element | null {
	const normalizedSelector = selector.trim();
	if (normalizedSelector.length === 0) return null;

	try {
		return root.closest(normalizedSelector) ?? document.querySelector(normalizedSelector);
	} catch {
		return null;
	}
}

export function collectFlatHeadings(
	root: HTMLElement,
	container: Element,
	config: TocResolvedConfig,
): FlatHeading[] {
	const selector = config.levels.join(",");
	const candidates = Array.from(container.querySelectorAll<HTMLHeadingElement>(selector));
	const usedIds = new Set<string>();
	const headings: FlatHeading[] = [];

	for (const element of candidates) {
		if (root.contains(element)) continue;

		const text = headingText(element);
		const existingId = element.id.trim();

		let finalId = existingId;
		if (!finalId || usedIds.has(finalId)) {
			finalId = uniqueSlug(text, usedIds);
			element.id = finalId;
		} else {
			usedIds.add(finalId);
		}

		headings.push({
			element,
			id: finalId,
			text,
			level: headingLevel(element.tagName),
		});
	}

	return headings;
}

export function meetsHeadingThreshold(headings: FlatHeading[], minHeadings: number): boolean {
	return headings.length >= minHeadings;
}

export function buildHeadingTree(items: FlatHeading[]): TocHeadingItem[] {
	const roots: TocHeadingItem[] = [];
	const stack: TocHeadingItem[] = [];

	for (const item of items) {
		const node: TocHeadingItem = {
			id: item.id,
			text: item.text,
			level: item.level,
			children: [],
		};

		while (stack.length > 0 && node.level <= stack[stack.length - 1]!.level) {
			stack.pop();
		}

		if (stack.length === 0) {
			roots.push(node);
		} else {
			stack[stack.length - 1]!.children.push(node);
		}

		stack.push(node);
	}

	return roots;
}

