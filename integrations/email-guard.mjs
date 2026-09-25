// Garde-fou : l'adresse e-mail ne doit jamais apparaître en clair dans le
// build (elle n'est révélée qu'après la preuve de travail sur /contact/).
// Fait échouer `astro build` — donc aussi le déploiement Vercel — sinon.
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEXT_EXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.xml', '.txt', '.svg', '.webmanifest', '.map']);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Motifs qui trahiraient l'adresse : brute, encodée en URL ou en entités HTML. */
export function emailPatterns(email) {
	const [local, domain] = email.toLowerCase().split('@');
	const at = '(?:@|%40|&#0*64;|&#x0*40;|\\\\u0040|\\\\x40)';
	return [
		new RegExp(`${escapeRe(local)}\\s*${at}`, 'i'),
		new RegExp(`${at}\\s*${escapeRe(domain)}`, 'i'),
		new RegExp(`mailto:[^"'\\s>]*${escapeRe(local)}`, 'i'),
	];
}

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else yield path;
	}
}

export async function findLeaks(outDir, email) {
	const patterns = emailPatterns(email);
	const leaks = [];
	for await (const file of walk(outDir)) {
		if (!TEXT_EXT.has(extname(file))) continue;
		const text = await readFile(file, 'utf8');
		for (const re of patterns) {
			const m = re.exec(text);
			if (m) leaks.push({ file: relative(outDir, file), match: m[0] });
		}
	}
	return leaks;
}

export default function emailGuard({ email }) {
	return {
		name: 'email-guard',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const outDir = fileURLToPath(dir);
				const leaks = await findLeaks(outDir, email);
				if (leaks.length > 0) {
					for (const l of leaks) logger.error(`${l.file} : « ${l.match} »`);
					throw new Error(`[email-guard] L'adresse e-mail apparaît en clair dans ${leaks.length} fichier(s) du build.`);
				}
				logger.info('Aucune adresse e-mail en clair dans le build.');
			},
		},
	};
}
