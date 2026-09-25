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
