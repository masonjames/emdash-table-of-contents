const DIACRITICS_PATTERN = /[\u0300-\u036f]/g;
const WHITESPACE_UNDERSCORE_PATTERN = /[\s_]+/g;
const NON_ALPHANUMERIC_HYPHEN_PATTERN = /[^a-z0-9-]/g;
const MULTIPLE_HYPHENS_PATTERN = /-+/g;
const LEADING_TRAILING_HYPHEN_PATTERN = /^-|-$/g;
const TRAILING_HYPHEN_PATTERN = /-$/;

export function slugify(text: string, maxLength: number = 80): string {
	const slug = text
		.toLowerCase()
		.normalize("NFD")
		.replace(DIACRITICS_PATTERN, "")
		.replace(WHITESPACE_UNDERSCORE_PATTERN, "-")
		.replace(NON_ALPHANUMERIC_HYPHEN_PATTERN, "")
		.replace(MULTIPLE_HYPHENS_PATTERN, "-")
		.replace(LEADING_TRAILING_HYPHEN_PATTERN, "")
		.slice(0, maxLength)
		.replace(TRAILING_HYPHEN_PATTERN, "");

	return slug || "section";
}

export function uniqueSlug(base: string, used: Set<string>): string {
	const normalizedBase = slugify(base);

	if (!used.has(normalizedBase)) {
		used.add(normalizedBase);
		return normalizedBase;
	}

	let suffix = 2;
	while (used.has(`${normalizedBase}-${suffix}`)) {
		suffix += 1;
	}

	const candidate = `${normalizedBase}-${suffix}`;
	used.add(candidate);
	return candidate;
}

