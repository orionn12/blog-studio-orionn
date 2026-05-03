export const CATEGORIES = {
	programming: {
		slug: "programming",
		label: "プログラミング",
		icon: "fa6-solid:code",
		hue: 220,
	},
	gadget: {
		slug: "gadget",
		label: "ガジェット",
		icon: "fa6-solid:microchip",
		hue: 25,
	},
	subscription: {
		slug: "subscription",
		label: "サブスク",
		icon: "fa6-solid:credit-card",
		hue: 270,
	},
	travel: {
		slug: "travel",
		label: "トラベル",
		icon: "fa6-solid:plane",
		hue: 150,
	},
} as const;

export type CategorySlug = keyof typeof CATEGORIES;

/** フロントマターの category 文字列からスラッグを正規化 */
export function normalizeCategorySlug(raw: string | null | undefined): CategorySlug | null {
	if (!raw) return null;
	const trimmed = raw.trim();
	const lower = trimmed.toLowerCase() as CategorySlug;
	if (lower in CATEGORIES) return lower;

	for (const [slug, cat] of Object.entries(CATEGORIES)) {
		if (cat.label === trimmed) return slug as CategorySlug;
	}

	return null;
}
