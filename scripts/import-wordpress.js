import fs from "node:fs/promises";
import path from "node:path";

const WP_BASE = "https://www.orionn.silver-fruit.com";
const POSTS_DIR = path.resolve("src/content/posts");
const IMAGE_PUBLIC_DIR = path.resolve("public/images/wp-import");

const categoryById = new Map([
	[1, "ガジェット"],
	[9, "サブスク"],
	[11, "プログラミング"],
]);

const postMeta = new Map([
	[
		171,
		{
			slug: "fukutoku-pass",
			tags: ["ふくとくパス", "西鉄バス", "福岡", "サブスク"],
		},
	],
	[
		206,
		{
			slug: "audible-review",
			tags: ["Audible", "オーディオブック", "サブスク", "レビュー"],
		},
	],
	[
		228,
		{
			slug: "xbox-wireless-controller-review",
			tags: ["Xbox", "コントローラー", "ゲーム", "レビュー"],
		},
	],
	[
		256,
		{
			slug: "anker-power-bank-fusion-5000-review",
			tags: ["Anker", "モバイルバッテリー", "USB充電器", "レビュー"],
		},
	],
	[
		310,
		{
			slug: "cursor-python-dev-environment",
			tags: ["Cursor", "Python", "開発環境", "プログラミング"],
		},
	],
]);

function decodeHtml(value) {
	return value
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&#8217;/g, "'")
		.replace(/&#8220;|&#8221;/g, '"')
		.replace(/&#8211;|&#8212;/g, "-")
		.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function stripHtml(html) {
	return decodeHtml(
		html
			.replace(/<script[\s\S]*?<\/script>/gi, "")
			.replace(/<style[\s\S]*?<\/style>/gi, "")
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim(),
	);
}

function yamlString(value) {
	return JSON.stringify(value ?? "");
}

function dateOnly(value) {
	return value.slice(0, 10);
}

function fileNameFromUrl(url) {
	const parsed = new URL(url);
	return decodeURIComponent(path.basename(parsed.pathname)).replace(/[^\p{L}\p{N}._-]+/gu, "-");
}

async function fetchJson(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
	}
	return response.json();
}

async function downloadImage(url, postSlug) {
	const imageDir = path.join(IMAGE_PUBLIC_DIR, postSlug);
	await fs.mkdir(imageDir, { recursive: true });

	const originalName = fileNameFromUrl(url);
	const targetPath = path.join(imageDir, originalName);
	const publicPath = `/images/wp-import/${postSlug}/${encodeURIComponent(originalName).replace(/%2F/g, "/")}`;

	try {
		await fs.access(targetPath);
		return publicPath;
	} catch {
		// download below
	}

	const response = await fetch(url);
	if (!response.ok) {
		console.warn(`Skipping image ${url}: ${response.status} ${response.statusText}`);
		return url;
	}
	const buffer = Buffer.from(await response.arrayBuffer());
	await fs.writeFile(targetPath, buffer);
	return publicPath;
}

async function replaceImages(html, postSlug) {
	const imageMatches = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)];
	let converted = html;

	for (const match of imageMatches) {
		const tag = match[0];
		const src = decodeHtml(match[1]);
		const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
		const alt = altMatch ? decodeHtml(altMatch[1]) : "";
		const localPath = src.startsWith(WP_BASE) ? await downloadImage(src, postSlug) : src;
		converted = converted.replace(tag, `\n\n![${alt.replace(/]/g, "\\]")}](${localPath})\n\n`);
	}

	return converted;
}

function convertTables(html) {
	return html.replace(/<table\b[\s\S]*?<\/table>/gi, (table) => {
		const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
			[...row[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) =>
				stripHtml(cell[1]).replace(/\|/g, "\\|"),
			),
		);

		if (rows.length === 0) return "";
		const width = Math.max(...rows.map((row) => row.length));
		const normalized = rows.map((row) => [...row, ...Array(width - row.length).fill("")]);
		const header = normalized[0];
		const body = normalized.slice(1);
		return [
			"",
			`| ${header.join(" | ")} |`,
			`| ${Array(width).fill("---").join(" | ")} |`,
			...body.map((row) => `| ${row.join(" | ")} |`),
			"",
		].join("\n");
	});
}

function htmlToMarkdown(html) {
	let markdown = html;

	markdown = markdown.replace(/\r/g, "");
	markdown = markdown.replace(/<span\b[^>]*>([\s\S]*?)<\/span>/gi, "$1");
	markdown = convertTables(markdown);
	markdown = markdown.replace(/<h([2-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
		return `\n\n${"#".repeat(Number(level))} ${stripHtml(text)}\n\n`;
	});
	markdown = markdown.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
	markdown = markdown.replace(/<br\s*\/?>/gi, "\n");
	markdown = markdown.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => {
		const quote = stripHtml(text)
			.split(/\n+/)
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => `> ${line}`)
			.join("\n");
		return `\n\n${quote}\n\n`;
	});
	markdown = markdown.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
		const label = stripHtml(text);
		return label ? `[${label}](${decodeHtml(href)})` : decodeHtml(href);
	});
	markdown = markdown.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**");
	markdown = markdown.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*");
	markdown = markdown.replace(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi, (_, list) =>
		list.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, item) => `\n- ${stripHtml(item)}`),
	);
	markdown = markdown.replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (_, list) => {
		let index = 0;
		return list.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, item) => `\n${++index}. ${stripHtml(item)}`);
	});
	markdown = markdown.replace(/<[^>]+>/g, "");
	markdown = decodeHtml(markdown);
	markdown = markdown.replace(/[ \t]+\n/g, "\n");
	markdown = markdown.replace(/\n{3,}/g, "\n\n");
	return `${markdown.trim()}\n`;
}

async function importPosts() {
	const posts = await fetchJson(
		`${WP_BASE}/wp-json/wp/v2/posts?per_page=100&_fields=id,title,content,excerpt,date,modified,categories,featured_media`,
	);
	const media = await fetchJson(`${WP_BASE}/wp-json/wp/v2/media?per_page=100&_fields=id,source_url`);
	const mediaById = new Map(media.map((item) => [item.id, item.source_url]));

	await fs.mkdir(POSTS_DIR, { recursive: true });

	for (const post of posts) {
		const meta = postMeta.get(post.id);
		if (!meta) {
			console.warn(`No local metadata mapping for post ${post.id}; skipping.`);
			continue;
		}

		const title = decodeHtml(post.title.rendered);
		const category = categoryById.get(post.categories?.[0]) ?? "";
		const contentWithImages = await replaceImages(post.content.rendered, meta.slug);
		const body = htmlToMarkdown(contentWithImages);
		const description = stripHtml(post.excerpt.rendered || body).slice(0, 118);

		let image = "";
		const featuredUrl = mediaById.get(post.featured_media);
		if (featuredUrl) {
			image = await downloadImage(featuredUrl, meta.slug);
		}

		const frontmatter = [
			"---",
			`title: ${yamlString(title)}`,
			`published: ${dateOnly(post.date)}`,
			`updated: ${dateOnly(post.modified)}`,
			"draft: false",
			`description: ${yamlString(description)}`,
			`image: ${yamlString(image)}`,
			`tags: ${JSON.stringify(meta.tags)}`,
			`category: ${yamlString(category)}`,
			'lang: "ja"',
			"---",
			"",
		].join("\n");

		await fs.writeFile(path.join(POSTS_DIR, `${meta.slug}.md`), `${frontmatter}${body}`);
		console.log(`Imported ${meta.slug}`);
	}
}

importPosts().catch((error) => {
	console.error(error);
	process.exit(1);
});
