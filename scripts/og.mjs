// Génère les images Open Graph (public/og/<clé>.png) en capturant les
// gabarits /og/<clé>/ servis par `astro dev`. Images commitées.
// Usage : npm run og
import { spawn } from 'node:child_process';
import { mkdir, readdir } from 'node:fs/promises';
import sharp from 'sharp';
import { chromium } from 'playwright';

const PORT = 4398;
const BASE = `http://localhost:${PORT}`;
const OUT = new URL('../public/og/', import.meta.url).pathname;

const slugs = (await readdir(new URL('../src/content/projets/', import.meta.url)))
	.filter((f) => f.endsWith('.md'))
	.map((f) => f.replace(/\.md$/, ''));
const keys = ['accueil', 'projets', 'a-propos', 'contact', ...slugs];

const dev = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'dev', '--port', String(PORT)], {
	stdio: ['ignore', 'pipe', 'pipe'],
});
const ready = async () => {
	for (let i = 0; i < 120; i++) {
		try {
			const r = await fetch(`${BASE}/og/accueil/`);
			if (r.ok) return;
		} catch {
			/* pas encore prêt */
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error('astro dev ne répond pas');
};

try {
	await ready();
	await mkdir(OUT, { recursive: true });
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
	for (const key of keys) {
		await page.goto(`${BASE}/og/${key}/`, { waitUntil: 'networkidle' });
		await page.evaluate(() => document.fonts.ready);
		const png = await page.screenshot({ type: 'png' });
		const info = await sharp(png).png({ palette: true, quality: 92, compressionLevel: 9 }).toFile(`${OUT}${key}.png`);
		console.log(`[og] ${key}.png ${(info.size / 1024).toFixed(0)} Ko`);
	}
	await browser.close();
} finally {
	dev.kill();
}
