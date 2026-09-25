# evanhgs.fr

Le portfolio d’Evan Hugues, technicien supérieur en informatique et cofondateur d’Artinova. Le site est entièrement statique. Il est construit avec Astro 7 et Three.js, en TypeScript, sans framework d’interface.

## Ce qu’il y a dedans

- **L’accueil** est une scène WebGL pilotée par le défilement. Environ 4 000 cubes forment le nom par anamorphose, puis le triangle impossible de Reutersvärd, dont la jonction ne tient que depuis un seul point de vue.
- **La page Projets** propose une liste classique et une grille WebGL courbée comme sous une lentille, qu’on fait glisser à la souris ou au doigt.
- **Les études de cas** sont des fichiers Markdown dans `src/content/projets/`. Chaque schéma d’architecture est décrit dans le front matter et dessiné en SVG au moment du build.
- **La page Contact** affiche l’adresse e-mail après une preuve de travail ALTCHA calculée dans le navigateur. L’adresse est chiffrée au build et n’apparaît jamais en clair dans `dist/`.
- **La page 404** montre un escalier de Penrose en WebGL, qu’un petit cube monte sans fin.

Sans WebGL, avec les animations réduites ou avec l’économiseur de données activé, le site affiche des posters SVG dessinés avec la même géométrie.

## Développer

```sh
npm install
npm run dev       # serveur de développement
npm run build     # build statique dans dist/
npm run check     # vérification des types
```

Il faut Node 22.12 ou une version plus récente.

## Vérifier

```sh
npm run size      # budgets de poids du JS, du CSS, du HTML et de la police
npm run verify    # build servi comme sur Vercel, puis contrôles dans Chromium
```

`npm run verify` sert `dist/` avec les en-têtes, la CSP et les redirections de `vercel.json`. Il passe ensuite chaque page en revue sur ordinateur et sur mobile. Il vérifie les erreurs de console, les violations de CSP, le SEO de base, les redirections des anciennes adresses, la page Contact, la grille des projets et la page 404. Il s’appuie sur Playwright, dont il faut installer le navigateur une première fois avec `npx playwright install chromium`.

## Images générées

```sh
npm run og           # images Open Graph dans public/og/
npm run font:subset  # sous-ensemble de la police Mona Sans
npm run assets:crop  # recadrage des captures d’Aramis
```

Les couvertures des projets et les icônes du site sont générées au moment du build, à partir des mêmes fonctions que les illustrations.

## Déployer

Le site est prévu pour Vercel, sans adaptateur ni fonction serverless. Le fichier `vercel.json` contient les redirections des anciennes adresses, une CSP stricte qui n’autorise aucun script inline, et les règles de cache.

L’adresse affichée sur la page Contact se règle avec la variable d’environnement `CONTACT_EMAIL`. Si elle apparaît en clair quelque part dans `dist/`, le build échoue.

Pour héberger le site soi-même, l’image Docker sert le build avec nginx, avec les mêmes en-têtes et les mêmes redirections.

```sh
docker compose up -d --build   # http://localhost:7788
```

## Organisation

```
src/content/projets/   les 9 études de cas en Markdown
src/data/site.ts       identité, réseaux et compétences
src/pages/             pages, couvertures et icônes
src/components/        composants Astro
src/client/            scripts du navigateur (scènes WebGL, grille, contact)
src/lib/               géométrie des illusions, SEO, couvertures et schémas
scripts/               vérification, budgets, images Open Graph et police
```
