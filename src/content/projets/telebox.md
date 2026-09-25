---
title: Telebox
tagline: Mon premier produit complet, de la licence au paiement.
description: "Telebox, une application de bureau en Python avec CustomTkinter et Telethon, vendue sous licence grâce à un site Flask et Stripe. Mon premier produit complet."
statement: "Je n’ai vendu qu’une licence, mais j’ai appris d’un coup tout ce qu’il y a autour d’un logiciel."
tier: secondary
order: 9
year: 2023
context: Projet personnel, produit commercial
role: Conception, développement et produit
stack: [Python, CustomTkinter, Telethon, Flask, Stripe]
languages: [Python]
repo: "https://github.com/evanhgs/Telegram-scraper-adder-app"
links:
  - { label: Code source, href: "https://github.com/evanhgs/Telegram-scraper-adder-app" }
accent: "#3FB6FF"
cover: { motif: orbit, seed: 10 }
figures:
  - { value: "1", label: "licence vendue, à un parfait inconnu" }
  - { value: "1", label: "stage décroché grâce au projet" }
diagram:
  title: Architecture de Telebox
  cols: 2
  rows: 2
  nodes:
    - { id: app, label: Application de bureau, sub: CustomTkinter, kind: client, col: 0, row: 0 }
    - { id: tg, label: API Telegram, sub: Telethon, kind: external, col: 1, row: 0 }
    - { id: web, label: Site Flask, sub: licences · comptes, kind: service, col: 0, row: 1 }
    - { id: stripe, label: Stripe, sub: paiement, kind: external, col: 1, row: 1 }
  edges:
    - { from: app, to: tg, label: MTProto }
    - { from: app, to: web, label: vérification de licence }
    - { from: web, to: stripe, label: Checkout }
---

## Le contexte

À mes débuts, je faisais tout en Python. Autour de moi, des gens animaient des communautés Telegram avec beaucoup de membres, et l’API de Telegram permettait d’automatiser une partie de leur travail. J’en ai fait un produit, une application de bureau vendue sous licence.

## Stack & infra

L’application est écrite en Python, avec Telethon pour parler au protocole de Telegram et CustomTkinter pour une interface plus soignée que Tkinter. Côté web, un site Flask gère les clés de licence, les comptes et les paiements Stripe, et un second site sert de documentation.

## Comment ça marche

L’application gère plusieurs comptes Telegram et des proxys. Elle automatise la gestion des membres des groupes depuis une interface graphique, avec des délais aléatoires, en respectant les limites de débit imposées par Telegram. À chaque lancement, elle vérifie la licence auprès du site.

## La difficulté

Le plus dur a été de passer d’un script à un produit. Mes premiers scripts en ligne de commande n’étaient pas vendables en l’état. J’ai dû tout réorganiser en programmation orientée objet, séparer la logique métier de l’interface et ajouter des tests. Il a fallu ensuite construire tout ce qu’un logiciel payant demande autour, les licences, l’authentification, le paiement et le support.

## Ce que ça m’a apporté

J’ai passé plusieurs mois dessus pour une seule licence vendue, donc financièrement, c’est un échec. Mais j’y ai appris l’architecture d’une application, la monétisation et la relation avec les utilisateurs. C’est aussi ce projet, montré en entretien, qui m’a permis de décrocher mon stage dans une ESN lyonnaise. Le code est aujourd’hui open source.
