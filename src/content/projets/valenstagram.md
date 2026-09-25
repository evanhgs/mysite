---
title: Valenstagram
tagline: Un Instagram pour Valence, avec une messagerie en temps réel.
description: "Valenstagram, un réseau social inspiré d’Instagram. Une API FastAPI sur PostgreSQL, un front Next.js et des messages privés en temps réel avec MQTT."
statement: "J’ai refait ce projet deux fois, et c’est lui qui m’a appris à penser une architecture avant de coder."
tier: main
order: 3
year: 2025
period: De 2024 à 2025
context: Projet personnel, IUT de Valence
role: Conception et développement de l’API, du front et du déploiement
stack: [FastAPI, Python, SQLAlchemy 2, Alembic, PostgreSQL, MQTT, Next.js, Docker]
languages: [Python, TypeScript, SQL]
repo: "https://github.com/evanhgs/val-api"
links:
  - { label: "Code source de l’API", href: "https://github.com/evanhgs/val-api" }
  - { label: "Code source de l’application", href: "https://github.com/evanhgs/val-webapp" }
accent: "#FF5C8A"
cover: { motif: bulge, seed: 5 }
figures:
  - { value: "2", label: "refontes, de Flask à FastAPI et de React à Next.js" }
  - { value: "36", label: "tests d’API automatisés" }
  - { value: "QoS 1", label: "pour la livraison des messages MQTT" }
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

Je voulais apprendre à concevoir une API et une application web moderne sur un vrai sujet, alors j’ai recréé Instagram, version Valence. On y retrouve les publications photo, les likes, les commentaires, les abonnements, les profils, un explorateur, les stories et des messages privés en temps réel.

Je l’ai mené seul, en plusieurs versions, pour la communauté de l’IUT de Valence.

## Stack & infra

- **L’API est en FastAPI**, avec SQLAlchemy 2 et Alembic sur PostgreSQL. L’authentification passe par des jetons JWT et les mots de passe sont hachés en argon2. Pillow traite les images, et la documentation OpenAPI est générée automatiquement.
- **Le temps réel repose sur un broker MQTT**, Eclipse Mosquitto. L’API et les navigateurs le partagent grâce à MQTT sur WebSocket.
- **Le front est en Next.js** avec Tailwind.
- **En production**, tout tourne avec Docker Compose. La base est sur un réseau interne isolé et chaque service a son healthcheck. L’image de l’API est publiée sur Docker Hub à chaque nouvelle version, et le front est redéployé sur mon serveur par SSH.
- **La CI** lance pylint, une analyse CodeQL chaque semaine et les tests pytest sur une base dédiée.

## Comment ça marche

Le front consomme une API REST découpée par ressource, avec l’authentification, les utilisateurs, les abonnements, les publications, les likes, les commentaires et les messages.

Quand on envoie un message privé, l’API l’enregistre en base et crée la conversation si c’est le premier échange. Elle le publie ensuite sur le topic MQTT de la conversation avec une qualité de service de niveau 1, qui garantit au moins une livraison. Le navigateur, abonné en WebSocket, l’affiche aussitôt. L’API surveille aussi sa propre connexion au broker et la signale dans son healthcheck.

## La difficulté

La première version n’était qu’un prototype en Flask. Les routes étaient mal découpées, les utilisateurs, les publications et les commentaires étaient mal typés, et l’authentification côté front était fragile.

Plutôt que d’empiler les correctifs, j’ai réécrit l’API en FastAPI, avec une validation Pydantic de bout en bout, des schémas de réponse explicites et une documentation générée. J’ai ensuite refait le front, en passant de React à Next.js pour le routage et le rendu côté serveur.

Pour le temps réel, j’ai préféré MQTT à un serveur WebSocket fait maison, parce que le broker gère déjà la diffusion, la reconnexion et la garantie de livraison. Avec le recul, j’isolerais davantage l’accès au broker depuis le navigateur, avec des identifiants propres à chaque utilisateur et délivrés par l’API.

## Ce que ça m’a apporté

- Une vraie méthode pour concevoir une API, avec des ressources claires, les bons statuts HTTP, de la validation et du versionnage.
- Savoir quand il vaut mieux réécrire que rafistoler, et le faire sans tout casser.
- Mes premiers pipelines CI/CD complets, du tag Git jusqu’à l’image publiée et au déploiement.
- La conviction qu’une bonne architecture se pense avant d’écrire le code.
