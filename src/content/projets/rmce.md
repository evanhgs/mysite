---
title: RMCE
tagline: L’idée de Strava, appliquée à la conduite automobile.
description: "RMCE, une app Flutter de chronos et de classements automobiles, avec des services en Rust et les positions des amis en direct via WebSocket et Redis."
statement: "Chaque ami a son canal. La carte se met à jour sans que le serveur ait besoin de garder qui que ce soit en mémoire."
tier: secondary
order: 6
year: 2025
context: Projet personnel
role: Conception et développement de l’API, du temps réel et de l’application
stack: [Rust, axum 0.8, sqlx, PostgreSQL, Redis, Flutter, Dart, Docker, GitHub Actions]
languages: [Rust, Dart, SQL]
repo: "https://github.com/evanhgs/rust-rmce-api"
links:
  - { label: "Code source de l’API", href: "https://github.com/evanhgs/rust-rmce-api" }
  - { label: "Code source de l’application", href: "https://github.com/evanhgs/rmce_app" }
accent: "#FFD23F"
cover: { motif: speed, seed: 6 }
figures:
  - { value: "2 s", label: "entre deux positions partagées" }
  - { value: "30 s", label: "de vie pour une dernière position connue" }
  - { value: "22", label: "tests Rust, avec clippy strict et cargo audit en CI" }
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

RMCE reprend l’esprit de Strava pour la conduite. On enregistre ses trajets, on chronomètre des parcours, on se compare au classement, on lance des défis et on voit ses amis en direct sur une carte. C’est un projet personnel, pensé d’abord pour le mobile.

## Stack & infra

Le back-end est un workspace Rust en trois crates. La première contient l’API, écrite avec axum 0.8 et sqlx sur PostgreSQL, avec des jetons JWT et des mots de passe hachés en bcrypt. La deuxième est un service géographique dédié au temps réel, et la troisième regroupe l’authentification et les modèles partagés. Redis diffuse les positions. L’application est en Flutter et utilise les cartes, le GPS, les capteurs pour mesurer la force G et un modèle 3D de la voiture.

Chaque service a son image Docker multi-étapes, déployée sur mon serveur. La CI GitHub Actions lance les migrations, clippy en mode strict, les tests unitaires et d’intégration sur de vrais PostgreSQL et Redis, puis `cargo audit`.

## Comment ça marche

Les trajets sont stockés en GeoJSON dans une colonne JSONB, et l’API calcule les scores et les classements. Pour la carte en direct, l’application ouvre une WebSocket vers le service géographique et envoie sa position toutes les deux secondes.

Le service vérifie le jeton et demande la liste d’amis à l’API. Il ouvre ensuite une connexion Redis abonnée au canal de chaque ami. Chaque position reçue est publiée sur le canal de l’utilisateur et gardée 30 secondes comme dernière position connue.

## La difficulté

Il fallait faire communiquer deux mondes asynchrones, les messages Redis d’un côté et la WebSocket du client de l’autre, sans rien bloquer et sans laisser de tâche orpheline quand la connexion tombe. J’ai résolu ça avec un canal broadcast de tokio entre une tâche qui s’abonne et une tâche qui envoie. Le service ne garde aucun état, ce qui permet d’en lancer plusieurs.

## Ce que ça m’a apporté

J’ai pratiqué l’asynchrone en Rust sur un cas réel et appris à découper un back-end en services autour d’une crate partagée. J’ai aussi mis en place une CI assez stricte pour refuser tout code qui n’est pas propre.
