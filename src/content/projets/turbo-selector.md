---
title: Turbo Selector
tagline: Les 8 meilleures équipes NBA possibles, en moins de 500 ms.
description: "Turbo Selector, une API FastAPI qui compose les meilleures équipes par programmation linéaire avec PuLP et CBC. On passe de plus de 3 s à moins de 500 ms."
statement: "Un collègue attendait trois secondes à chaque requête. J’ai remplacé ses heuristiques par un modèle mathématique."
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

Pendant mon alternance, un collègue développait une application de composition d’équipes pour Sorare, un jeu de fantasy basé sur de vrais joueurs NBA. Son back-end PHP mettait plus de trois secondes à trouver la meilleure équipe, et je lui ai proposé de faire mieux.

## Stack & infra

C’est une API FastAPI en Python, typée avec Pydantic, qui s’appuie sur PuLP et le solveur CBC. Elle tourne dans une image Docker multi-étapes, avec un utilisateur non root, un healthcheck et quatre workers, derrière nginx avec des limites de CPU et de mémoire. Chaque version est taguée et chaque ticket a sa branche.

## Comment ça marche

L’API reçoit les joueurs de l’utilisateur avec leur coût, leur score et leur statut d’« étoile ». Elle construit un programme linéaire en variables binaires qui maximise le score total en respectant le budget, le nombre de joueurs, un minimum d’étoiles et les joueurs que l’utilisateur veut absolument garder.

Pour renvoyer plusieurs compositions, elle relance le calcul en interdisant à chaque fois les solutions déjà trouvées. Pour ça, elle ajoute une contrainte qui oblige la nouvelle équipe à différer d’au moins un joueur de chaque équipe précédente.

## La difficulté

Tout tenait dans la règle du MVP. Le joueur le plus cher de l’équipe ne compte pas dans le budget, et « le plus cher » n’est pas une contrainte linéaire. Je l’ai donc modélisé autrement. Une variable binaire désigne le joueur offert, qui doit faire partie de l’équipe et coûter au moins autant que n’importe quel autre joueur retenu. Son coût est ensuite retiré du budget.

Mes premières heuristiques tournaient en 60 ms en local, mais dépassaient deux secondes une fois toutes les règles ajoutées. La programmation linéaire a réglé le problème, avec en plus la garantie d’obtenir le meilleur résultat possible.

## Ce que ça m’a apporté

J’ai appris à reconnaître un problème d’optimisation et à le modéliser proprement au lieu de tâtonner. Mon collègue l’a testé une semaine en production, avec moins de 500 ms pour 8 équipes, quatre fois moins de CPU et 20 % de mémoire en moins sous forte charge.
