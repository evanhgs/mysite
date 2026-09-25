---
title: RMCE
tagline: Strava, mais pour les voitures.
description: "RMCE, app Flutter de chronos et de classements automobiles : services Rust (axum, sqlx), positions des amis en temps réel via WebSocket et Redis pub/sub."
statement: "Chaque ami est un canal : la carte se met à jour sans que le serveur garde qui que ce soit en mémoire."
tier: secondary
order: 6
year: 2025
context: Projet personnel
role: Conception et développement (API, temps réel, application)
stack: [Rust, axum 0.8, sqlx, PostgreSQL, Redis, Flutter, Dart, Docker, GitHub Actions]
languages: [Rust, Dart, SQL]
repo: "https://github.com/evanhgs/rust-rmce-api"
links:
  - { label: "API : code source", href: "https://github.com/evanhgs/rust-rmce-api" }
  - { label: "Application : code source", href: "https://github.com/evanhgs/rmce_app" }
accent: "#FFD23F"
cover: { motif: speed, seed: 6 }
figures:
  - { value: "2 s", label: "entre deux positions partagées" }
  - { value: "30 s", label: "de vie pour une dernière position connue" }
  - { value: "22", label: "tests Rust, clippy strict et cargo audit en CI" }
diagram:
  title: Architecture de RMCE, API et service temps réel
  cols: 3
  rows: 2
  nodes:
    - { id: geo, label: Service géo, sub: WebSocket · sans état, kind: service, col: 1, row: 0 }
    - { id: redis, label: Redis, sub: pub/sub · SET EX 30 s, kind: queue, col: 2, row: 0 }
    - { id: app, label: App Flutter, sub: GPS · force G, kind: client, col: 0, row: 1 }
    - { id: api, label: API REST, sub: axum · JWT, kind: service, col: 1, row: 1 }
    - { id: pg, label: PostgreSQL, sub: trajets GeoJSON · scores, kind: store, col: 2, row: 1 }
  edges:
    - { from: app, to: api, label: REST }
    - { from: api, to: pg, label: sqlx }
    - { from: app, to: geo, label: positions, flow: stream, both: true }
    - { from: geo, to: redis, label: PUBLISH · SUBSCRIBE, flow: stream, both: true }
    - { from: geo, to: api, label: liste d’amis }
---

## Le contexte

L’esprit de Strava appliqué à la conduite : enregistrer ses trajets, chronométrer des parcours, se comparer au classement, lancer des défis et voir ses amis en direct sur une carte. Un projet personnel, pensé mobile d’abord.

## Stack & infra

Un workspace Rust en trois crates : l’API (axum 0.8, sqlx sur PostgreSQL, JWT, bcrypt), un service géo dédié au temps réel, et une crate partagée pour l’authentification et les modèles. Redis diffuse les positions. L’application est en Flutter : cartes, GPS, capteurs pour la force G, modèle 3D de la voiture.

Chaque service a son image Docker multi-étapes, déployée sur mon serveur. La CI GitHub Actions lance les migrations, clippy en mode strict, les tests unitaires et d’intégration sur de vrais PostgreSQL et Redis, puis `cargo audit`.

## Comment ça marche

Les trajets sont stockés en GeoJSON dans une colonne JSONB ; l’API calcule scores et classements. Pour la carte en direct, l’application ouvre une WebSocket vers le service géo et envoie sa position toutes les deux secondes.

Le service vérifie le jeton, récupère la liste d’amis auprès de l’API, puis ouvre une connexion pub/sub Redis abonnée au canal de chaque ami. Chaque position reçue est publiée sur le canal de l’utilisateur et gardée 30 secondes comme dernière position connue.

## La difficulté

Faire le pont entre deux mondes asynchrones : les messages Redis d’un côté, la WebSocket du client de l’autre, sans bloquer ni laisser de tâche orpheline quand la connexion tombe. La solution tient dans un canal broadcast tokio entre une tâche d’abonnement et une tâche d’envoi. Le service reste sans état : on peut en lancer plusieurs.

## Ce que ça m’a apporté

L’asynchrone en Rust en conditions réelles, le découpage d’un back-end en services autour d’une crate partagée, et une CI assez stricte pour refuser tout code qui n’est pas propre.
