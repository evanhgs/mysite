---
title: Valenstagram
tagline: Un Instagram pour Valence, avec messagerie en temps réel.
description: "Valenstagram, réseau social façon Instagram : API FastAPI, PostgreSQL, front Next.js, messages privés en temps réel via MQTT. Deux refontes et une CI/CD."
statement: "Deux refontes assumées : c’est le projet qui m’a appris qu’une architecture se pense avant de coder."
tier: main
order: 3
year: 2025
period: 2024 — 2025
context: Projet personnel, IUT de Valence
role: Conception et développement (API, front, déploiement)
stack: [FastAPI, Python, SQLAlchemy 2, Alembic, PostgreSQL, MQTT, Next.js, Docker]
languages: [Python, TypeScript, SQL]
repo: "https://github.com/evanhgs/val-api"
links:
  - { label: "API : code source", href: "https://github.com/evanhgs/val-api" }
  - { label: "Application : code source", href: "https://github.com/evanhgs/val-webapp" }
accent: "#FF5C8A"
cover: { motif: bulge, seed: 5 }
figures:
  - { value: "2", label: "refontes : Flask → FastAPI, React → Next.js" }
  - { value: "36", label: "tests d’API automatisés" }
  - { value: "QoS 1", label: "livraison des messages via MQTT" }
  - { value: "5 mois", label: "en parallèle du stage et des cours" }
diagram:
  title: Architecture de Valenstagram, API REST et temps réel
  cols: 3
  rows: 2
  nodes:
    - { id: broker, label: Mosquitto, sub: MQTT sur WebSocket, kind: queue, col: 1, row: 0 }
    - { id: browser, label: Application, sub: Next.js, kind: client, col: 0, row: 1 }
    - { id: api, label: API FastAPI, sub: REST · JWT · argon2, kind: service, col: 1, row: 1 }
    - { id: pg, label: PostgreSQL, sub: SQLAlchemy · Alembic, kind: store, col: 2, row: 1 }
  edges:
    - { from: browser, to: api, label: REST }
    - { from: api, to: pg, label: SQL }
    - { from: api, to: broker, label: publication, flow: async }
    - { from: broker, to: browser, label: abonnement, flow: stream }
---

## Le contexte

Tout est parti d’une envie d’apprendre la conception d’API et les applications web modernes sur un vrai sujet : recréer Instagram, version Valence. Publications photo, likes, commentaires, abonnements, profils, explorateur, stories et messages privés en temps réel.

Je l’ai mené seul, sur plusieurs versions, pour la communauté de l’IUT de Valence.

## Stack & infra

- **API :** FastAPI (Python), SQLAlchemy 2 et Alembic sur PostgreSQL, authentification JWT avec mots de passe hachés en argon2, Pillow pour les images. La documentation OpenAPI est générée automatiquement.
- **Temps réel :** un broker MQTT (Eclipse Mosquitto), partagé par l’API et les navigateurs grâce à MQTT sur WebSocket.
- **Front :** Next.js et Tailwind.
- **Infra :** Docker Compose de production, avec la base sur un réseau interne isolé et des healthchecks. L’image de l’API est publiée sur Docker Hub à chaque tag de version, et le front est redéployé sur mon serveur par SSH.
- **CI :** pylint, analyse CodeQL chaque semaine, tests pytest contre une base dédiée.

## Comment ça marche

Le front consomme une API REST découpée par ressource : authentification, utilisateurs, abonnements, publications, likes, commentaires, messages.

Pour un message privé, l’API l’enregistre en base (en créant la conversation au premier échange), puis le publie sur le topic MQTT de la conversation avec une qualité de service 1 : au moins une livraison. Le navigateur, abonné en WebSocket, l’affiche aussitôt. L’API surveille sa propre connexion au broker et la remonte dans son healthcheck.

## La difficulté

La première version n’était qu’un prototype : Flask, des routes mal découpées, un typage flou des utilisateurs, publications et commentaires, et une authentification fragile côté front.

Plutôt que d’empiler des correctifs, j’ai réécrit l’API en FastAPI : validation Pydantic de bout en bout, schémas de réponse explicites, documentation générée. Puis le front, de React vers Next.js, pour le routage et le rendu serveur.

Pour le temps réel, j’ai choisi MQTT plutôt qu’un serveur WebSocket maison : le broker gère la diffusion, la reconnexion et la garantie de livraison. Avec le recul, j’isolerais davantage l’accès au broker côté navigateur, avec des identifiants par utilisateur émis par l’API.

## Ce que ça m’a apporté

- Une vraie méthode de conception d’API : ressources, statuts HTTP, validation, versions.
- Savoir quand réécrire plutôt que rafistoler, et le faire sans tout casser.
- Mes premiers pipelines CI/CD complets, du tag Git à l’image publiée et au déploiement.
- La conviction qu’une bonne architecture se pense avant de coder.
