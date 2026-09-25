// Recadre les captures d'écran de projets (barre DevTools, badge de dev,
// données du commanditaire) vers src/assets/projets/. Les dépôts sources
// doivent être clonés à côté : ../evanhgs/<repo>.
// Usage : npm run assets:crop
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = process.env.REPOS_DIR ?? new URL('../../evanhgs/', import.meta.url).pathname;
const OUT = new URL('../src/assets/projets/', import.meta.url).pathname;

const jobs = [
	{
		// Tableau de bord superviseur, sans la liste des produits manquants.
		from: 'sae5-aramis/docs/screenshots app/story superviseur/Screenshot From 2026-03-08 17-26-59.png',
		to: 'aramis/supervision.png',
		crop: { left: 0, top: 0, width: 2376, height: 790 },
	},
	{
		// Vue 3D de la palette, sans la barre DevTools ni le badge Next.js.
		from: 'sae5-aramis/docs/screenshots app/story preparateur/Screenshot From 2026-03-08 17-11-19.png',
		to: 'aramis/palette.png',
		crop: { left: 60, top: 90, width: 816, height: 1195 },
	},
];

for (const job of jobs) {
	const out = OUT + job.to;
	await mkdir(out.slice(0, out.lastIndexOf('/')), { recursive: true });
	const info = await sharp(SRC + job.from).extract(job.crop).png({ compressionLevel: 9 }).toFile(out);
	console.log(`[crop] ${job.to} ${info.width}×${info.height}`);
}
