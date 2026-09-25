---
title: Clipboard
tagline: Historique du presse-papiers, local et hors ligne, pour Linux, Windows et macOS.
description: "Clipboard, historique du presse-papiers en Rust et Dioxus : SQLite, dédoublonnage SHA-256, raccourci global sous Wayland, paquets .deb, AppImage et NSIS."
statement: "Une alternative à Ditto pour Linux : locale, hors ligne, et qui sait se faire oublier."
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
  - { value: "3", label: "formats de paquets : .deb, AppImage, NSIS" }
  - { value: "14", label: "tests : acceptation, stockage, système" }
  - { value: "0", label: "octet envoyé sur le réseau" }
diagram:
  title: Architecture de Clipboard, de l’OS à l’interface
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

Sous Windows, Ditto garde l’historique de tout ce qu’on copie. Sous Linux, et surtout sous Wayland, je n’ai rien trouvé d’équivalent qui me convienne. J’ai donc écrit le mien : local, hors ligne, rapide, pour Linux (Wayland et X11), Windows et macOS.

C’est un projet personnel open source, en développement actif.

## Stack & infra

- **Rust**, avec **Dioxus 0.7** pour l’interface de bureau : une WebView native (WebKitGTK sous Linux, WebView2 sous Windows) plutôt qu’un Chromium embarqué.
- **arboard** pour lire et écrire le presse-papiers, en texte comme en images RGBA.
- **SQLite embarqué** (rusqlite) en mode WAL, avec auto-vacuum incrémental et migrations appliquées au démarrage.
- **Un binaire optimisé :** LTO complet, une seule unité de compilation, symboles retirés, `panic = abort`.
- **CI GitHub Actions :** tests à chaque push. À chaque tag, `dx bundle` produit le .deb et l’AppImage sous Linux et l’installeur NSIS sous Windows, puis publie la release.

## Comment ça marche

Un thread de surveillance lit le presse-papiers toutes les 750 ms. Chaque entrée est identifiée par une empreinte SHA-256 (qui inclut largeur et hauteur pour les images) : copier deux fois la même chose ne crée pas de doublon.

L’historique vit dans SQLite. L’interface permet d’épingler, de supprimer, de vider ce qui n’est pas épinglé et de recopier une entrée, en vérifiant la taille des données d’image avant de les rendre au système. L’application démarre avec la session (un fichier .desktop sous Linux, une clé Run du registre sous Windows) et peut rester en arrière-plan, dans la barre système.

## La difficulté

Le raccourci global. Sous Wayland, une application n’a pas le droit d’écouter le clavier globalement : c’est une protection du compositeur, pas un bug. Les bibliothèques de raccourcis habituelles ne fonctionnent donc que sous X11.

Plutôt que de les contourner, l’application déclare un raccourci personnalisé GNOME (Ctrl+Alt+C) via `gsettings`. Ce raccourci relance le binaire, qui détecte l’instance déjà ouverte et lui demande de s’afficher par une socket Unix. On obtient une instance unique, sans démon supplémentaire.

S’y ajoutent les différences de formats d’image entre systèmes et le packaging de trois plateformes depuis une seule CI.

## Ce que ça m’a apporté

- De la programmation système en Rust : threads, IPC, intégration au bureau.
- Composer avec les contraintes de sécurité d’une plateforme plutôt que chercher à les contourner.
- Livrer un logiciel de bureau de bout en bout : installeurs, releases, démarrage automatique.
