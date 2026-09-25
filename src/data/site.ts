// Identité et contenus transverses du site. L'adresse e-mail n'est volontairement
// PAS ici : elle est chiffrée au build sur /contact/ (voir astro.config.mjs).

export const site = {
	url: 'https://evanhgs.fr',
	name: 'Evan Hugues',
	givenName: 'Evan',
	familyName: 'Hugues',
	role: 'Technicien supérieur en informatique',
	headline: 'Technicien supérieur en informatique, cofondateur et CTO d’Artinova',
	location: 'Lyon',
	timeZone: 'Europe/Paris',
	description:
		'Technicien supérieur en informatique, cofondateur et CTO d’Artinova. Je conçois des applications web, des API et l’infrastructure qui les fait tourner.',
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
		text: 'J’écris surtout du TypeScript et du Rust, du Python pour les API et la data, et du SQL un peu partout. J’utilise aussi PHP, Java ou Dart quand un projet le demande.',
	},
	{
		domain: 'Back-end',
		text: 'Des API REST typées avec NestJS, FastAPI ou axum, des files de jobs avec BullMQ ou directement dans PostgreSQL, du temps réel en WebSocket, MQTT ou Redis, et des paiements dont les webhooks ne sont jamais traités deux fois.',
	},
	{
		domain: 'Front-end',
		text: 'Next.js et React pour les produits, Astro pour les sites rapides, Three.js et WebGL quand l’interface doit surprendre. Je vérifie l’accessibilité et la performance avant de livrer.',
	},
	{
		domain: 'Données',
		text: 'Surtout PostgreSQL, avec ses verrous, ses triggers et ses contraintes, via Prisma ou Drizzle. J’utilise aussi SQLite quand la base doit être embarquée, Redis et le stockage S3.',
	},
	{
		domain: 'Infra',
		text: 'AWS décrit en Terraform avec ECS Fargate, RDS et S3, des conteneurs Docker durcis derrière Caddy ou nginx, de la CI/CD sur GitHub Actions et GitLab, et de l’auto-hébergement sur VPS et sur mon homelab.',
	},
	{
		domain: 'Sécurité',
		text: 'Je m’entraîne en offensif sur Root-Me et Hack The Box. Au quotidien, ça donne des modèles de menace, du chiffrement, des CSP strictes, l’isolation des données entre clients et l’audit de mes propres projets.',
	},
] as const;
