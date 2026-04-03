import type { PluginDescriptor } from "emdash";

export { createPlugin } from "./plugin.js";

import {
	TABLE_OF_CONTENTS_PACKAGE_NAME,
	TABLE_OF_CONTENTS_PLUGIN_ID,
	TABLE_OF_CONTENTS_VERSION,
} from "./types.js";

export function tableOfContentsPlugin(): PluginDescriptor {
	return {
		id: TABLE_OF_CONTENTS_PLUGIN_ID,
		version: TABLE_OF_CONTENTS_VERSION,
		format: "native",
		entrypoint: `${TABLE_OF_CONTENTS_PACKAGE_NAME}/plugin`,
		componentsEntry: `${TABLE_OF_CONTENTS_PACKAGE_NAME}/astro`,
		options: {},
	};
}

export default tableOfContentsPlugin;

