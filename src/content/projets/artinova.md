---
title: Artinova
tagline: Le logiciel des artisans du bâtiment, du premier appel au paiement.
description: "Artinova, SaaS pour artisans du bâtiment : monolithe modulaire TypeScript, NestJS, BullMQ, PostgreSQL, AWS en Terraform. L’étude de cas du CTO."
statement: "Transformer des obligations légales en invariants techniques, pour que l’artisan n’ait jamais à y penser."
tier: flagship
order: 1
year: 2026
period: 2026 — aujourd’hui
context: Startup, cofondateur
role: CTO. Architecture, back-end, infrastructure
status: Bêta ; module 1 le 5 octobre 2026
stack: [TypeScript, Next.js 16, NestJS 12, BullMQ, PostgreSQL 18, Prisma 7, Redis, AWS, Terraform]
languages: [TypeScript, SQL, HCL]
links:
  - { label: artinova.fr, href: "https://www.artinova.fr/" }
  - { label: Documentation, href: "https://docs.artinova.fr/" }
  - { label: LinkedIn, href: "https://www.linkedin.com/company/artinovafr" }
accent: "#356EF7"
cover: { motif: lattice, seed: 7 }
figures:
  - { value: "≈ 460 000", label: "lignes de TypeScript, tests compris" }
  - { value: "270+", label: "routes d’API décrites en OpenAPI" }
  - { value: "11", label: "files de jobs, chacune avec sa dead-letter" }
  - { value: "40", label: "décisions d’architecture écrites (ADR)" }
diagram:
  title: Architecture d’Artinova, du navigateur aux tiers
  cols: 4
  rows: 3
  nodes:
    - { id: clerk, label: Clerk, sub: authentification, kind: external, col: 0, row: 0 }
    - { id: stripe, label: Stripe, sub: abonnements et sièges, kind: external, col: 2, row: 0 }
    - { id: pdp, label: Plateforme agréée, sub: facture électronique, kind: external, col: 3, row: 0 }
    - { id: web, label: Back-office, sub: Next.js 16 · PWA, kind: client, col: 0, row: 1 }
    - { id: api, label: API REST, sub: NestJS · OpenAPI, kind: service, col: 1, row: 1 }
    - { id: queue, label: Files de jobs, sub: BullMQ · Redis, kind: queue, col: 2, row: 1 }
    - { id: workers, label: Workers, sub: PDF · e-mails · e-facture, kind: worker, col: 3, row: 1 }
    - { id: db, label: PostgreSQL, sub: Prisma · triggers légaux, kind: store, col: 1, row: 2 }
    - { id: s3, label: S3, sub: PDF et archives, kind: store, col: 3, row: 2 }
  edges:
    - { from: clerk, to: web, label: session }
    - { from: web, to: api, label: HTTPS }
    - { from: api, to: db, label: transactions }
    - { from: api, to: queue, label: jobs, flow: async }
    - { from: queue, to: workers, flow: async }
    - { from: workers, to: pdp, label: Factur-X · UBL, flow: async }
    - { from: workers, to: s3, label: PDF signés }
    - { from: stripe, to: api, label: webhooks signés, flow: async }
---

## Le contexte

Un artisan du bâtiment, qu’il soit peintre, plombier, électricien ou menuisier, passe ses soirées sur l’administratif : devis griffonnés, relances oubliées, factures refaites dans un tableur. Et une réforme arrive : en France, la facture électronique devient obligatoire à partir de 2026.

Avec mon associé, on a commencé par écouter des artisans sur le terrain avant d’écrire une ligne de code. Artinova en est sorti : un seul outil qui suit le client du premier appel jusqu’au paiement. Fiches clients, devis, factures, avoirs, relances, encaissements, espace comptable, et bientôt le planning des tournées.

Je suis cofondateur et CTO. Je porte l’architecture, le back-end, l’infrastructure et la qualité, et je code tous les jours.

## Stack & infra

