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
            name: "Fredoka",
            cssVariable: "--font-fredoka",
            fallbacks: ["sans-serif"],
            weights: [400, 500, 600, 700],
            styles: ["normal"],
        },
        {
            provider: fontProviders.google(),
            name: "DM Sans",
            cssVariable: "--font-dm-sans",
            fallbacks: ["sans-serif"],
            weights: [300, 400, 500],
            styles: ["normal", "italic"],
        },
    ],
});