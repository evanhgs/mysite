// Budgets de poids (gzip) du build : JS initial de chaque page, modules
// chargés à la demande, CSS inline, HTML et police. Échoue si un budget est
// dépassé. Usage : node scripts/size.mjs [--json fichier]
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const KB = 1024;
const BUDGET = {
	/** JS exécuté au chargement de l'accueil (hors modules différés). */
	homeInitialJs: 8 * KB,
	/** JS initial de toute autre page. */
	initialJs: 10 * KB,
	/** Three.js, chargé à la demande et partagé par les scènes. */
	sharedLazy: 150 * KB,
	/** Code propre à une scène WebGL (hors Three.js). */
	scene: 25 * KB,
	/** CSS inline d'une page. */
	css: 18 * KB,
	/** HTML d'une page (CSS inline et SVG compris). */
	html: 30 * KB,
	/** Police variable, déjà compressée (woff2). */
	font: 60 * KB,
};

const gz = (data) => gzipSync(data, { level: 9 }).length;
const kb = (n) => `${(n / KB).toFixed(1)} Ko`;

async function walk(dir) {
	const out = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...(await walk(p)));
		else out.push(p);
	}
	return out;
}

// Graphe des modules : imports statiques et dynamiques de chaque fichier JS.
const graph = new Map();
async function mod(file) {
	if (graph.has(file)) return graph.get(file);
	const src = await readFile(file, 'utf8');
	const resolve = (spec) => join(dirname(file), spec);
	const node = {
		size: gz(src),
		imports: [...src.matchAll(/(?:^|[;}\s])(?:import|export)\s*(?:[\w$*{},\s]+?from\s*)?["'`](\.{1,2}\/[^"'`]+?\.js)["'`]/g)].map((m) =>
			resolve(m[1]),
		),
		// Vite 8 (Rolldown) écrit les imports dynamiques avec des gabarits : import(`./x.js`).
		dynamic: [...src.matchAll(/import\(\s*["'`](\.{1,2}\/[^"'`]+?\.js)["'`]\s*\)/g)].map((m) => resolve(m[1])),
	};
	graph.set(file, node);
	return node;
}
async function closure(entries, exclude = new Set()) {
	const seen = new Set();
	const stack = [...entries];
	while (stack.length) {
		const f = stack.pop();
		if (seen.has(f) || exclude.has(f)) continue;
		seen.add(f);
		stack.push(...(await mod(f)).imports);
	}
	return seen;
}
const total = (set) => [...set].reduce((s, f) => s + graph.get(f).size, 0);

const failures = [];
const check = (label, value, budget) => {
	const ok = value <= budget;
	if (!ok) failures.push(`${label} : ${kb(value)} > ${kb(budget)}`);
	return `${kb(value).padStart(9)}${ok ? '' : '  ✗'}`;
};

const files = await walk(DIST);
const pages = files.filter((f) => f.endsWith('.html')).sort();
const report = { pages: {}, lazy: {}, font: 0 };
const lazyEntries = new Map();

console.log('Page'.padEnd(34), 'HTML'.padStart(9), 'CSS'.padStart(9), 'JS init.'.padStart(9));
for (const page of pages) {
	const html = await readFile(page, 'utf8');
	const route = '/' + relative(DIST, page).replace(/index\.html$/, '').replace(/\.html$/, '/');
	if (route.startsWith('/og/')) continue;
	const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('');
	const entries = [...html.matchAll(/<script[^>]+type="module"[^>]+src="\/([^"]+)"/g)].map((m) => join(DIST, m[1]));
	const initial = await closure(entries);
	for (const f of initial) for (const d of graph.get(f).dynamic) if (!initial.has(d)) lazyEntries.set(d, initial);
	const js = total(initial);
	const jsBudget = route === '/' ? BUDGET.homeInitialJs : BUDGET.initialJs;
	console.log(
		route.padEnd(34),
		check(`${route} HTML`, gz(html), BUDGET.html),
		check(`${route} CSS`, gz(css), BUDGET.css),
		check(`${route} JS initial`, js, jsBudget),
	);
	report.pages[route] = { html: gz(html), css: gz(css), js };
}

// Modules différés : le code propre à chaque entrée, et les dépendances
// partagées (Three.js) comptées une seule fois.
console.log('\nChargé à la demande');
const owners = new Map();
for (const [entry, initial] of lazyEntries) {
	for (const f of await closure([entry], initial)) owners.set(f, (owners.get(f) ?? new Set()).add(entry));
}
const shared = new Set([...owners].filter(([, o]) => o.size > 1).map(([f]) => f));
for (const [entry] of lazyEntries) {
	const own = [...(await closure([entry], lazyEntries.get(entry)))].filter((f) => !shared.has(f));
	const size = own.reduce((s, f) => s + graph.get(f).size, 0);
	const name = relative(DIST, entry);
	console.log('  ' + name.padEnd(46), check(`scène ${name}`, size, BUDGET.scene));
	report.lazy[name] = size;
}
if (shared.size) {
	const size = total(shared);
	console.log('  ' + 'partagé (Three.js)'.padEnd(46), check('Three.js partagé', size, BUDGET.sharedLazy));
	report.lazy.shared = size;
}

const fonts = files.filter((f) => f.endsWith('.woff2'));
for (const f of fonts) {
	const size = (await readFile(f)).length;
	console.log(`\nPolice ${relative(DIST, f)}`.padEnd(48), check('police', size, BUDGET.font));
	report.font += size;
}

const out = process.argv.indexOf('--json');
if (out > 0) await writeFile(process.argv[out + 1], JSON.stringify(report, null, 1));

if (failures.length) {
	console.log(`\n${failures.length} budget(s) dépassé(s) :\n  ${failures.join('\n  ')}`);
	process.exit(1);
}
console.log('\nBudgets respectés.');
