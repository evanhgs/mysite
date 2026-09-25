---
title: Artinova
tagline: Le logiciel des artisans du bâtiment, du premier appel au paiement.
description: "Artinova, le SaaS des artisans du bâtiment. Un monolithe modulaire en TypeScript avec NestJS, BullMQ et PostgreSQL, sur AWS avec Terraform."
statement: "Faire respecter les obligations légales par le logiciel lui-même, pour que l’artisan n’ait jamais à y penser."
tier: flagship
order: 1
year: 2026
period: Depuis 2026
context: Startup, cofondateur
role: CTO, en charge de l’architecture, du back-end et de l’infrastructure
status: En bêta, premier module le 5 octobre 2026
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
  title: Architecture d’Artinova, du navigateur aux services tiers
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

Un artisan du bâtiment, qu’il soit peintre, plombier, électricien ou menuisier, passe une bonne partie de ses soirées sur l’administratif. Il griffonne ses devis, oublie des relances et refait ses factures dans un tableur. Et la facture électronique devient obligatoire en France à partir de 2026.

Avec mon associé, on a d’abord écouté des artisans sur le terrain, avant d’écrire la moindre ligne de code. Artinova est né de ces échanges. C’est un seul outil qui suit le client du premier appel jusqu’au paiement, avec les fiches clients, les devis, les factures, les avoirs, les relances, les encaissements et un espace pour le comptable. Le planning des tournées arrive ensuite.

Je suis cofondateur et CTO. Je m’occupe de l’architecture, du back-end, de l’infrastructure et de la qualité, et je code tous les jours.

## Stack & infra

- **Un monolithe modulaire plutôt que des microservices.** On est une petite équipe, avec un seul langage du navigateur à la base de données et un monorepo Turborepo. Le linter vérifie les frontières entre modules, et les règles métier vivent dans un paquet `domain` sans framework. On y trouve l’argent en centimes entiers, les machines à états, la TVA et les droits d’accès.
- **Le front est en Next.js 16**, avec l’App Router, le React Compiler, TanStack Query et Tailwind. On peut l’installer comme une application en attendant la version mobile.
- **L’API tourne sur NestJS 12** et Express 5. Sa documentation OpenAPI est générée à partir des DTO, et le front s’appuie sur un SDK typé qui en découle.
- **Tout ce qui est lent ou dépend d’un tiers passe par une file BullMQ** sur Redis, comme les PDF, les e-mails, la facture électronique, les imports et les exports. Chaque file a sa dead-letter queue et un outil pour rejouer les jobs.
- **Côté données et services**, on utilise PostgreSQL 18 avec Prisma 7, S3 pour les documents, Clerk pour l’authentification, Stripe pour les abonnements, Resend pour les e-mails et Sentry pour suivre les erreurs.
- **L’infrastructure est sur AWS**, en région Paris, et entièrement décrite en Terraform. Le web, l’API et les workers tournent sur ECS Fargate, avec RDS PostgreSQL, ElastiCache, S3 et un load balancer. Je n’ai pas voulu de Kubernetes, pour ne rien avoir à exploiter de plus que nécessaire.
- **Pour livrer**, les quatre images sont construites en une seule passe avec Docker Bake. Le déploiement passe par GitHub Actions avec OIDC, sans aucune clé AWS longue durée. Les migrations ne tournent que quand le schéma change, et le disjoncteur d’ECS annule tout seul un mauvais déploiement. Le staging s’éteint la nuit pour ne pas payer des serveurs qui ne servent à personne.

## Comment ça marche

Le back-office appelle l’API en HTTPS avec un jeton de session. L’API valide les entrées, applique les règles du domaine et écrit en base dans des transactions courtes.

Tout ce qui peut échouer chez un tiers part dans une file. Un worker génère le PDF du devis ou de la facture sans jamais produire de doublon, calcule son empreinte SHA-256 et le dépose sur S3. Il enchaîne ensuite l’envoi de l’e-mail et le suivi de sa délivrance. Pour la facture électronique, les workers envoient les factures au format Factur-X ou UBL à une plateforme agréée par l’État, puis récupèrent les statuts et les factures reçues. Les webhooks qui arrivent du paiement, de l’authentification ou des e-mails sont vérifiés sur les octets exacts de la requête, puis dédoublonnés en base.

## La difficulté

Le droit fiscal ne se négocie pas, alors j’ai fait en sorte qu’on ne puisse pas le contourner, même à cause d’un bug.

- **Une facture finalisée ne peut plus changer.** Ce n’est pas une simple convention dans le code. Des triggers PostgreSQL refusent toute modification des factures finalisées, de leurs lignes, des paiements et du journal d’audit. Pour corriger une erreur, on émet un avoir, comme la loi le demande.
- **La numérotation légale se suit sans trou.** Le numéro n’est attribué qu’au moment de la finalisation, dans la même transaction et sous un verrou de ligne posé avec `SELECT … FOR UPDATE`. Un échec ne consomme jamais de numéro, et les avoirs ont leur propre séquence.
- **Le schéma garantit l’isolation entre entreprises.** Chaque table métier porte l’identifiant de l’entreprise, et des contraintes composées empêchent physiquement une référence croisée. Une suite de tests essaie en plus de lire les données d’un autre compte sur les routes de l’API.
- **La facture électronique passe par un port.** On a déjà changé une fois de fournisseur sans toucher au domaine. Les jetons d’accès sont chiffrés en AES-256-GCM, avec une rotation des clés sans interruption. Leur renouvellement est sérialisé, parce que deux rafraîchissements simultanés invalideraient la session.

## Ce que ça m’a apporté

- **Raisonner en invariants.** J’identifie ce qui ne doit jamais arriver et je le garantis au plus bas niveau possible, souvent dans la base de données, au lieu d’espérer que le code le respecte.
- **Écrire les décisions.** Chaque choix important a son ADR, ce qui permet de le remettre en question plus tard sans refaire toute l’enquête.
- **Une CI exigeante.** Les tests d’intégration tournent contre un vrai PostgreSQL. Sur les pull requests, seuls les tests concernés sont lancés pour garder un retour rapide, et la suite complète passe avant chaque fusion.
- **Le produit avant la technique.** Mes meilleures décisions d’architecture viennent des entretiens avec les artisans, comme penser au mobile d’abord ou ne jamais faire saisir deux fois la même information.
- **Le rôle de CTO.** Chaque semaine, il faut trouver l’équilibre entre aller vite et construire solide, avec un vrai produit, des utilisateurs en bêta et une date de lancement.
