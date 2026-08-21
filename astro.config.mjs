// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
// https://astro.build/config
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
			name: "Fraunces",
			cssVariable: "--font-display",
			fallbacks: ["Georgia", "serif"],
			weights: ["300 600"],
			styles: ["normal", "italic"],
		},
		{
			provider: fontProviders.google(),
			name: "Schibsted Grotesk",
			cssVariable: "--font-body",
			fallbacks: ["system-ui", "sans-serif"],
			weights: ["400 700"],
			styles: ["normal"],
		},
		{
			provider: fontProviders.google(),
			name: "Fragment Mono",
			cssVariable: "--font-mono",
			fallbacks: ["ui-monospace", "monospace"],
			weights: [400],
			styles: ["normal", "italic"],
		},
	],
});
