// Identité et contenus transverses du site. L'adresse e-mail n'est volontairement
// PAS ici : elle est chiffrée au build sur /contact/ (voir astro.config.mjs).

export const site = {
	url: 'https://evanhgs.fr',
	name: 'Evan Hugues',
	givenName: 'Evan',
	familyName: 'Hugues',
	role: 'Ingénieur logiciel',
	headline: 'Ingénieur logiciel, cofondateur et CTO d’Artinova',
	location: 'Lyon',
	timeZone: 'Europe/Paris',
	description:
		'Ingénieur logiciel, cofondateur et CTO d’Artinova. Architecture, API, temps réel, Rust, TypeScript, infra : simple en surface, rigoureux dessous.',
} as const;

export const nav = [
	{ href: '/projets/', label: 'Projets' },
	{ href: '/a-propos/', label: 'À propos' },
	{ href: '/contact/', label: 'Contact' },
] as const;

export const socials = [
	{ label: 'GitHub', href: 'https://github.com/evanhgs' },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/evanhugues/' },
	{ label: 'Hack The Box', href: 'https://profile.hackthebox.com/profile/019d1fae-bea8-70cc-976c-77909e028c23' },
] as const;

export const artinova = {
	name: 'Artinova',
	url: 'https://www.artinova.fr/',
	docs: 'https://docs.artinova.fr/',
	linkedin: 'https://www.linkedin.com/company/artinovafr',
	github: 'https://github.com/artinova-software',
} as const;

export const education = {
	degree: 'BUT Informatique',
	school: 'IUT de Valence',
	university: 'Université Grenoble Alpes',
	detail: 'Bac+3 · diplômé',
} as const;

/** Compétences, écrites en prose : pas de grille de badges. */
export const skills = [
	{
		domain: 'Langages',
		text: 'TypeScript et Rust au quotidien, Python pour l’API et la data, SQL partout. PHP, Java et Dart quand le projet le demande.',
	},
	{
		domain: 'Back-end',
		text: 'API REST typées (NestJS, FastAPI, axum), files de jobs (BullMQ, Postgres SKIP LOCKED), temps réel (WebSocket, MQTT, Redis pub/sub), paiements et webhooks idempotents.',
	},
	{
		domain: 'Front-end',
		text: 'Next.js et React côté produit, Astro pour les sites rapides, Three.js et WebGL quand l’interface doit surprendre. Accessibilité et performance comme critères d’acceptation.',
	},
	{
		domain: 'Données',
		text: 'PostgreSQL (verrous, triggers, contraintes composées), Prisma et Drizzle, SQLite embarqué, Redis, stockage S3.',
	},
	{
		domain: 'Infra',
		text: 'AWS (ECS Fargate, RDS, S3) en Terraform, Docker durci, Caddy et nginx, CI/CD GitHub Actions et GitLab, auto-hébergement sur VPS et homelab.',
	},
	{
		domain: 'Sécurité',
		text: 'Réflexe offensif entretenu sur Root-Me et Hack The Box : modèle de menace, chiffrement, CSP stricte, isolation multi-tenant, audits de mes propres projets.',
	},
] as const;
