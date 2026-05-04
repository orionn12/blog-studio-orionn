import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "studio orionn",
	subtitle: "プログラミング・ガジェット・サブスク・旅",
	lang: "ja",
	themeColor: {
		hue: 240,
		fixed: false,
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		{
			name: "プログラミング",
			url: "/programming/",
		},
		{
			name: "ガジェット",
			url: "/gadget/",
		},
		{
			name: "サブスク",
			url: "/subscription/",
		},
		{
			name: "トラベル",
			url: "/travel/",
		},
		LinkPreset.Archive,
		LinkPreset.About,
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png",
	name: "orionn",
	bio: "IT系の仕事をしながら、毎日AIとコードを書くのが趣味。プログラミング・ガジェット・サブスク・トラベルについて語ります。",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com",
		},
		{
			name: "X (Twitter)",
			icon: "fa6-brands:x-twitter",
			url: "https://x.com",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
