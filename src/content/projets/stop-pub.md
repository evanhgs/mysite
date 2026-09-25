---
title: stop-pub
tagline: Un bloqueur de publicités Manifest V3, pour Chromium et Firefox.
description: "stop-pub, un bloqueur de publicités Manifest V3. Les listes EasyList deviennent des règles declarativeNetRequest au build, sous les limites de Chrome."
statement: "Manifest V3 interdit de filtrer les requêtes à la volée, alors tout se décide au moment du build."
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
  - { value: "1 000", label: "règles regex au maximum, la limite de Chrome" }
  - { value: "3", label: "listes de filtres réunies au build" }
  - { value: "5", label: "navigateurs pris en charge, de Chrome à Firefox" }
diagram:
  title: Pipeline de stop-pub, du build au navigateur
  cols: 3
  rows: 2
  nodes:
    - { id: lists, label: EasyList, sub: FR · Privacy, kind: external, col: 0, row: 0 }
    - { id: build, label: Build Node.js, sub: conversion et budgets, kind: worker, col: 1, row: 0 }
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

Manifest V3 a changé les règles des extensions de navigateur. Une extension ne peut plus filtrer les requêtes avec son propre code exécuté à la volée. Elle doit déclarer des règles que le navigateur applique lui-même. J’ai voulu comprendre ce modèle de l’intérieur en écrivant mon propre bloqueur, pour Chrome, Edge, Brave, Opera et Firefox.

## Stack & infra

L’extension est écrite en JavaScript sans framework, avec un pipeline de build en Node.js. La bibliothèque d’AdGuard, tsurlfilter, dans une version épinglée, convertit la syntaxe d’Adblock Plus. Deux manifestes sont générés à partir d’une base commune, l’un pour Chromium et l’autre pour Firefox, et les icônes sont produites par un script sans aucune dépendance graphique.

## Comment ça marche

Au moment du build, les listes EasyList, EasyList FR et EasyPrivacy sont téléchargées puis converties en jeux de règles `declarativeNetRequest` statiques. Les règles cosmétiques, c’est-à-dire les sélecteurs CSS, sont extraites dans un fichier JSON compact.

Pendant la navigation, c’est le navigateur qui bloque lui-même les requêtes. Un script de contenu injecte les sélecteurs dès le début du chargement de la page, et se remet en place un nombre limité de fois si la page essaie de le retirer. Les pauses et les règles personnelles sont gérées comme des règles dynamiques.

## La difficulté

Chrome impose des limites, avec environ 330 000 règles statiques garanties et 1 000 règles regex par extension. Le build attribue un budget à chaque liste et s’arrête en erreur s’il est dépassé. C’est plus sûr que de livrer une extension qui ignorerait des règles sans prévenir.

La pause sur un site et la pause générale sont des règles qui autorisent tout, avec une priorité plus haute, rangées dans des plages d’identifiants réservées. Les priorités sont étagées dans cet ordre, les listes, puis les règles personnelles, puis la pause sur un site et enfin la pause générale. On raisonne ainsi sur l’ordre dans lequel le navigateur évalue les règles, plutôt que sur des conditions dans le code.

## Ce que ça m’a apporté

J’ai compris comment un navigateur évalue des règles réseau et appris à écrire un pipeline de build qui vérifie ses propres limites. J’ai aussi dû gérer les écarts entre Chromium et Firefox. Par exemple, le compteur de requêtes bloquées n’existe que sous Chromium.