- **Un monolithe modulaire, pas des microservices.** Une petite équipe, un seul langage du navigateur à la base de données, un monorepo Turborepo. Les frontières entre modules sont vérifiées par le linter, et les règles métier vivent dans un paquet `domain` sans aucun framework : argent en centimes entiers, machines à états, TVA, droits d’accès.
- **Web :** Next.js 16 (App Router, React Compiler), TanStack Query, Tailwind. Installable en PWA en attendant l’application mobile.
- **API :** NestJS 12 sur Express 5, documentation OpenAPI générée depuis les DTO et SDK typé partagé avec le front.
- **Asynchrone :** BullMQ sur Redis. Tout ce qui est lent ou dépend d’un tiers passe en file : PDF, e-mails, facture électronique, imports, exports. Chaque file a sa dead-letter queue et un outil de rejeu.
- **Données et services :** PostgreSQL 18 avec Prisma 7, S3 pour les documents, Clerk pour l’authentification, Stripe pour les abonnements, Resend pour les e-mails transactionnels, Sentry pour les erreurs.
- **Infra :** AWS en région Paris, entièrement décrite en Terraform. ECS Fargate pour le web, l’API et les workers ; RDS PostgreSQL, ElastiCache, S3, un load balancer. Pas de Kubernetes : rien à opérer de plus que nécessaire.
- **Livraison :** les quatre images sont construites en une passe avec Docker Bake. Le déploiement passe par GitHub Actions et OIDC, donc aucune clé AWS longue durée. Les migrations tournent en tâche ponctuelle seulement quand le schéma change, et le disjoncteur d’ECS annule un mauvais déploiement tout seul. L’environnement de staging s’éteint la nuit : la facture cloud suit l’usage.

## Comment ça marche

Le back-office appelle l’API en HTTPS avec un jeton de session. L’API valide les entrées, applique les règles du domaine et écrit en base dans des transactions courtes.

Tout ce qui peut échouer chez un tiers est poussé dans une file. Un worker génère le PDF du devis ou de la facture (rendu idempotent, empreinte SHA-256, dépôt sur S3), puis enchaîne l’envoi de l’e-mail et le suivi de sa délivrance. Pour la facture électronique, les workers émettent au format Factur-X ou UBL vers une plateforme agréée par l’État, puis récupèrent les statuts et les factures reçues. Les webhooks entrants (paiement, authentification, e-mails) sont vérifiés sur les octets exacts de la requête et dédoublonnés en base.

## La difficulté

Le droit fiscal ne se négocie pas. Je l’ai donc rendu impossible à contourner, y compris par un bug.

- **Une facture finalisée est immuable.** Ce n’est pas une convention dans le code : des triggers PostgreSQL refusent toute modification des factures finalisées, de leurs lignes, des paiements et du journal d’audit. On corrige par un avoir, comme l’exige la loi.
- **La numérotation légale est continue, sans trou.** Le numéro n’est attribué qu’à la finalisation, dans la même transaction et sous verrou de ligne (`SELECT … FOR UPDATE`). Un échec ne consomme jamais de numéro, et les avoirs ont leur propre séquence.
- **Le multi-tenant est garanti par le schéma.** Chaque table métier porte l’identifiant de l’entreprise, des contraintes composées empêchent physiquement une référence croisée, et une suite de tests tente de lire les données d’un autre compte sur les routes de l’API.
- **La facture électronique passe par un port.** Le fournisseur a déjà changé une fois sans toucher au domaine. Ses jetons d’accès sont chiffrés en AES-256-GCM avec rotation des clés sans interruption, et leur renouvellement est sérialisé : deux rafraîchissements concurrents invalideraient la session.

## Ce que ça m’a apporté

- **Penser en invariants :** identifier ce qui ne doit jamais arriver et le garantir au niveau le plus bas possible, la base de données, plutôt que de l’espérer dans le code.
- **Écrire les décisions.** Chaque choix structurant a son ADR, ce qui permet de le remettre en question plus tard sans refaire toute l’enquête.
- **Une discipline de CI :** tests d’intégration contre un vrai PostgreSQL, sélection des tests impactés sur les pull requests pour garder un retour rapide, suite complète avant chaque fusion.
- **Le produit avant la technique.** Les meilleures décisions d’architecture sont venues des entretiens avec les artisans : le mobile d’abord, ne saisir chaque information qu’une seule fois.
- **Le métier de CTO :** arbitrer chaque semaine entre vitesse et solidité, avec un vrai produit, des utilisateurs en bêta et une date de lancement.
