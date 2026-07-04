import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, memoryCache } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://evanhgs.fr',
	integrations: [mdx(), sitemap()],
	build: {
		// CSS inliné dans chaque page : zéro requête bloquante pour le rendu.
		inlineStylesheets: 'always',
	},
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
		csp: true,
	},
	i18n: {
		locales: ['fr', 'en'],
		defaultLocale: 'fr',
		routing: {
			prefixDefaultLocale: true,
		},
	},
	env: {
		schema: {
			BASE_URL: envField.string({
				context: 'client',
				access: 'public',
				optional: true,
			}),
		},
	},
});
