---
title: 'Turbo-selector'
description: ''
pubDate: '26 mars 2026'
heroImage: '@assets/blog-placeholder-2.jpg'
---

De retour dans la timeline, j’ai pris une petite pause (août à novembre) dans mes projets de code. J’ai trouvé une alternance et je travaillais beaucoup à côté, entre le travail et l’école.

Un jour, je décide de parler projets avec un collègue de travail qui gère une application de création d’équipes pour le jeu Sorare, un indispensable pour les passionnés de football et de basket. Le principe est de créer des équipes de joueurs professionnels, de miser des gains et de réaliser les meilleures performances possibles.

On discute de son backend en PHP, qui galérait à générer la meilleure équipe NBA : une requête pouvait dépasser les 3 secondes. Je lui ai alors répondu que je pouvais faire mieux en Python, et à partir de là, j’ai enchaîné plusieurs jours intenses où j’ai utilisé mes cours de mathématiques et d’algorithmique pour optimiser la sélection des joueurs NBA.

Le programme prend une liste de joueurs NBA que la personne possède. À partir de cette liste, il analyse le coût des joueurs (pour un mode standard, le coût total ne doit pas dépasser 120), leur score, ainsi qu’un autre paramètre : l’étoile, un booléen indiquant si c’est un joueur de saison (car on ne peut en utiliser que 4 selon les modes).
Un autre cas concerne le joueur MVP : son coût ne compte pas, ce qui permet de sélectionner des joueurs plus coûteux. Enfin, il faut retourner plusieurs possibilités et permettre de forcer certains joueurs, par exemple si l’utilisateur souhaite inclure son joueur préféré. Un autre endpoint permet d’afficher jusqu’à 8 résultats.

Voilà l’idée générale. J’ai donc développé plusieurs fonctions heuristiques qui se rapprochaient d’un résultat réaliste avec des performances intéressantes (en local, j’étais descendu à environ 60 ms par requête). Je mettrai à jour ce post pour montrer un avant/après.

Cependant, un problème est rapidement apparu : après avoir ajouté toutes les fonctionnalités et la génération des 8 résultats, la requête dépassait les 2 secondes. Je n’étais pas satisfait.

Je me suis alors tourné vers une bibliothèque de programmation linéaire, lp_solve pour les intimes, mais elle n’était plus à jour et incompatible avec une version récente de Python. J’ai donc installé PuLP et réécrit toute la logique. Et là, la magie (ou plutôt les mathématiques) a opéré : la requête est descendue sous les 500 ms pour 8 équipes.

J’ai ensuite dockerisé l’application FastAPI et optimisé son utilisation avec Docker pour un déploiement en production. Je l’ai passée à mon collègue, qui l’a testée pendant une semaine. Les résultats ont été très satisfaisants : un gain énorme sur l’utilisation CPU et RAM. Lors de fortes charges, il a gagné environ 20 % de RAM et divisé par 4 l’utilisation CPU.

Il était très content, et moi aussi.

[L'app turbo sélector](https://github.com/evanhgs/turbo-selector)