import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, memoryCache } from 'astro/config';

// Le binding natif du compilateur Rust exige glibc >= 2.35 ; l'image de
// build Vercel (Amazon Linux 2023) est en glibc 2.34 et ne peut pas le
// charger. On ne l'active que si le binaire se charge réellement, sinon
// Astro retombe sur le compilateur WASM standard (sortie identique).
let rustCompiler = true;
try {
	await import('@astrojs/compiler-binding');
} catch {
	rustCompiler = false;
	console.warn('[config] Compilateur Rust indisponible sur cette plateforme, repli sur le compilateur WASM.');
}

// https://astro.build/config
export default defineConfig({
	site: 'https://evanhgs.fr',
	integrations: [mdx(), sitemap()],
	build: {
		// CSS inliné dans chaque page : zéro requête bloquante pour le rendu.
		inlineStylesheets: 'always',
	},
	experimental: {
		rustCompiler,
		queuedRendering: {
			enabled: true,
		},
		cache: {
			provider: memoryCache(),
		},
	},
	// CSP gérée par en-têtes HTTP (nginx.conf / vercel.json), pas par meta :
	// security.csp est incompatible avec les styles inline de Shiki.
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
