import {
	HEADING_TAGS,
	TOC_VARIANTS,
	type HeadingTag,
	type PublicTocRuntimeConfig,
	type TocBlockValue,
	type TocInstanceOverrides,
	type TocResolvedConfig,
	type TocVariant,
} from "./types.js";

export const DEFAULT_PUBLIC_CONFIG: PublicTocRuntimeConfig = {
	defaultHeadingLevels: ["h2", "h3"],
	minHeadings: 3,
	defaultTitle: "On this page",
	collapseOnMobile: true,
	smoothScroll: true,
	defaultTargetSelector: "article",
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeBoolean(value: unknown): boolean | undefined {
	return typeof value === "boolean" ? value : undefined;
}

function normalizeCollapsedOverride(value: unknown): boolean | undefined {
	if (typeof value === "boolean") return value;
	if (value === "collapsed") return true;
	if (value === "expanded") return false;
	return undefined;
}

function normalizeVariant(value: unknown): TocVariant | undefined {
	return typeof value === "string" && TOC_VARIANTS.includes(value as TocVariant)
		? (value as TocVariant)
		: undefined;
}

function normalizeHeadingTag(value: unknown): HeadingTag | null {
	if (typeof value !== "string") return null;

	const normalized = value.trim().toLowerCase();
	if (normalized.length === 0) return null;

	const withPrefix = /^\d$/.test(normalized) ? `h${normalized}` : normalized;
	return HEADING_TAGS.includes(withPrefix as HeadingTag) ? (withPrefix as HeadingTag) : null;
}

function clampInteger(value: unknown, fallback: number, min: number, max: number): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	return Math.min(Math.max(Math.round(value), min), max);
}

export function parseHeadingLevels(value: unknown): HeadingTag[] {
	const rawValues = Array.isArray(value)
		? value
		: typeof value === "string"
			? value
					.split(",")
					.map((entry) => entry.trim())
					.filter(Boolean)
			: [];

	const normalized: HeadingTag[] = [];
	const seen = new Set<HeadingTag>();

	for (const entry of rawValues) {
		const headingTag = normalizeHeadingTag(entry);
		if (!headingTag || seen.has(headingTag)) continue;
		seen.add(headingTag);
		normalized.push(headingTag);
	}

	return normalized.length > 0 ? normalized : [...DEFAULT_PUBLIC_CONFIG.defaultHeadingLevels];
}

export function normalizePublicConfig(input: unknown): PublicTocRuntimeConfig {
	const raw = isRecord(input) ? input : {};

	return {
		defaultHeadingLevels: parseHeadingLevels(raw.defaultHeadingLevels),
		minHeadings: clampInteger(raw.minHeadings, DEFAULT_PUBLIC_CONFIG.minHeadings, 1, 20),
		defaultTitle: normalizeString(raw.defaultTitle) ?? DEFAULT_PUBLIC_CONFIG.defaultTitle,
		collapseOnMobile:
			normalizeBoolean(raw.collapseOnMobile) ?? DEFAULT_PUBLIC_CONFIG.collapseOnMobile,
		smoothScroll: normalizeBoolean(raw.smoothScroll) ?? DEFAULT_PUBLIC_CONFIG.smoothScroll,
		defaultTargetSelector:
			normalizeString(raw.defaultTargetSelector) ??
			DEFAULT_PUBLIC_CONFIG.defaultTargetSelector,
	};
}

export function blockValueToOverrides(value: TocBlockValue | Record<string, unknown>): TocInstanceOverrides {
	const raw = isRecord(value) ? value : {};

	return {
		title: normalizeString(raw.title),
		levels: Array.isArray(raw.levels) ? parseHeadingLevels(raw.levels) : undefined,
		targetSelector: normalizeString(raw.targetSelector),
		collapsed: normalizeCollapsedOverride(raw.collapsed),
		variant: normalizeVariant(raw.variant),
	};
}

export function resolveTocConfig(
	globalConfig: PublicTocRuntimeConfig,
	overrides: TocInstanceOverrides,
): TocResolvedConfig {
	const normalizedGlobalConfig = normalizePublicConfig(globalConfig);

	return {
		title: normalizeString(overrides.title) ?? normalizedGlobalConfig.defaultTitle,
		levels:
			overrides.levels === undefined
				? [...normalizedGlobalConfig.defaultHeadingLevels]
				: parseHeadingLevels(overrides.levels),
		minHeadings: clampInteger(
			overrides.minHeadings,
			normalizedGlobalConfig.minHeadings,
			1,
			20,
		),
		targetSelector:
			normalizeString(overrides.targetSelector) ?? normalizedGlobalConfig.defaultTargetSelector,
		collapsed: normalizeBoolean(overrides.collapsed),
		collapseOnMobile:
			normalizeBoolean(overrides.collapseOnMobile) ?? normalizedGlobalConfig.collapseOnMobile,
		smoothScroll:
			normalizeBoolean(overrides.smoothScroll) ?? normalizedGlobalConfig.smoothScroll,
		variant: normalizeVariant(overrides.variant) ?? "default",
	};
}

