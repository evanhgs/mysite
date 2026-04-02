---
title: 'Valenstagram'
description: 'Instagram à Valence ?'
pubDate: '25 mars 2026'
heroImage: '@assets/blog-placeholder-4.jpg'
---

Peu après avoir finalisé mon application Telebox, j’étais encore dans l’euphorie de la création de sites web dynamiques avec Flask. À ce même moment, je lisais un livre sur Django, un framework Python permettant de créer des sites web très puissants et scalables. Je me suis donc lancé dans ce projet un peu fou : recréer Instagram en open source, avec une API RESTful et un frontend en React, uniquement dans le but d’apprendre React et le développement de SPA dynamiques de qualité.

Je me suis lancé trop vite dans le développement du projet et je n’ai pas pris le temps de réfléchir aux besoins : quoi implémenter, comment, ni même de bien choisir la stack (Flask n’est pas adapté pour une API solide et scalable). Côté frontend, j’ai mal organisé mes fichiers et l’authentification n’était pas du tout fiable. D’un point de vue modulaire, c’était surtout un prototype.

J’avais malgré tout une bonne base, mais début été 2025, je n’étais pas satisfait de l’API, qui était trop contraignante : les routes étaient mal organisées, et je me perdais dans le typage des données des utilisateurs, des posts et des commentaires. Je me suis donc documenté et j’ai pris la décision de tout réécrire avec FastAPI. Je trouvais ce framework très intéressant et performant, alors je me suis lancé dans une refonte complète de valenstagram-api.

J’ai particulièrement apprécié la fonctionnalité d’autodocumentation de FastAPI. En parallèle, j’ai continué à ajouter des fonctionnalités et à mettre en place un processus de CI/CD avec automatisation des versions et des mises en production. Je me souviens avoir passé un bon cinq mois sur ce projet, en parallèle de mon stage et des cours, ce qui m’a mentalement épuisé.

Puis, il y a quelques mois, j’ai découvert Next.js et j’ai décidé de refaire le frontend, qui était très peu esthétique et peu ergonomique, afin de profiter des fonctionnalités du framework, notamment son routage et le SSR.

[L'application web](https://github.com/evanhgs/val-webapp) 

[L'api de valenstagram](https://github.com/evanhgs/val-api)