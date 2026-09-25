---
title: Aramis
tagline: Préparation de commandes guidée à la voix, dans un entrepôt à −18 °C.
description: "Aramis, projet SAÉ pour un vrai commanditaire : picking guidé à la voix, palettisation 3D avec Three.js, Next.js 16, Drizzle et PostgreSQL, CI GitLab."
statement: "Des préparateurs en gants, dans le froid : l’interface devait se faire oublier."
tier: secondary
order: 5
year: 2026
period: 2025 — 2026
context: Projet universitaire (SAÉ 5), en équipe
role: Développement full-stack
stack: [Next.js 16, TypeScript, Drizzle ORM, PostgreSQL, Three.js, Web Speech API, Vitest, GitLab CI, Vercel]
languages: [TypeScript, SQL]
repo: "https://github.com/evanhgs/sae5-aramis"
links:
  - { label: Code source, href: "https://github.com/evanhgs/sae5-aramis" }
  - { label: Démo, href: "https://saearamis.vercel.app/" }
accent: "#7FD8FF"
cover: { motif: shelves, seed: 4 }
figures:
  - { value: "−18 °C", label: "entrepôt frigorifique, préparateurs en gants" }
  - { value: "3D", label: "palettisation avec rotations et gravité" }
  - { value: "30 s", label: "rafraîchissement du suivi en direct" }
gallery:
  - { src: "../../assets/projets/aramis/supervision.png", alt: "Tableau de bord superviseur d’Aramis : supports faits, colis prélevés, restants, manquants, statistiques par préparateur.", caption: "Le suivi superviseur, rafraîchi en continu." }
  - { src: "../../assets/projets/aramis/palette.png", alt: "Écran préparateur d’Aramis sur tablette : récapitulatif 3D de la palette constituée, avec un colis manquant en rouge.", caption: "Fin de support : la palette reconstituée en 3D." }
diagram:
  title: Architecture d’Aramis, de la tablette à la base
  cols: 3
  rows: 2
  nodes:
    - { id: supervisor, label: Superviseur, sub: import · affectation · suivi, kind: client, col: 1, row: 0 }
    - { id: wms, label: WMS, sub: exports CSV, kind: external, col: 2, row: 0 }
    - { id: picker, label: Tablette préparateur, sub: voix · vue 3D, kind: client, col: 0, row: 1 }
    - { id: app, label: Next.js 16, sub: pages + API, kind: service, col: 1, row: 1 }
    - { id: db, label: PostgreSQL, sub: Drizzle · Neon, kind: store, col: 2, row: 1 }
  edges:
    - { from: wms, to: supervisor, label: CSV }
    - { from: supervisor, to: app, label: supports }
    - { from: picker, to: app, label: valider · manquant }
    - { from: app, to: db, label: SQL }
---

## Le contexte

Projet de troisième année de BUT (SAÉ 5), mené en équipe pour un vrai commanditaire : la logistique d’un grand groupe de distribution. Dans un entrepôt frigorifique à −18 °C, les préparateurs traitent des palettes avec des gants épais. L’application devait se piloter à la voix et se lire d’un coup d’œil sur une tablette.

## Stack & infra

Next.js 16 et TypeScript, Drizzle ORM sur PostgreSQL (Neon en production), validation zod, authentification par code et JWT, Three.js pour la visualisation. Tests Vitest. La CI GitLab lance les tests contre un vrai PostgreSQL, puis déploie sur Vercel à chaque fusion sur la branche principale.

## Comment ça marche

Le superviseur importe les listes de préparation exportées du WMS au format CSV, les affecte aux préparateurs et suit l’activité en direct : avancement, stocks, produits manquants.

Le préparateur se connecte avec un code à trois chiffres, puis l’application le guide emplacement par emplacement (zone, allée, alvéole, niveau). Il valide ou signale un manquant à la voix ou d’un geste. En fin de support, une vue 3D montre la palette constituée.

## La difficulté

Deux points durs.

- **La reconnaissance vocale continue en français sur Android.** L’API du navigateur s’y arrête et redémarre de façon imprévisible ; il a fallu gérer ces courses au redémarrage sans perdre de commande.
- **La palettisation.** Un algorithme de bin-packing 3D range d’abord par étages et essaie les rotations des colis, puis une passe de « gravité » fait reposer chaque colis sur ce qu’il y a réellement dessous. Le rendu Three.js n’est chargé qu’à la demande.

## Ce que ça m’a apporté

Travailler en équipe pour un client réel, avec ses contraintes physiques : le froid, les gants, le bruit. Concevoir pour l’usage avant l’esthétique. Et rendre un algorithme géométrique compréhensible en une seconde.
