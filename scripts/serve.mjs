// Sert dist/ comme Vercel le ferait : trailingSlash, redirections et en-têtes
// de vercel.json (CSP comprise), 404 réelle. Sert aux vérifications locales.
// Usage : node scripts/serve.mjs [port]
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile, match, pathToRegexp } from 'path-to-regexp';

const ROOT = fileURLToPath(new URL('../dist/', import.meta.url));
const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4321);

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json',
	'.xml': 'application/xml',
	'.txt': 'text/plain; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.ico': 'image/x-icon',
	'.woff2': 'font/woff2',
};

const redirects = (config.redirects ?? []).map((r) => ({
	test: match(r.source, { decode: decodeURIComponent }),
	to: compile(r.destination, { encode: (s) => s, validate: false }),
	status: r.statusCode ?? (r.permanent === false ? 307 : 308),
}));

const headerRules = (config.headers ?? []).map((h) => ({ re: pathToRegexp(h.source), headers: h.headers }));

function headersFor(path) {
	const out = {};
	for (const rule of headerRules) {
		if (rule.re.test(path)) for (const { key, value } of rule.headers) out[key] = value;
	}
	// En local on sert en http : upgrade-insecure-requests casserait les sous-ressources.
	if (out['Content-Security-Policy']) {
		out['Content-Security-Policy'] = out['Content-Security-Policy'].replace(/;\s*upgrade-insecure-requests/, '');
	}
	return out;
}

async function resolveFile(path) {
	const safe = normalize(decodeURIComponent(path)).replace(/^(\.\.[/\\])+/, '');
	let file = join(ROOT, safe);
	if (path.endsWith('/')) file = join(file, 'index.html');
	try {
		const s = await stat(file);
		if (s.isFile()) return file;
	} catch {
		/* introuvable */
	}
	return null;
}

const server = createServer(async (req, res) => {
	const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
	let path = url.pathname;
	const base = headersFor(path);

	const lastSegment = path.split('/').pop() ?? '';
	if (config.trailingSlash && !path.endsWith('/') && !lastSegment.includes('.')) {
		res.writeHead(308, { ...base, Location: `${path}/${url.search}` });
		return res.end();
	}

	for (const r of redirects) {
		const m = r.test(path);
		if (m) {
			res.writeHead(r.status, { ...base, Location: r.to(m.params) });
			return res.end();
		}
	}

	const file = await resolveFile(path);
	if (!file) {
		res.writeHead(404, { ...base, 'Content-Type': TYPES['.html'] });
		return createReadStream(join(ROOT, '404.html')).pipe(res);
	}
	res.writeHead(200, { ...base, 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
	createReadStream(file).pipe(res);
});

server.listen(PORT, () => console.log(`[serve] http://localhost:${PORT} (dist/ + vercel.json)`));
