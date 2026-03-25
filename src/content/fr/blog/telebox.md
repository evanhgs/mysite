---
title: 'Premier blog dune longue série'
description: 'Mon premier projet sérieux: Telebox'
pubDate: '24 mars 2026'
heroImage: '@assets/blog-placeholder-3.jpg'
---

À l’époque où je faisais mes premiers pas dans la programmation, j’étais littéralement fasciné par Python. C’était mon terrain de jeu. Je développais un peu de tout : des sites web, des applications desktop, des scripts en tout genre… chaque idée était une excuse pour coder.

C’est dans ce contexte que j’ai commencé à collaborer avec des personnes cherchant à faire croître leurs groupes Telegram afin d’améliorer leur visibilité. Intrigué, je me suis tourné vers l’API de Telegram pour explorer les possibilités. J’avais entendu dire qu’il était possible d’ajouter automatiquement des membres à un groupe à partir d’une simple liste CSV associée à un compte Telegram.

Ni une ni deux, je me lance.

Je commence par développer un outil en ligne de commande (CLI), capable d’exécuter différentes actions : se connecter à Telegram, récupérer des membres depuis des groupes publics, les stocker, puis les réinjecter dans un groupe cible. Une sorte de pipeline automatisé, brut mais efficace.  
Bon… côté RGPD, on pourra en reparler plus tard ^^

Rapidement, je me rends compte d’une limite importante : un CLI, aussi puissant soit-il, reste peu accessible pour des utilisateurs non techniques. Or, mon objectif était clair, proposer une solution commercialisable, avec un système de licences.

Je décide alors de reprendre le projet à zéro.

C’est à ce moment-là que je plonge sérieusement dans la programmation orientée objet. Je refactorise entièrement mon application, en structurant proprement la logique métier à l’aide de classes. Un vrai tournant dans ma manière de coder (qui faut se permettre était aléatoire).

Pour la partie interface, je fais le choix de **CustomTkinter**, une version modernisée de Tkinter, bien plus agréable visuellement (et surtout moins… rustique). Pendant plusieurs semaines, je travaille intensément pour transformer mon outil brut en une véritable application desktop utilisable.

Mais ce n’est pas tout.

En parallèle, je développe un site web dynamique avec Flask, permettant de gérer les clés de licence, l’authentification des utilisateurs et les paiements via stripe  

Au total, ce projet m’a occupé pendant plusieurs mois. Entre le backend, le frontend, l’architecture globale et la logique métier, j’y ai investi une énergie considérable.

Et le résultat ?

Une seule licence vendue. À un parfait inconnu :D

Sur le plan financier, difficile de parler de réussite.

Mais en réalité, ce projet m’a apporté bien plus que de l’argent. Il a été un véritable tremplin. Grâce à lui, j’ai pu décrocher un stage dans une ESN à Lyon. Ce que mes recruteurs ont vu, ce n’était pas le chiffre de vente — mais l’initiative, la persévérance et la capacité à mener un projet complexe de bout en bout.

Aujourd’hui, l’application est open source, toujours fonctionnelle, et accessible à tous sur [Github Telebox](https://github.com/evanhgs/Telegram-scraper-adder-app)

Avec le recul, c’est probablement l’un des projets les plus formateurs que j’ai réalisés. Comme quoi, même les “échecs” peuvent ouvrir de vraies opportunités.