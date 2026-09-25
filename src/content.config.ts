import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const nodeId = z.string().regex(/^[a-z0-9-]+$/);

/** Schéma d'architecture dessiné sur une grille (colonnes × lignes). */
const diagram = z
	.object({
		title: z.string(),
		cols: z.number().int().min(2).max(6),
		rows: z.number().int().min(1).max(6),
		nodes: z
			.array(
				z.object({
					id: nodeId,
					label: z.string(),
					sub: z.string().optional(),
					kind: z.enum(['client', 'service', 'worker', 'store', 'queue', 'external']),
					col: z.number().int().min(0),
					row: z.number().int().min(0),
				}),
			)
			.min(2),
		edges: z.array(
			z.object({
				from: nodeId,
				to: nodeId,
				label: z.string().optional(),
				flow: z.enum(['sync', 'async', 'stream']).default('sync'),
				both: z.boolean().default(false),
			}),
		),
	})
	.superRefine((d, ctx) => {
		const ids = new Set<string>();
		const cells = new Set<string>();
		for (const n of d.nodes) {
			if (ids.has(n.id)) ctx.addIssue({ code: 'custom', message: `nœud dupliqué : ${n.id}` });
			ids.add(n.id);
			if (n.col >= d.cols || n.row >= d.rows)
				ctx.addIssue({ code: 'custom', message: `nœud hors grille : ${n.id}` });
			const cell = `${n.col}:${n.row}`;
			if (cells.has(cell)) ctx.addIssue({ code: 'custom', message: `deux nœuds dans la cellule ${cell}` });
			cells.add(cell);
		}
		for (const e of d.edges) {
			if (!ids.has(e.from) || !ids.has(e.to))
				ctx.addIssue({ code: 'custom', message: `arête vers un nœud inconnu : ${e.from} → ${e.to}` });
		}
	});

const projets = defineCollection({
	loader: glob({ base: './src/content/projets', pattern: '*.md' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			/** Accroche courte (listes, cartes de la grille). */
			tagline: z.string().max(90),
			/** Meta description (SEO). */
			description: z.string().min(70).max(160),
			/** Grande phrase sous le titre de la page projet. */
			statement: z.string(),
			tier: z.enum(['flagship', 'main', 'secondary']),
			order: z.number(),
			year: z.number().int().min(2020).max(2030),
			period: z.string().optional(),
			context: z.string(),
			role: z.string(),
			status: z.string().optional(),
			stack: z.array(z.string()).min(1),
			languages: z.array(z.string()).default([]),
			links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
			repo: z.url().optional(),
			accent: z.string().regex(/^#[0-9a-f]{6}$/i),
			cover: z.object({
				motif: z.enum(['lattice', 'moire', 'bulge', 'sheets', 'shelves', 'speed', 'dots', 'broken', 'orbit']),
				seed: z.number().int().default(1),
			}),
			figures: z.array(z.object({ value: z.string(), label: z.string() })).max(4).default([]),
			diagram: diagram.optional(),
			gallery: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() })).default([]),
		}),
});

export const collections = { projets };
