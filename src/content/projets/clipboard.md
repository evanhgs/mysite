---
title: Clipboard
tagline: L’historique du presse-papiers, local et hors ligne, pour Linux, Windows et macOS.
description: "Clipboard garde l’historique du presse-papiers. Écrit en Rust avec Dioxus et SQLite, il gère le raccourci global sous Wayland et s’installe en un clic."
statement: "Une alternative à Ditto pour Linux, qui reste sur votre machine, marche hors ligne et sait se faire oublier."
tier: main
order: 4
year: 2026
context: Projet personnel, open source
role: Conception, développement et packaging
status: En développement actif
stack: [Rust, Dioxus 0.7, SQLite, arboard, tokio, GitHub Actions]
languages: [Rust]
repo: "https://github.com/evanhgs/cross-platform-clipboard"
links:
  - { label: Code source, href: "https://github.com/evanhgs/cross-platform-clipboard" }
  - { label: Téléchargements, href: "https://github.com/evanhgs/cross-platform-clipboard/releases" }
accent: "#2EE6A6"
cover: { motif: sheets, seed: 2 }
figures:
  - { value: "750 ms", label: "entre deux lectures du presse-papiers" }
  - { value: "3", label: "formats d’installation pour Linux et Windows" }
  - { value: "14", label: "tests d’acceptation, de stockage et de système" }
  - { value: "0", label: "octet envoyé sur le réseau" }
diagram:
  title: Architecture de Clipboard, du système à l’interface
  cols: 3
  rows: 2
  nodes:
    - { id: shortcut, label: Raccourci GNOME, sub: Ctrl+Alt+C via gsettings, kind: external, col: 0, row: 0 }
    - { id: ipc, label: Socket Unix, sub: instance unique, kind: service, col: 1, row: 0 }
    - { id: ui, label: Interface Dioxus, sub: épingler · recopier, kind: client, col: 2, row: 0 }
    - { id: os, label: Presse-papiers, sub: texte · images RGBA, kind: external, col: 0, row: 1 }
    - { id: watcher, label: Thread de surveillance, sub: 750 ms · SHA-256, kind: worker, col: 1, row: 1 }
    - { id: db, label: SQLite, sub: WAL · migrations, kind: store, col: 2, row: 1 }
  edges:
    - { from: shortcut, to: ipc, label: relance le binaire }
    - { from: ipc, to: ui, label: « show » }
    - { from: os, to: watcher, label: arboard, flow: stream }
    - { from: watcher, to: db, label: sans doublon }
    - { from: db, to: ui, label: historique }
---

## Le contexte

Sous Windows, Ditto garde l’historique de tout ce qu’on copie. Sous Linux, et surtout sous Wayland, je n’ai rien trouvé d’équivalent qui me convienne. J’ai donc écrit le mien. Il est local, rapide, fonctionne hors ligne et tourne sous Linux avec Wayland ou X11, sous Windows et sous macOS.

C’est un projet personnel open source, toujours en développement.

## Stack & infra

- **Rust et Dioxus 0.7** pour l’interface de bureau. Dioxus s’appuie sur la WebView du système, WebKitGTK sous Linux et WebView2 sous Windows, au lieu d’embarquer tout un Chromium.
- **arboard** lit et écrit le presse-papiers, aussi bien le texte que les images RGBA.
- **SQLite est embarqué** avec rusqlite, en mode WAL, avec un auto-vacuum incrémental et des migrations appliquées au démarrage.
- **Le binaire est optimisé** avec une LTO complète et une seule unité de compilation. Les symboles sont retirés et un panic arrête directement le programme.
- **GitHub Actions** lance les tests à chaque push. À chaque nouvelle version, `dx bundle` produit le .deb et l’AppImage sous Linux et l’installeur NSIS sous Windows, puis publie la release.

## Comment ça marche

Un thread de surveillance lit le presse-papiers toutes les 750 ms. Chaque entrée est identifiée par une empreinte SHA-256, qui tient aussi compte de la largeur et de la hauteur pour les images. Copier deux fois la même chose ne crée donc pas de doublon.

L’historique est stocké dans SQLite. Depuis l’interface, on peut épingler une entrée, la supprimer, la recopier ou vider tout ce qui n’est pas épinglé. Avant de rendre une image au système, l’application vérifie la taille de ses données. Elle se lance avec la session, grâce à un fichier .desktop sous Linux et à une clé Run du registre sous Windows, et peut rester discrètement dans la barre système.

## La difficulté

Tout s’est joué sur le raccourci global. Sous Wayland, une application n’a pas le droit d’écouter le clavier en dehors de sa fenêtre. C’est une protection voulue par le compositeur, pas un bug, et les bibliothèques de raccourcis habituelles ne marchent donc que sous X11.

Plutôt que de chercher à contourner cette protection, l’application déclare un raccourci personnalisé dans GNOME, Ctrl+Alt+C, avec `gsettings`. Ce raccourci relance le binaire, qui repère l’instance déjà ouverte et lui demande de s’afficher par une socket Unix. On a ainsi une seule instance à la fois, sans démon en plus.

Il a aussi fallu gérer les différences de formats d’image entre les systèmes, et empaqueter trois plateformes depuis une seule CI.

## Ce que ça m’a apporté

- De la programmation système en Rust, avec des threads, de la communication entre processus et l’intégration au bureau.
- Composer avec les règles de sécurité d’une plateforme au lieu de chercher à les contourner.
- Livrer un logiciel de bureau de bout en bout, avec les installeurs, les releases et le démarrage automatique.
