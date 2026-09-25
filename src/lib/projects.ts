// Accès aux projets : tri, groupement par année, projet suivant.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Projet = CollectionEntry<'projets'>;

export async function getProjects(): Promise<Projet[]> {
	const all = await getCollection('projets');
	return all.sort((a, b) => a.data.order - b.data.order);
}

export function groupByYear(projects: Projet[]): { year: number; items: Projet[] }[] {
	const years = [...new Set(projects.map((p) => p.data.year))].sort((a, b) => b - a);
	return years.map((year) => ({ year, items: projects.filter((p) => p.data.year === year) }));
}

export function nextProject(projects: Projet[], current: Projet): Projet {
	const i = projects.findIndex((p) => p.id === current.id);
	return projects[(i + 1) % projects.length];
}

export const projectUrl = (p: Projet) => `/projets/${p.id}/`;

/** Nom de transition partagé entre la ligne de liste et le titre de la page. */
export const transitionName = (p: Projet) => `projet-${p.id}`;
