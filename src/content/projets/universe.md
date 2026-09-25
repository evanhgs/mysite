---
title: Universe
tagline: Marketplace de beats. Publier, prévisualiser, vendre sous licence.
description: "Universe, marketplace musicale : Next.js 16, worker audio en Rust sur une file PostgreSQL, uploads S3 pré-signés, Stripe. Architecture et choix d’infra."
statement: "Un site web et un worker Rust qui ne s’appellent jamais : la base de données et le stockage font le lien."
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
  - { value: "3", label: "services : Next.js, worker Rust, FastAPI" }
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
    - { id: pg, label: PostgreSQL, sub: métier + file de jobs, kind: store, col: 2, row: 1 }
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

Les beatmakers vendent leurs instrumentales sur des places de marché éparpillées, gèrent les licences à la main et peinent à être découverts. Universe réunit tout : publication d’un beat avec ses licences, extrait audio généré automatiquement, achat, téléchargement protégé, messagerie entre acheteur et vendeur, un fil court pour découvrir, et des recommandations.

C’est un projet personnel mené de bout en bout, du cahier des charges au déploiement.

## Stack & infra

- **Next.js 16** et TypeScript pour le site, les API et les webhooks ; **Prisma 7** sur PostgreSQL 18.
- **Un worker en Rust** (tokio, sqlx) pour l’audio : ffprobe mesure, ffmpeg découpe et encode.
- **Un service FastAPI** (Python) réservé aux futures fonctions d’IA, isolé derrière une clé d’API.
- **Redis** pour le rate limiting, Clerk pour l’authentification, Stripe Checkout pour les paiements, Resend pour les e-mails, Sentry pour les erreurs.
- **Infra :** un VPS avec Docker Compose durci (système de fichiers en lecture seule, toutes les capabilities retirées, `no-new-privileges`), Caddy en frontal (HTTPS, compression, HSTS, en-têtes de sécurité) et un stockage compatible S3 auto-hébergé.
- **CI/CD :** GitHub Actions teste les trois langages sur chaque pull request, avec des actions épinglées par SHA, puis déploie par SSH.

Pourquoi un VPS plutôt qu’une plateforme serverless : le traitement audio demande ffmpeg, du disque temporaire et du CPU à coût fixe.

## Comment ça marche

Un fichier audio ne transite jamais par le serveur web. Next.js vérifie le rôle vendeur, génère une clé d’objet imprévisible et renvoie une URL S3 pré-signée ; le navigateur dépose le fichier directement dans le bucket.

À la publication, Next.js crée le beat et un job de traitement dans PostgreSQL. Le worker Rust interroge la table, réserve un job avec `SELECT … FOR UPDATE SKIP LOCKED` (plusieurs workers peuvent tourner sans se marcher dessus), télécharge la source par une URL signée, mesure sa durée, génère un extrait MP3 avec fondus, le dépose sur S3, puis passe tout à « prêt » dans une seule transaction.

À l’achat : session Stripe Checkout, webhook vérifié, commande payée, droit d’accès créé. Le téléchargement ne délivre qu’une URL signée de courte durée, après contrôle de l’expiration et du nombre de téléchargements restants.

## La difficulté

- **Découpler sans broker.** Pas de RabbitMQ ni de Kafka : la file est une table PostgreSQL. `SKIP LOCKED` apporte la concurrence ; un compteur de tentatives et un verrou nominatif permettent la reprise après un crash.
- **Signer S3 à la main.** J’ai implémenté la signature AWS SigV4 en Rust plutôt que d’embarquer un SDK complet pour deux opérations.
- **Rendre ffmpeg sûr.** Taille maximale des téléchargements, disque temporaire en tmpfs, délais : un fichier piégé ne doit pas faire tomber la machine.
- **Auditer mon propre code.** J’ai passé le projet au crible (idempotence des webhooks de paiement, redirection ouverte, authentification du service IA, déni de service du worker) et corrigé chaque point. Le rate limiting est atomique grâce à un script Lua exécuté par Redis.

## Ce que ça m’a apporté

- Choisir le bon langage par service plutôt qu’un langage pour tout : TypeScript pour le produit, Rust pour le calcul et la fiabilité, Python pour l’écosystème IA.
- Construire des flux asynchrones fiables avec ce qu’on a déjà (PostgreSQL) avant d’ajouter une brique d’infrastructure.
- Exploiter une vraie production auto-hébergée : conteneurs durcis, proxy, CI/CD.
- Garder une recommandation explicable : un profil de goût pondéré (genres, tags, humeur, tonalité, tempo) plutôt qu’une boîte noire.
