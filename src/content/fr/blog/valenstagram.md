---
title: 'Valenstagram'
description: 'Instagram à Valence ?'
pubDate: '25 mars 2026'
heroImage: '@assets/blog-placeholder-4.jpg'
---

Peu de temps après avoir finalisé Telebox, j’étais encore porté par l’euphorie du développement web dynamique avec Flask. À cette période, je me plongeais également dans la lecture d’un ouvrage consacré à Django un framework Python réputé pour sa robustesse, son architecture complète et sa capacité à supporter des applications web à grande échelle.

C’est dans cet état d’esprit que je me suis lancé un défi ambitieux (et un peu fou), recréer une version open source d’Instagram, avec une API RESTful et un frontend en React.  
L’objectif était clair : monter en compétences sur les SPA (Single Page Applications) modernes et comprendre en profondeur les enjeux d’un frontend dynamique et performant.

Avec le recul, j’ai clairement brûlé des étapes.

Je me suis lancé tête baissée dans le développement, sans réellement cadrer le projet, pas de réflexion approfondie sur les besoins fonctionnels, peu de conception en amont et une stack choisie un peu trop rapidement  

Côté backend, Flask m’a vite montré ses limites. Bien qu’excellent pour des projets légers ou des prototypes, il devient plus contraignant lorsqu’il s’agit de structurer une API complexe, scalable et maintenable.

Côté frontend, même constat une organisation des fichiers chaotique une gestion de l’authentification peu fiable et un manque global de modularité  

Au final, j’avais une base fonctionnelle… mais clairement instable. Un prototype, pas une application solide.

Début été 2025, face à ces limites, je prends du recul. L’API devient difficile à maintenir en partie à cause des routes mal organisées du typage des données confus (utilisateurs, posts, commentaires) et de la complexité croissante à chaque nouvelle fonctionnalité  

Je décide alors de repartir sur des bases plus saines.

C’est à ce moment-là que je découvre FastAPI et je me dis c'est du solide

Je réécris entièrement l’API avec FastAPI, un framework moderne basé sur Python, conçu pour la performance et la clarté.

Ce que FastAPI m’a apporté c'est un typage fort avec Pydantic, permettant de structurer clairement les données validation automatique des entrées et une documentation interactive générée automatiquement (Swagger / OpenAPI) par ailleurs il apporte d'excellentes performances, proches d'autres framework matures.

Cette refonte donne naissance à valenstagram-api 2.0, une version beaucoup plus propre, maintenable et agréable à faire évoluer.


En parallèle, je commence à professionnaliser mon workflow :
- mise en place d’un pipeline CI/CD  
- automatisation des déploiements  
- gestion des versions  
- amélioration continue du code  

Je passe près de 6 mois sur ce projet, en parallèle de mon stage et de mes cours qui marque une période intense, parfois épuisante, mais extrêmement formatrice.

Quelques mois plus tard, nouveau constat : le frontend ne suit plus.

Interface peu esthétique, ergonomie limitée… il fallait tout repenser.

C’est là que je découvre Next.js, un framework React puissant qui apporte une vraie structure aux applications frontend modernes.

Next.js a fait la différence grâce à son routage basé sur le système de fichiers, son rendu côté serveur (SSR) améliorant les performances et le SEO, ses API routes intégrées et ses nombreuses optimisations automatiques (images, bundle webpack).  

Je décide donc de repartir une nouvelle fois sur le frontend, avec une approche plus propre, plus structurée, et surtout plus professionnelle.

---

Avec le recul, ce projet est probablement l’un des plus exigeants que j’ai menés.  
Mais c’est aussi celui qui m’a le plus appris.

J’y ai compris une chose essentielle que coder vite, c’est bien mais concevoir correctement, c’est indispensable :)