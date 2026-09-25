---
title: Aramis
tagline: La préparation de commandes guidée à la voix, dans un entrepôt à −18 °C.
description: "Aramis, un projet universitaire pour un vrai client. Préparation de commandes guidée à la voix et palette en 3D avec Three.js, sur Next.js 16 et PostgreSQL."
statement: "Les préparateurs travaillent avec des gants, dans le froid. L’interface devait se faire oublier."
tier: secondary
order: 5
year: 2026
period: De 2025 à 2026
context: Projet universitaire en équipe, SAÉ 5
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
  - { value: "−18 °C", label: "dans l’entrepôt, où l’on travaille en gants" }
  - { value: "3D", label: "palettisation avec rotations et gravité" }
  - { value: "30 s", label: "entre deux mises à jour du suivi" }
gallery:
  - { src: "../../assets/projets/aramis/supervision.png", alt: "Tableau de bord superviseur d’Aramis, avec les supports terminés, les colis prélevés, restants et manquants, et les statistiques par préparateur.", caption: "Le suivi du superviseur, mis à jour en continu." }
  - { src: "../../assets/projets/aramis/palette.png", alt: "Écran préparateur d’Aramis sur tablette, avec le récapitulatif en 3D de la palette constituée et un colis manquant en rouge.", caption: "En fin de support, la palette reconstituée en 3D." }
diagram:
  title: Architecture d’Aramis, de la tablette à la base
  cols: 3
  rows: 2
  nodes:
    - { id: supervisor, label: Superviseur, sub: import · affectation · suivi, kind: client, col: 1, row: 0 }
    - { id: wms, label: WMS, sub: exports CSV, kind: external, col: 2, row: 0 }
    - { id: picker, label: Tablette préparateur, sub: voix · vue 3D, kind: client, col: 0, row: 1 }
    - { id: app, label: Next.js 16, sub: pages et API, kind: service, col: 1, row: 1 }
    - { id: db, label: PostgreSQL, sub: Drizzle · Neon, kind: store, col: 2, row: 1 }
  edges:
    - { from: wms, to: supervisor, label: CSV }
    - { from: supervisor, to: app, label: supports }
    - { from: picker, to: app, label: valider · manquant }
    - { from: app, to: db, label: SQL }
---

## Le contexte

C’est le projet de troisième année de BUT, la SAÉ 5, que nous avons mené en équipe pour un vrai commanditaire, le service logistique d’un grand groupe de distribution. Dans un entrepôt frigorifique à −18 °C, les préparateurs manipulent des palettes avec des gants épais. L’application devait donc se piloter à la voix et se lire d’un coup d’œil sur une tablette.

## Stack & infra

L’application est construite avec Next.js 16 et TypeScript, Drizzle ORM sur PostgreSQL, hébergé chez Neon en production, zod pour la validation et Three.js pour la visualisation. Les préparateurs se connectent avec un code, et la session repose sur un jeton JWT. Les tests sont écrits avec Vitest. La CI GitLab les lance contre un vrai PostgreSQL, puis déploie sur Vercel à chaque fusion sur la branche principale.

## Comment ça marche

Le superviseur importe les listes de préparation exportées du WMS en CSV, les attribue aux préparateurs et suit l’activité en direct, avec l’avancement, les stocks et les produits manquants.

Le préparateur se connecte avec un code à trois chiffres. L’application le guide ensuite d’emplacement en emplacement, en indiquant la zone, l’allée, l’alvéole et le niveau. Il valide chaque prélèvement ou signale un produit manquant à la voix ou d’un geste. À la fin du support, une vue 3D lui montre la palette qu’il vient de constituer.

## La difficulté

Deux points nous ont donné du fil à retordre.

- **La reconnaissance vocale continue en français sur Android.** L’API du navigateur s’y arrête et redémarre de façon imprévisible. Il a fallu gérer ces redémarrages sans jamais perdre une commande vocale.
- **La palettisation.** Un algorithme de bin-packing en 3D range d’abord les colis par étages en essayant leurs différentes rotations. Une passe de « gravité » fait ensuite reposer chaque colis sur ce qui se trouve vraiment en dessous. Le rendu Three.js n’est chargé que lorsqu’on en a besoin.

## Ce que ça m’a apporté

J’ai appris à travailler en équipe pour un client réel, avec des contraintes physiques très concrètes comme le froid, les gants et le bruit. Ce projet m’a appris à concevoir pour l’usage avant de penser à l’esthétique, et à rendre un algorithme géométrique compréhensible en un coup d’œil.
