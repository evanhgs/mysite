---
title: stop-pub
tagline: Un bloqueur de publicités Manifest V3, pour Chromium et Firefox.
description: "stop-pub, bloqueur de publicités Manifest V3 : EasyList convertie en règles declarativeNetRequest au build, sous les plafonds de Chrome et de Firefox."
statement: "Manifest V3 interdit de filtrer les requêtes à la volée. Tout se décide donc au moment du build."
tier: secondary
order: 8
year: 2026
context: Projet personnel, open source
role: Conception et développement
stack: [JavaScript, Manifest V3, declarativeNetRequest, tsurlfilter, Node.js]
languages: [JavaScript]
repo: "https://github.com/evanhgs/stop-pub"
links:
  - { label: Code source, href: "https://github.com/evanhgs/stop-pub" }
accent: "#FF3B3B"
cover: { motif: broken, seed: 9 }
figures:
  - { value: "300 000", label: "règles au plus, vérifiées au build" }
  - { value: "1 000", label: "règles regex au maximum (limite Chrome)" }
  - { value: "3", label: "listes : EasyList, EasyList FR, EasyPrivacy" }
  - { value: "5", label: "navigateurs : Chrome, Edge, Brave, Opera, Firefox" }
diagram:
  title: Pipeline de stop-pub, du build au navigateur
  cols: 3
  rows: 2
  nodes:
    - { id: lists, label: EasyList, sub: FR · Privacy, kind: external, col: 0, row: 0 }
    - { id: build, label: Build Node.js, sub: conversion + budgets, kind: worker, col: 1, row: 0 }
    - { id: dnr, label: Règles statiques, sub: declarativeNetRequest, kind: service, col: 2, row: 0 }
    - { id: popup, label: Popup et options, sub: pauses · règles perso, kind: client, col: 0, row: 1 }
    - { id: dynamic, label: Règles dynamiques, sub: priorités · plages d’ID, kind: store, col: 1, row: 1 }
  edges:
    - { from: lists, to: build, label: téléchargement }
    - { from: build, to: dnr, label: JSON }
    - { from: popup, to: dynamic, label: mise à jour }
    - { from: dynamic, to: dnr, label: priorité supérieure }
---

## Le contexte

Manifest V3 a changé les règles des extensions de navigateur : fini le filtrage des requêtes par du code exécuté à la volée, place à des règles déclaratives évaluées par le navigateur lui-même. J’ai voulu comprendre ce modèle de l’intérieur en écrivant mon propre bloqueur, pour Chrome, Edge, Brave, Opera et Firefox.

## Stack & infra

JavaScript sans framework, un pipeline de build en Node.js et la bibliothèque d’AdGuard (tsurlfilter, version épinglée) pour convertir la syntaxe Adblock Plus. Deux manifestes générés depuis une base commune, l’un pour Chromium et l’autre pour Firefox, et des icônes produites par un script sans dépendance d’image.

## Comment ça marche

Au build, les listes EasyList, EasyList FR et EasyPrivacy sont téléchargées puis converties en jeux de règles `declarativeNetRequest` statiques ; les règles cosmétiques (sélecteurs CSS) sont extraites dans un JSON compact.

À l’exécution, le navigateur bloque lui-même les requêtes. Un script de contenu injecte les sélecteurs dès le début du chargement et se réinsère, un nombre limité de fois, si une page tente de le retirer. Pauses et règles personnalisées sont des règles dynamiques.

## La difficulté

Les plafonds de Chrome : environ 330 000 règles statiques garanties et 1 000 règles regex par extension. Le build impose un budget par liste et échoue s’il est dépassé, plutôt que de livrer une extension qui ignorerait des règles en silence.

La pause par site et la pause globale sont des règles « tout autoriser » de priorité supérieure, rangées dans des plages d’identifiants réservées. Les priorités sont étagées : listes, puis règles personnelles, puis pause par site, puis pause globale. On raisonne sur l’ordre d’évaluation plutôt que sur des conditions dans le code.

## Ce que ça m’a apporté

Comprendre comment un navigateur évalue des règles réseau, écrire un pipeline de build qui valide ses propres contraintes, et gérer les écarts entre Chromium et Firefox : par exemple, le compteur de requêtes bloquées n’existe que sous Chromium.
