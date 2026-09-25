// Découpe le HTML rendu d'une étude de cas en ses cinq sections, dans l'ordre
// attendu. Le build échoue si une section manque ou est déplacée.
import type { MarkdownHeading } from 'astro';

export const SECTION_ORDER = [
	'Le contexte',
	'Stack & infra',
	'Comment ça marche',
	'La difficulté',
	'Ce que ça m’a apporté',
] as const;

export interface Section {
	heading: string;
	slug: string;
	html: string;
}

const normalize = (s: string) => s.replace(/['’]/g, '’').replace(/\s+/g, ' ').trim();

export function splitSections(id: string, html: string, headings: MarkdownHeading[]): Section[] {
	const h2 = headings.filter((h) => h.depth === 2);
	const names = h2.map((h) => normalize(h.text));
	const expected = SECTION_ORDER.map(normalize);
	if (names.join('|') !== expected.join('|')) {
		throw new Error(
			`[projets/${id}] sections attendues : ${expected.join(', ')} — trouvées : ${names.join(', ') || 'aucune'}`,
		);
	}
	const parts = html.split(/(?=<h2[\s>])/).filter((p) => p.trim());
	if (parts.length !== h2.length || !parts[0].startsWith('<h2')) {
		throw new Error(`[projets/${id}] du contenu précède la première section ou le découpage a échoué`);
	}
	return parts.map((part, i) => ({
		heading: h2[i].text,
		slug: h2[i].slug,
		html: part.replace(/^<h2[^>]*>[\s\S]*?<\/h2>/, '').trim(),
	}));
}
