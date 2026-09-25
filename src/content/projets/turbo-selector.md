---
title: Turbo Selector
tagline: Les 8 meilleures équipes NBA possibles, en moins de 500 ms.
description: "Turbo Selector, API FastAPI d’optimisation combinatoire en programmation linéaire (PuLP, CBC) : de plus de 3 s à moins de 500 ms, avec un résultat optimal."
statement: "Un collègue attendait trois secondes par requête. J’ai remplacé les heuristiques par des mathématiques."
tier: secondary
order: 7
year: 2024
context: Projet personnel, pour un collègue d’alternance
role: Conception et développement
stack: [Python, FastAPI, PuLP, CBC, Pydantic, Docker, nginx]
languages: [Python]
repo: "https://github.com/evanhgs/sorare-selector"
links:
  - { label: Code source, href: "https://github.com/evanhgs/sorare-selector" }
accent: "#FF8A1F"
cover: { motif: dots, seed: 8 }
figures:
  - { value: "< 500 ms", label: "pour les 8 meilleures équipes" }
  - { value: "× 6", label: "plus rapide que la version PHP" }
  - { value: "÷ 4", label: "d’utilisation CPU sous forte charge" }
  - { value: "−20 %", label: "de mémoire" }
diagram:
  title: Architecture de Turbo Selector
  cols: 3
  rows: 1
  nodes:
    - { id: app, label: Application Sorare, sub: back-end PHP existant, kind: client, col: 0, row: 0 }
    - { id: api, label: API FastAPI, sub: /best-comp · /top-n, kind: service, col: 1, row: 0 }
    - { id: cbc, label: Solveur CBC, sub: via PuLP, kind: worker, col: 2, row: 0 }
  edges:
    - { from: app, to: api, label: JSON }
    - { from: api, to: cbc, label: programme linéaire }
---

## Le contexte

Pendant mon alternance, un collègue développait une application de composition d’équipes pour Sorare, un jeu de fantasy basé sur de vrais joueurs NBA. Son back-end PHP mettait plus de trois secondes à trouver la meilleure équipe. Je lui ai proposé de faire mieux.

## Stack & infra

Une API FastAPI en Python, typée avec Pydantic, qui s’appuie sur PuLP et le solveur CBC. Image Docker multi-étapes (utilisateur non root, healthcheck, quatre workers), derrière nginx avec des limites CPU et mémoire. Versions taguées, une branche par ticket.

## Comment ça marche

L’API reçoit les joueurs de l’utilisateur avec leur coût, leur score et leur statut d’« étoile ». Elle construit un programme linéaire en variables binaires : maximiser le score total sous contrainte de budget, de nombre de joueurs, d’un minimum d’étoiles et des joueurs imposés par l’utilisateur.

Pour renvoyer plusieurs compositions, elle résout de nouveau en interdisant chaque solution déjà trouvée par une coupe : la somme des joueurs d’une équipe précédente doit rester strictement inférieure à sa taille.

## La difficulté

La règle du MVP : le joueur le plus cher de l’équipe ne compte pas dans le budget. « Le plus cher » n’est pas une contrainte linéaire, alors je l’ai modélisée : une variable binaire désigne le joueur offert, qui doit être sélectionné, et dont le coût doit être au moins égal à celui de tout joueur retenu ; ce coût est ensuite retranché du budget.

Mes premières heuristiques tournaient en 60 ms en local, puis dépassaient deux secondes une fois toutes les règles ajoutées. La programmation linéaire a réglé la question, avec en prime la garantie d’un résultat optimal.

## Ce que ça m’a apporté

Reconnaître un problème d’optimisation et le modéliser proprement plutôt que de l’approcher à tâtons. Mon collègue l’a testé une semaine en production : moins de 500 ms pour 8 équipes, un CPU divisé par quatre et 20 % de mémoire en moins sous forte charge.
