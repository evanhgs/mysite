// Couvertures op-art servies en fichiers statiques : /covers/<slug>.svg
// (aperçus au survol, textures de la grille WebGL, images OG).
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { coverSvg } from '@lib/covers';

export const getStaticPaths = (async () => {
	const projets = await getCollection('projets');
	return projets.map((p) => ({ params: { slug: p.id }, props: { p } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ p: CollectionEntry<'projets'> }> = ({ props }) => {
	const { p } = props;
	const svg = coverSvg({ motif: p.data.cover.motif, seed: p.data.cover.seed, accent: p.data.accent, title: p.data.title });
	return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
