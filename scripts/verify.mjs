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
// Icônes générées au build depuis la géométrie du triangle.
{
	const ico = await readFile(join(DIST, 'favicon.ico'));
	const svg = await readFile(join(DIST, 'icon.svg'), 'utf8');
	const png = await readFile(join(DIST, 'apple-touch-icon.png'));
	const icoOk = ico.readUInt16LE(2) === 1 && ico.readUInt16LE(4) >= 1;
	const pngOk = png.subarray(1, 4).toString() === 'PNG' && png.readUInt32BE(16) === 180;
	if (!icoOk || !svg.startsWith('<svg') || !pngOk) fail('icônes du site invalides');
	else pass('icônes : favicon.ico, icon.svg, apple-touch-icon.png (180 px)');
}

const robots = await readFile(join(DIST, 'robots.txt'), 'utf8');
if (!/Sitemap: https:\/\/evanhgs\.fr\/sitemap-index\.xml/.test(robots)) fail('robots.txt sans ligne Sitemap');

const contactHtml = await readFile(join(DIST, 'contact/index.html'), 'utf8');
const payload = contactHtml.match(/data-payload="([^"]+)"/)?.[1];
if (!payload) fail('contact : aucune donnée chiffrée dans la page');
else {
	const { deobfuscate } = await import('altcha-lib/obfuscation');
	const clear = await deobfuscate(payload);
	if (clear !== EMAIL) fail(`contact : le déchiffrement donne « ${clear} »`);
	else pass('contact : la donnée chiffrée se déchiffre en la bonne adresse (Node)');
}

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

	// ------------------------------------------------------------ contact
	console.log('\n# Contact');
	await mkdir(SHOTS, { recursive: true });
	{
		const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
		const page = await context.newPage();
		const raw = await (await page.goto(`${BASE}/contact/`)).text();
		if (raw.includes(EMAIL)) fail('contact : adresse présente dans le HTML brut');
		const t0 = Date.now();
		await page.click('[data-check]');
		await page.waitForSelector('[data-result]:not([hidden])', { timeout: 30_000 });
		const shown = await page.getAttribute('[data-email]', 'aria-label');
		const href = await page.getAttribute('[data-mailto]', 'href');
		if (shown !== EMAIL) fail(`contact : adresse affichée « ${shown} »`);
		else if (!href?.startsWith(`mailto:${EMAIL}`)) fail(`contact : lien mailto incorrect ${href}`);
		else pass(`contact : case cochée → adresse révélée en ${Date.now() - t0} ms`);
		await page.waitForTimeout(1600);
		await page.screenshot({ path: join(SHOTS, 'contact-revealed.png') });
		await context.close();
	}

	// ------------------------------------------------------------ grille des projets
	console.log('\n# Projets : liste et grille');
	{
		const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
		const page = await context.newPage();
		await page.goto(`${BASE}/projets/`, { waitUntil: 'networkidle' });
		const vue = () => page.evaluate(() => document.documentElement.dataset.vue);
		await page.waitForSelector('[data-grid][data-ready]', { timeout: 30_000 }).catch(() => undefined);
		if ((await vue()) !== 'grille' || !(await page.$('[data-grid][data-ready]'))) fail('grille : pas active par défaut sur desktop');
		else pass('grille WebGL active par défaut sur desktop');

		// Survol : la sélection analytique trouve une carte au centre de l'écran.
		const top = await page.evaluate(() => document.querySelector('[data-grid]').getBoundingClientRect().top + scrollY);
		await page.evaluate((y) => scrollTo(0, y), top);
		await page.mouse.move(720, 450);
		await page.waitForFunction(() => document.querySelector('[data-grid-caption] strong'), null, { timeout: 10_000 }).catch(() => undefined);
		const hovered = await page.evaluate(() => document.querySelector('[data-grid-caption] strong')?.textContent ?? '');
		if (hovered) pass(`grille : carte survolée « ${hovered} »`);
		else fail('grille : aucune carte détectée sous le pointeur');

		// Liste : choix mémorisé après rechargement ; la liste reste accessible.
		await page.evaluate(() => scrollTo(0, 0));
		await page.click('button[data-view="liste"]');
		await page.waitForFunction(() => document.documentElement.dataset.vue === 'liste', null, { timeout: 10_000 }).catch(() => undefined);
		await page.reload({ waitUntil: 'networkidle' });
		if ((await vue()) !== 'liste') fail('liste : choix non mémorisé');
		else pass('liste : choix mémorisé après rechargement');
		await page.click('button[data-view="grille"]');
		await page.waitForFunction(() => document.documentElement.dataset.vue === 'grille', null, { timeout: 10_000 }).catch(() => undefined);
		await page.focus('button[data-view="liste"]');
		await page.keyboard.press('Tab');
		const overlay = await page.evaluate(() => ({
			inList: Boolean(document.activeElement?.closest('[data-list]')),
			position: getComputedStyle(document.querySelector('[data-list]')).position,
		}));
		if (!overlay.inList || overlay.position !== 'fixed') fail(`grille : liste non atteignable au clavier (${JSON.stringify(overlay)})`);
		else pass('grille : la liste s’ouvre en surimpression au clavier');
		await context.close();

		const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
		const rp = await reduced.newPage();
		await rp.goto(`${BASE}/projets/`, { waitUntil: 'networkidle' });
		const state = await rp.evaluate(() => ({
			vue: document.documentElement.dataset.vue,
			switcher: document.querySelector('[data-views]').hidden,
		}));
		if (state.vue !== 'liste' || !state.switcher) fail(`mouvement réduit : ${JSON.stringify(state)}`);
		else pass('mouvement réduit : liste seule, sans sélecteur');
		await reduced.close();
	}

	// ------------------------------------------------------------ mouvement réduit
	console.log('\n# Mouvement réduit');
	{
		const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
		const page = await context.newPage();
		const scripts = [];
		page.on('request', (r) => r.resourceType() === 'script' && scripts.push(new URL(r.url()).pathname));
		await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1500);
		const state = await page.evaluate(() => ({
			live: document.querySelector('[data-scene]')?.classList.contains('is-live'),
			gl: document.documentElement.dataset.gl,
			poster: getComputedStyle(document.querySelector('.poster')).display !== 'none',
		}));
		const heavy = scripts.filter((p) => /\/(stage|scene|lenis)\./.test(p));
		if (state.live || state.gl === 'ready' || !state.poster || heavy.length)
			fail(`accueil en mouvement réduit : ${JSON.stringify({ ...state, heavy })}`);
		else pass('accueil en mouvement réduit : poster SVG, ni WebGL, ni Three.js, ni Lenis');
		await context.close();
	}

	// ------------------------------------------------------------ pages
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
			if (expect404) {
				const stairs = await page.waitForSelector('[data-stairs][data-ready]', { timeout: 20_000 }).catch(() => null);
				if (!stairs) errors.push('escalier WebGL non démarré');
			}

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
