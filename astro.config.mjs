import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, memoryCache } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://evanhgs.fr',
	integrations: [mdx(), sitemap()],
	experimental: {
		rustCompiler: true,
		queuedRendering: {
			enabled: true,
		},
		cache: {
			provider: memoryCache(),
		},
	},
	security: {
		csp: true
	},
	i18n: {
		locales: ["fr", "en", "es"],
		defaultLocale: "fr",
		routing: {
			prefixDefaultLocale: true
		}
	}
});
