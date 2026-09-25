---
title: Telebox
tagline: Mon premier produit complet, de la licence au paiement.
description: "Telebox, application de bureau Python (CustomTkinter, Telethon) et site Flask de licences avec paiements Stripe : mon premier produit de bout en bout."
statement: "Une seule licence vendue, et tout ce qu’il y a autour d’un logiciel appris d’un coup."
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

À mes débuts, je faisais tout en Python. Autour de moi, des personnes animaient des communautés Telegram et géraient beaucoup de membres ; l’API de Telegram permettait d’automatiser une partie de ce travail. J’en ai fait un produit : une application de bureau vendue sous licence.

## Stack & infra

Python, Telethon pour le protocole de Telegram, CustomTkinter pour une interface plus soignée que Tkinter. Côté web, un site Flask gère les clés de licence, les comptes et les paiements Stripe, complété par un site de documentation.

## Comment ça marche

L’application gère plusieurs comptes Telegram et des proxys, et automatise la gestion des membres de groupes depuis une interface graphique, avec des délais aléatoires et le respect des limites de débit imposées par Telegram. Au lancement, elle vérifie la licence auprès du site.

## La difficulté

Passer d’un script à un produit. Mes premiers scripts en ligne de commande n’étaient pas vendables : il a fallu tout refactoriser en programmation orientée objet, séparer la logique métier de l’interface, ajouter des tests, puis construire autour tout ce qu’un logiciel payant exige : licences, authentification, paiement, support.

## Ce que ça m’a apporté

Plusieurs mois de travail pour une seule licence vendue : financièrement, un échec. Mais tout le reste y était : l’architecture, la monétisation, la relation avec l’utilisateur. C’est ce projet, montré en entretien, qui m’a valu mon stage dans une ESN lyonnaise. Le code est aujourd’hui open source.
