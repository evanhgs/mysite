---
title: 'Telebox'
description: 'Mon premier projet sérieux: Telebox'
pubDate: '24 mars 2026'
heroImage: '@assets/blog-placeholder-3.jpg'
---

À l’époque où je débutais dans la programmation, j’adorais Python et je faisais de tout avec : sites, applications, scripts…
Je travaillais avec des personnes qui avaient besoin de faire grossir des groupes sur Telegram pour améliorer leur visibilité, et je me suis tourné vers l’API de Telegram pour voir ce qu’il était possible de faire. J’avais entendu dire qu’on pouvait ajouter automatiquement des membres dans un groupe à partir d’une liste CSV et d’un compte Telegram.

J’ai donc commencé par créer un CLI pour lancer des commandes et exécuter des scripts permettant de se connecter à Telegram, de récupérer des membres dans des groupes publics, de les stocker, puis de les ajouter dans le groupe souhaité. Bon, niveau RGPD, on pourra rediscuter de ça plus tard ^^

Puis j’ai trouvé le CLI peu pratique, car mon objectif était de vendre des licences, et pour commercialiser mon application, il fallait une interface accessible à tout type d’utilisateur.
Ma stratégie a donc été de refactoriser mon application et de revoir ma façon de programmer (mes débuts en programmation orientée objet). J’ai dû tout repenser : séparer la logique métier dans des classes et structurer correctement l’ensemble.

Pour le frontend de l’application desktop, je me suis tourné vers CustomTkinter (une version modifiée), car je trouve personnellement Tkinter peu esthétique. J’ai passé plusieurs semaines à coder pour refactoriser les fonctionnalités. En parallèle, j’ai développé un site web dynamique avec Flask pour gérer les clés de licence, l’authentification et les paiements avec Stripe.

Au total, j’ai passé plusieurs mois sur le site et l’application… pour finalement vendre une seule licence à un inconnu :D

Un projet donc peu rentable financièrement, mais qui m’a permis de décrocher un stage dans une ESN à Lyon, car le fait d’être proactif et motivé a plu à mes employeurs.

L’application est aujourd’hui open source, accessible à tous et toujours fonctionnelle :D

[L'app Telebox](https://github.com/evanhgs/Telegram-scraper-adder-app)