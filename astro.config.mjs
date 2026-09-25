import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders, memoryCache } from 'astro/config';
import emailGuard from './integrations/email-guard.mjs';

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

// Adresse révélée sur /contact/ après la preuve de travail. Elle n'est jamais
// écrite en clair dans le build : email-guard fait échouer la compilation si
// elle apparaît dans dist/.
const CONTACT_EMAIL_DEFAULT = 'evanhugues@proton.me';

// https://astro.build/config
export default defineConfig({
	site: 'https://evanhgs.fr',
	trailingSlash: 'always',
	integrations: [
		sitemap({
			// /fr/ n'existe que pour les anciens liens (canonical vers /).
			filter: (page) => !/^\/(fr|404|og|labo)(\/|$)/.test(new URL(page).pathname),
		}),
		emailGuard({ email: process.env.CONTACT_EMAIL || CONTACT_EMAIL_DEFAULT }),
	],
	build: {
		// CSS inliné dans chaque page : zéro requête bloquante pour le rendu.
		inlineStylesheets: 'always',
	},
	vite: {
		build: {
			// Astro insère inline les scripts de moins de assetsInlineLimit ;
			// la CSP (script-src 'self') les bloquerait. On garde tout externe.
			assetsInlineLimit: 0,
		},
	},
	devToolbar: { enabled: false },
	prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
	fonts: [
		{
			name: 'Mona Sans',
			cssVariable: '--font-mona',
			provider: fontProviders.local(),
			fallbacks: ['Arial', 'sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/mona-sans-vf.woff2'],
						weight: '350 850',
						stretch: '75% 100%',
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
	experimental: {
		rustCompiler,
		queuedRendering: {
			enabled: true,
		},
		cache: {
			provider: memoryCache(),
		},
	},
	env: {
		schema: {
			CONTACT_EMAIL: envField.string({
				context: 'server',
				access: 'public',
				default: CONTACT_EMAIL_DEFAULT,
			}),
		},
	},
});
