// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";

export default defineConfig({
	site: "https://eitaar.dev",
	compressHTML: true,
	integrations: [mdx(), sitemap(), icon()],
	vite: {
		plugins: [tailwindcss()],
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Share",
			cssVariable: "--font-share",
			fallbacks: ["sans-serif"],
			weights: [400, 700],
			styles: ["normal"],
		},
		{
			provider: fontProviders.google(),
			name: "Cormorant Garamond",
			cssVariable: "--font-display",
			fallbacks: ["Georgia", "serif"],
			weights: [400, 500, 600],
			styles: ["normal", "italic"],
		},
	],
});
