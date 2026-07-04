# evanhgs.fr — Portfolio

Portfolio d'Evan Hugues. Design minimaliste noir/blanc inspiré de [phantom.land](https://www.phantom.land/) : typographie géante, grille de projets, visuels SVG génératifs.

## Performance

Le site est conçu pour être aussi rapide qu'un site statique peut l'être :

- **Zéro JavaScript** livré au navigateur — tout est HTML/CSS (marquee, hover, transitions de page via `@view-transition`, apparitions au scroll via `animation-timeline: view()`).
- **CSS inliné** dans chaque page (`inlineStylesheets: 'always'`) : aucune requête bloquante.
- **Une seule ressource critique** : la police Space Grotesk variable (woff2, subset latin, 22 Ko) préchargée.
- **Visuels de projets en SVG inline** : zéro requête image.
- **Pré-compression gzip au build** (Dockerfile) servie par `gzip_static` — nginx ne compresse rien à la volée.
- **Cache immuable 1 an** sur les assets, revalidation sur le HTML, redirection racine en 301 côté nginx.

Poids d'une page : ~7,5 Ko de HTML gzippé + 22 Ko de police (mise en cache un an).

## Stack

- [Astro 6](https://astro.build) (sortie 100 % statique, compilateur Rust)
- nginx unprivileged (Docker multi-stage)
- i18n FR/EN (`/fr/…`, `/en/…`), blog en collections de contenu

## Développement

```sh
npm install
npm run dev        # serveur de dev
npm run build      # build statique dans ./dist
npm run preview    # prévisualisation du build
```

## Déploiement

```sh
docker compose up -d --build   # build + nginx sur http://localhost:7788
```

Le contenu (projets, bio, compétences) vit dans `src/data/content.ts`.
Les traductions d'interface et les routes localisées dans `src/i18n/ui.ts`.
