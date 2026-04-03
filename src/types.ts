export const TABLE_OF_CONTENTS_PLUGIN_ID = "table-of-contents";
export const TABLE_OF_CONTENTS_PACKAGE_NAME = "@masonjames/emdash-table-of-contents";
export const TABLE_OF_CONTENTS_VERSION = "0.1.2";
export const PUBLIC_CONFIG_ROUTE = "public-config";
export const PUBLIC_CONFIG_PATH = `/_emdash/api/plugins/${TABLE_OF_CONTENTS_PLUGIN_ID}/${PUBLIC_CONFIG_ROUTE}`;

export const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export const TOC_VARIANTS = ["default", "plain"] as const;

export type HeadingTag = (typeof HEADING_TAGS)[number];
export type TocVariant = (typeof TOC_VARIANTS)[number];

export interface TocBlockValue {
	_type: "tableOfContents";
	_key?: string;
	title?: string;
	levels?: string[];
	targetSelector?: string;
	collapsed?: boolean | "inherit" | "collapsed" | "expanded" | string;
	variant?: TocVariant | string;
}

export interface TocInstanceOverrides {
	title?: string;
	levels?: HeadingTag[] | string[] | string;
	targetSelector?: string;
	collapsed?: boolean;
	variant?: TocVariant | string;
	minHeadings?: number;
	collapseOnMobile?: boolean;
	smoothScroll?: boolean;
}

export interface PublicTocRuntimeConfig {
	defaultHeadingLevels: HeadingTag[];
	minHeadings: number;
	defaultTitle: string;
	collapseOnMobile: boolean;
	smoothScroll: boolean;
	defaultTargetSelector: string;
}

export interface TocResolvedConfig {
	title: string;
	levels: HeadingTag[];
	minHeadings: number;
	targetSelector: string;
	collapsed?: boolean;
	collapseOnMobile: boolean;
	smoothScroll: boolean;
	variant: TocVariant;
}

export interface TocHeadingItem {
	id: string;
	text: string;
	level: number;
	children: TocHeadingItem[];
}

export interface FlatHeading {
	element: HTMLHeadingElement;
	id: string;
	text: string;
	level: number;
}

