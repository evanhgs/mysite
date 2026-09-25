// Vérification de bout en bout du build (dist/) servi comme sur Vercel.
// - aucune erreur console, exception, requête en échec ni violation de CSP ;
// - redirections des anciennes URL ;
// - SEO de base (h1 unique, canonical, longueurs, og:image, JSON-LD) ;
// - l'e-mail n'apparaît pas en clair, aucun script inline exécutable ;
// - parcours spécifiques (contact, accueil, grille, mouvement réduit).
// Usage : npm run build && npm run verify
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { findLeaks } from '../integrations/email-guard.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const PORT = 4411;
const BASE = `http://localhost:${PORT}`;
const SHOTS = process.env.SHOTS_DIR ?? join(tmpdir(), 'evanhgs-shots');
const EMAIL = process.env.CONTACT_EMAIL || 'evanhugues@proton.me';
const fixtures = JSON.parse(await readFile(new URL('./fixtures/legacy-urls.json', import.meta.url), 'utf8'));

const failures = [];
const fail = (msg) => {
	failures.push(msg);
	console.log(`  ✗ ${msg}`);
};
const pass = (msg) => console.log(`  ✓ ${msg}`);

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(p);
		else yield p;
	}
}

// ---------------------------------------------------------------- build
console.log('\n# Build');
const leaks = await findLeaks(DIST, EMAIL);
if (leaks.length) leaks.forEach((l) => fail(`e-mail en clair : ${l.file}`));
else pass('aucune adresse e-mail en clair dans dist/');

let inline = 0;
for await (const file of walk(DIST)) {
	if (!file.endsWith('.html')) continue;
	const html = await readFile(file, 'utf8');
	for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
		const attrs = m[1];
		if (/\bsrc=/.test(attrs) || /type="application\/ld\+json"/.test(attrs)) continue;
		if (m[2].trim()) {
			inline++;
			fail(`script inline exécutable dans ${file.slice(DIST.length)}`);
		}
	}
}
if (!inline) pass('aucun script inline exécutable (CSP script-src self)');

const sitemap = await readFile(join(DIST, 'sitemap-0.xml'), 'utf8');
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
pass(`sitemap : ${pages.length} URL`);
if (pages.some((p) => p.startsWith('/fr/'))) fail('le sitemap contient /fr/');
const robots = await readFile(join(DIST, 'robots.txt'), 'utf8');
if (!/Sitemap: https:\/\/evanhgs\.fr\/sitemap-index\.xml/.test(robots)) fail('robots.txt sans ligne Sitemap');

// ---------------------------------------------------------------- serveur
const server = spawn(process.execPath, [fileURLToPath(new URL('./serve.mjs', import.meta.url)), String(PORT)], {
	stdio: ['ignore', 'pipe', 'inherit'],
});
await new Promise((resolve) => server.stdout.once('data', resolve));

const browser = await chromium.launch({
	args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

try {
	// ------------------------------------------------------------ redirections
	console.log('\n# Redirections');
	const ctx = await browser.newContext();
	for (const [from, to] of Object.entries(fixtures.redirects)) {
		const res = await ctx.request.get(BASE + from, { maxRedirects: 0 });
		const loc = res.headers().location ? new URL(res.headers().location, BASE).pathname : '';
		if (res.status() !== 301 || loc !== to) fail(`${from} → ${res.status()} ${loc} (attendu 301 ${to})`);
	}
	for (const path of fixtures.ok) {
		const res = await ctx.request.get(BASE + path, { maxRedirects: 0 });
		if (res.status() !== 200) fail(`${path} → ${res.status()} (attendu 200)`);
	}
	const bogus = await ctx.request.get(`${BASE}/page-inexistante/`, { maxRedirects: 0 });
	if (bogus.status() !== 404) fail(`URL inexistante → ${bogus.status()} (attendu 404)`);
	pass(`${Object.keys(fixtures.redirects).length} redirections, ${fixtures.ok.length} pages 200, 404 réelle`);
	await ctx.close();

	// ------------------------------------------------------------ pages
	await mkdir(SHOTS, { recursive: true });
	const viewports = [
		{ name: 'desktop', viewport: { width: 1440, height: 900 } },
		{ name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
	];
	const urls = [...new Set([...pages, '/fr/', '/page-inexistante/'])];

	for (const vp of viewports) {
		console.log(`\n# Pages (${vp.name})`);
		const context = await browser.newContext({ ...vp, reducedMotion: 'no-preference' });
		await context.addInitScript(() => {
			window.__csp = [];
			document.addEventListener('securitypolicyviolation', (e) =>
				window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`),
			);
		});
		for (const path of urls) {
			const page = await context.newPage();
			const errors = [];
			const expect404 = path === '/page-inexistante/';
			page.on('console', (m) => {
				if (m.type() !== 'error') return;
				if (expect404 && /status of 404/.test(m.text())) return;
				errors.push(`console: ${m.text()}`);
			});
			page.on('pageerror', (e) => errors.push(`exception: ${e.message}`));
			page.on('requestfailed', (r) => errors.push(`requête: ${r.url()} ${r.failure()?.errorText}`));
			page.on('response', (r) => {
				if (r.status() >= 400 && !r.url().endsWith('/page-inexistante/')) errors.push(`HTTP ${r.status()} ${r.url()}`);
			});
			await page.goto(BASE + path, { waitUntil: 'networkidle' });
			await page.waitForTimeout(300);
			const csp = await page.evaluate(() => window.__csp);
			csp.forEach((v) => errors.push(`CSP: ${v}`));

			if (vp.name === 'desktop' && path !== '/page-inexistante/') {
				const seo = await page.evaluate(() => ({
					h1: document.querySelectorAll('h1').length,
					title: document.title,
					description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
					canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
					og: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
					ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
				}));
				if (seo.h1 !== 1) errors.push(`${seo.h1} h1 (attendu 1)`);
				if (seo.title.length > 70) errors.push(`titre trop long (${seo.title.length})`);
				if (seo.description.length < 70 || seo.description.length > 160)
					errors.push(`description de ${seo.description.length} caractères`);
				const expected = path === '/fr/' ? '/' : path;
				if (new URL(seo.canonical).pathname !== expected) errors.push(`canonical ${seo.canonical}`);
				const ogPath = new URL(seo.og).pathname;
				if (!existsSync(join(DIST, ogPath))) errors.push(`og:image absente : ${ogPath}`);
				for (const ld of seo.ld) {
					try {
						JSON.parse(ld);
					} catch {
						errors.push('JSON-LD invalide');
					}
				}
			}

			const slug = path.replace(/\//g, '_') || 'root';
			await page.screenshot({ path: join(SHOTS, `${vp.name}${slug}.png`) });
			if (errors.length) errors.forEach((e) => fail(`${path} ${e}`));
			else pass(path);
			await page.close();
		}
		await context.close();
	}
} finally {
	await browser.close();
	server.kill();
}

console.log(`\nCaptures : ${SHOTS}`);
if (failures.length) {
	console.log(`\n${failures.length} échec(s).`);
	process.exit(1);
}
console.log('\nTout est vert.');
