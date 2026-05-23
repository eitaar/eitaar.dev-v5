// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
// https://astro.build/config
export default defineConfig({
	site: "https://example.com",
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
			provider: fontProviders.local(),
			name: "Ndot47",
			cssVariable: "--font-ndot47",
			options: {
				variants: [
					{
						/* Font: Ndot47 Inspired by Nothing | Copyright (c) 2021-2026, “Interactivate” | Licensed under the SIL Open Font License, Version 1.1 (http://scripts.sil.org/OFL) */
						src: ["./src/assets/fonts/ndot-47-inspired-by-nothing.otf.woff2"],
						weight: "normal",
						style: "normal",
					},
				],
			},
		},
	],
});
