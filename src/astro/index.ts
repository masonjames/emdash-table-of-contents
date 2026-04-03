import TableOfContents from "./TableOfContents.astro";
import TableOfContentsBlock from "./TableOfContentsBlock.astro";

export { TableOfContents, TableOfContentsBlock };

export const blockComponents = {
	tableOfContents: TableOfContentsBlock,
} as const;

