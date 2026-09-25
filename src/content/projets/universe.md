---
title: Universe
tagline: Une marketplace pour publier, écouter et vendre des beats sous licence.
description: "Universe, une marketplace musicale en Next.js 16, avec un worker audio en Rust branché sur une file PostgreSQL, des uploads S3 pré-signés et Stripe."
statement: "Le site web et le worker Rust ne s’appellent jamais directement. C’est la base de données et le stockage qui font le lien."
tier: main
order: 2
year: 2026
context: Projet personnel
role: Conception et développement de bout en bout
stack: [Next.js 16, TypeScript, Rust, Python, PostgreSQL 18, Prisma 7, Redis, S3, Stripe, Docker, Caddy]
languages: [TypeScript, Rust, Python, SQL]
repo: "https://github.com/evanhgs/universe"
links:
  - { label: Code source, href: "https://github.com/evanhgs/universe" }
accent: "#8B6CFF"
cover: { motif: moire, seed: 3 }
figures:
  - { value: "3", label: "services écrits dans trois langages" }
  - { value: "39", label: "modèles de données" }
  - { value: "0", label: "appel HTTP entre le site et le worker" }
  - { value: "1", label: "transaction pour publier un extrait" }
diagram:
  title: Architecture d’Universe, du navigateur au worker audio
  cols: 4
  rows: 3
  nodes:
    - { id: clerk, label: Clerk, sub: authentification, kind: external, col: 0, row: 0 }
    - { id: stripe, label: Stripe, sub: Checkout · webhooks, kind: external, col: 1, row: 0 }
    - { id: browser, label: Navigateur, sub: vendeur ou acheteur, kind: client, col: 0, row: 1 }
    - { id: next, label: Next.js 16, sub: pages · API · webhooks, kind: service, col: 1, row: 1 }
    - { id: pg, label: PostgreSQL, sub: métier et file de jobs, kind: store, col: 2, row: 1 }
    - { id: worker, label: Worker Rust, sub: ffprobe · ffmpeg, kind: worker, col: 3, row: 1 }
    - { id: s3, label: Stockage S3, sub: sources privées, extraits, kind: store, col: 2, row: 2 }
  edges:
    - { from: clerk, to: browser, label: session }
    - { from: browser, to: next, label: HTTPS }
    - { from: stripe, to: next, label: paiement confirmé, flow: async }
    - { from: next, to: pg, label: Prisma }
    - { from: worker, to: pg, label: SKIP LOCKED, flow: async }
    - { from: browser, to: s3, label: URL pré-signées, both: true }
    - { from: worker, to: s3, label: source → extrait }
---

## Le contexte

Les beatmakers vendent leurs instrumentales sur des sites éparpillés, gèrent les licences à la main et ont du mal à se faire découvrir. Universe regroupe tout au même endroit. On y publie un beat avec ses licences, l’extrait audio se génère tout seul, et l’acheteur paie puis télécharge son fichier de façon protégée. Il y a aussi une messagerie entre acheteur et vendeur, un fil court pour découvrir de nouveaux sons et des recommandations.

C’est un projet personnel que j’ai mené de bout en bout, du cahier des charges jusqu’au déploiement.

## Stack & infra

- **Next.js 16 et TypeScript** pour le site, les API et les webhooks, avec **Prisma 7** sur PostgreSQL 18.
- **Un worker en Rust**, écrit avec tokio et sqlx, s’occupe de l’audio. ffprobe mesure les fichiers, ffmpeg les découpe et les encode.
- **Un service FastAPI en Python** est réservé aux futures fonctions d’IA. Il reste isolé derrière une clé d’API.
- **Redis** sert au rate limiting, Clerk à l’authentification, Stripe Checkout aux paiements, Resend aux e-mails et Sentry au suivi des erreurs.
- **Le tout tourne sur un VPS** avec Docker Compose durci. Les conteneurs ont un système de fichiers en lecture seule, aucune capability et l’option `no-new-privileges`. Caddy est en frontal pour le HTTPS, la compression, HSTS et les en-têtes de sécurité, et le stockage compatible S3 est auto-hébergé.
- **GitHub Actions** teste les trois langages sur chaque pull request, avec des actions épinglées par SHA, puis déploie par SSH.

J’ai choisi un VPS plutôt qu’une plateforme serverless parce que le traitement audio a besoin de ffmpeg, de disque temporaire et de CPU à coût fixe.

## Comment ça marche

Un fichier audio ne passe jamais par le serveur web. Next.js vérifie que l’utilisateur est bien vendeur, génère une clé d’objet imprévisible et renvoie une URL S3 pré-signée. Le navigateur dépose ensuite le fichier directement dans le bucket.

À la publication, Next.js crée le beat et un job de traitement dans PostgreSQL. Le worker Rust interroge la table et réserve un job avec `SELECT … FOR UPDATE SKIP LOCKED`, ce qui permet de lancer plusieurs workers sans qu’ils se marchent dessus. Il télécharge la source par une URL signée, mesure sa durée, génère un extrait MP3 avec des fondus et le dépose sur S3. Tout passe ensuite à l’état « prêt » dans une seule transaction.

Au moment de l’achat, une session Stripe Checkout est créée. Quand le webhook arrive, il est vérifié, la commande passe en payée et le droit d’accès est créé. Le téléchargement ne donne qu’une URL signée de courte durée, après avoir contrôlé l’expiration et le nombre de téléchargements restants.

## La difficulté

- **Découpler sans broker.** Je n’ai utilisé ni RabbitMQ ni Kafka, la file est une simple table PostgreSQL. `SKIP LOCKED` gère la concurrence, et un compteur de tentatives associé à un verrou nominatif permet de reprendre le travail après un crash.
- **Signer les requêtes S3 à la main.** J’ai implémenté la signature AWS SigV4 en Rust plutôt que d’embarquer un SDK complet pour deux opérations.
- **Rendre ffmpeg sûr.** La taille des téléchargements est limitée, le disque temporaire est en tmpfs et chaque étape a un délai maximum. Un fichier piégé ne doit pas pouvoir faire tomber la machine.
- **Auditer mon propre code.** J’ai passé le projet au crible, de l’idempotence des webhooks de paiement à la redirection ouverte, en passant par l’authentification du service IA et le déni de service du worker, et j’ai corrigé chaque point. Le rate limiting est atomique grâce à un script Lua exécuté par Redis.

## Ce que ça m’a apporté

- J’ai appris à choisir un langage par service au lieu d’un seul pour tout. TypeScript sert au produit, Rust au calcul et à la fiabilité, et Python à l’écosystème IA.
- Construire des traitements asynchrones fiables avec ce qu’on a déjà, ici PostgreSQL, avant d’ajouter une nouvelle brique d’infrastructure.
- Faire tourner une vraie production auto-hébergée, avec des conteneurs durcis, un proxy et une chaîne CI/CD.
- Garder des recommandations explicables. Elles reposent sur un profil de goût pondéré par genre, tags, humeur, tonalité et tempo, et pas sur une boîte noire.
