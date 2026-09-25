// Données structurées schema.org (JSON-LD), typées avec schema-dts.
import type { BreadcrumbList, Graph, Organization, Person, Thing, WebSite } from 'schema-dts';
import { artinova, education, site, socials } from '@data/site';

export const PERSON_ID = `${site.url}/#person`;
export const WEBSITE_ID = `${site.url}/#website`;
export const ARTINOVA_ID = `${site.url}/#artinova`;

export const abs = (path: string) => new URL(path, site.url).toString();

export function artinovaNode(): Organization {
	return {
		'@type': 'Organization',
		'@id': ARTINOVA_ID,
		name: artinova.name,
		url: artinova.url,
		sameAs: [artinova.linkedin, artinova.github],
	};
}

export function personNode(): Person {
	return {
		'@type': 'Person',
		'@id': PERSON_ID,
		name: site.name,
		givenName: site.givenName,
		familyName: site.familyName,
		jobTitle: site.role,
		description: site.headline,
		url: site.url,
		image: abs('/og/accueil.png'),
		worksFor: { '@id': ARTINOVA_ID },
		alumniOf: {
			'@type': 'CollegeOrUniversity',
			name: education.school,
			parentOrganization: { '@type': 'CollegeOrUniversity', name: education.university },
		},
		knowsAbout: [
			'Architecture logicielle',
			'TypeScript',
			'Rust',
			'Python',
			'PostgreSQL',
			'Temps réel',
			'Infrastructure cloud',
			'Sécurité applicative',
			'WebGL',
		],
		sameAs: socials.map((s) => s.href),
	};
}

export function websiteNode(): WebSite {
	return {
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		url: site.url,
		name: site.name,
		description: site.description,
		inLanguage: 'fr-FR',
		publisher: { '@id': PERSON_ID },
	};
}

export function breadcrumbNode(items: { name: string; path: string }[]): BreadcrumbList {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: abs(item.path),
		})),
	};
}

export function graph(...nodes: Thing[]): Graph {
	return { '@context': 'https://schema.org', '@graph': nodes as Graph['@graph'] };
}

type ProjectData = {
	id: string;
	title: string;
	description: string;
	year: number;
	stack: string[];
	languages: string[];
	repo?: string;
};

/** Projet : SoftwareSourceCode s'il a un dépôt public, sinon CreativeWork. */
export function projectNode(p: ProjectData): Thing {
	const url = abs(`/projets/${p.id}/`);
	const common = {
		'@id': `${url}#projet`,
		name: p.title,
		description: p.description,
		url,
		image: abs(`/og/${p.id}.png`),
		dateCreated: String(p.year),
		inLanguage: 'fr-FR',
		keywords: p.stack.join(', '),
		author: { '@id': PERSON_ID },
		creator: { '@id': PERSON_ID },
	};
	if (p.repo) {
		return {
			'@type': 'SoftwareSourceCode',
			...common,
			codeRepository: p.repo,
			programmingLanguage: p.languages,
		} as Thing;
	}
	return { '@type': 'CreativeWork', ...common } as Thing;
}

export function projectListNode(items: { id: string; title: string }[]): Thing {
	return {
		'@type': 'CollectionPage',
		'@id': abs('/projets/#page'),
		url: abs('/projets/'),
		name: 'Projets',
		inLanguage: 'fr-FR',
		isPartOf: { '@id': WEBSITE_ID },
		about: { '@id': PERSON_ID },
		mainEntity: {
			'@type': 'ItemList',
			itemListElement: items.map((p, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				url: abs(`/projets/${p.id}/`),
				name: p.title,
			})),
		},
	} as Thing;
}
