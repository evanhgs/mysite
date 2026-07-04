export type Locale = 'fr' | 'en';

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  /** Accroche courte affichée sur la carte et en sous-titre de la page projet. */
  tagline: string;
  /** Paragraphes de description pour la page projet. */
  description: string[];
  year: string;
  role: string;
  tags: string[];
  tech: string[];
  links: ProjectLink[];
  blogSlug?: string;
}

export interface SiteContent {
  meta: { title: string; description: string };
  hero: { kicker: string; statement: string };
  ticker: string[];
  about: {
    teaser: string;
    paragraphs: string[];
    education: { degree: string; detail: string };
  };
  capabilities: { title: string; items: string[] }[];
  contact: {
    email: string;
    github: string;
    linkedin: string;
    htb: string;
    rootme: string;
  };
  projects: Project[];
}

const CONTACT = {
  email: 'evanhugues@proton.me',
  github: 'https://github.com/evanhgs',
  linkedin: 'https://www.linkedin.com/in/evanhugues/',
  htb: 'https://profile.hackthebox.com/profile/019d1fae-bea8-70cc-976c-77909e028c23',
  rootme: 'https://www.root-me.org/',
};

const PROJECTS_FR: Project[] = [
  {
    id: 'sae5-aramis',
    name: 'Aramis',
    tagline: 'Le picking d’entrepôt guidé à la voix et en 3D.',
    description: [
      "Aramis est une application web de gestion de picking d'entrepôt, conçue en équipe dans le cadre de ma troisième année de BUT Informatique. Les préparateurs de commandes traitent leurs supports guidés par reconnaissance vocale, mains libres, avec une visualisation 3D de l'entrepôt pour se repérer instantanément.",
      "Côté supervision, un tableau de bord temps réel donne aux responsables une vue complète de l'activité : avancement des préparateurs, état des stocks, produits manquants. L'ensemble repose sur Next.js et PostgreSQL, avec une attention particulière portée à la fluidité des interactions en conditions réelles d'entrepôt.",
    ],
    year: '2026',
    role: 'Développement full-stack',
    tags: ['Web App', 'Temps réel', '3D'],
    tech: ['Next.js', 'PostgreSQL', 'Reconnaissance vocale', 'Visualisation 3D'],
    links: [{ label: 'GitLab', url: 'https://gitlab.iut-valence.fr/huguesev/sae5_aramis' }],
  },
  {
    id: 'rmce',
    name: 'RMCE',
    tagline: 'Strava, mais pour les voitures.',
    description: [
      "RMCE est une application mobile de course automobile sur routes ouvertes : enregistrement des trajets, chronos, classements — l'esprit Strava appliqué à l'automobile.",
      "J'ai conçu l'API backend en Rust pour des performances et une fiabilité maximales, et l'application mobile en Flutter pour un déploiement iOS et Android depuis une seule base de code. Un terrain de jeu idéal pour pousser deux écosystèmes exigeants en parallèle.",
    ],
    year: '2025',
    role: 'Conception & développement',
    tags: ['Mobile', 'API', 'Rust'],
    tech: ['Rust', 'Flutter', 'REST API'],
    links: [
      { label: 'API — GitHub', url: 'https://github.com/evanhgs/rust-rmce-api' },
      { label: 'App — GitHub', url: 'https://github.com/evanhgs/rmce_app' },
    ],
  },
  {
    id: 'dashdust',
    name: 'Dashdust',
    tagline: 'Un dashboard serveur propulsé par Rust et WebAssembly.',
    description: [
      "Dashdust est un tableau de bord de monitoring serveur : simple, moderne, et surtout rapide. Le cœur du projet est une obsession de la performance — le backend et les traitements critiques sont écrits en Rust et compilés en WebAssembly pour s'exécuter à vitesse quasi native.",
      "Né de ma pratique du self-hosting, il répond à un vrai besoin : surveiller mes propres machines avec un outil léger, sans la lourdeur des solutions d'entreprise.",
    ],
    year: '2025',
    role: 'Conception & développement',
    tags: ['Dashboard', 'Rust', 'WebAssembly'],
    tech: ['Rust', 'WebAssembly'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/dashdust' }],
  },
  {
    id: 'turbo-selector',
    name: 'Turbo Selector',
    tagline: 'Les 8 meilleures équipes NBA possibles, en moins de 500 ms.',
    description: [
      "Un collègue avait un problème : son backend PHP mettait plus de 3 secondes à générer la meilleure équipe NBA pour le jeu de fantasy Sorare. Je lui ai dit que je pouvais faire mieux.",
      "Turbo Selector est une API d'optimisation combinatoire : elle s'appuie sur la programmation linéaire (PuLP) pour explorer l'espace des compositions possibles et retourner les 8 meilleures équipes en moins de 500 ms — soit environ 6 fois plus rapide que la solution d'origine, avec un résultat mathématiquement optimal.",
    ],
    year: '2024',
    role: 'Conception & développement',
    tags: ['API', 'Optimisation', 'Data'],
    tech: ['Python', 'FastAPI', 'PuLP', 'Docker'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/turbo-selector' }],
    blogSlug: 'turbo-selector',
  },
  {
    id: 'valenstagram',
    name: 'Valenstagram',
    tagline: 'Recréer Instagram pour maîtriser l’architecture d’API.',
    description: [
      "Valenstagram est une reproduction open source d'Instagram : API RESTful complète (utilisateurs, posts, commentaires, authentification) et frontend SPA. L'objectif : apprendre en profondeur la conception d'API et le développement frontend moderne.",
      "Le projet a connu deux refontes majeures, assumées et documentées : l'API migrée de Flask vers FastAPI pour la robustesse du typage et les performances, et le frontend reconstruit de React vers Next.js. C'est le projet qui m'a appris qu'une bonne architecture se pense avant de coder — et comment rattraper le coup quand ce n'est pas le cas.",
    ],
    year: '2024',
    role: 'Conception & développement',
    tags: ['Web App', 'API', 'Open source'],
    tech: ['FastAPI', 'Python', 'Next.js', 'React'],
    links: [
      { label: 'API — GitHub', url: 'https://github.com/evanhgs/val-api' },
      { label: 'App — GitHub', url: 'https://github.com/evanhgs/val-webapp' },
    ],
    blogSlug: 'valenstagram',
  },
  {
    id: 'hibiki',
    name: 'Hibiki',
    tagline: 'Une application musicale construite en collectif.',
    description: [
      "Hibiki est une application musicale développée en organisation ouverte sur GitHub. Le projet explore le streaming et la gestion de bibliothèques musicales, avec une approche collaborative du développement.",
    ],
    year: '2025',
    role: 'Développement',
    tags: ['Musique', 'Open source'],
    tech: ['TypeScript'],
    links: [{ label: 'GitHub', url: 'https://github.com/Hibiki-music-app/hibiki' }],
  },
  {
    id: 'wipytest',
    name: 'Wipytest',
    tagline: 'Scanner Wi-Fi passif et analyse de vulnérabilités.',
    description: [
      "Wipytest est un outil de scan Wi-Fi passif et d'analyse de vulnérabilités réseau écrit en Python. Il écoute l'environnement radio sans émettre, cartographie les réseaux à portée et identifie les configurations à risque.",
      "Ce projet prolonge ma pratique de la cybersécurité offensive sur Root-Me et Hack The Box : comprendre les attaques pour mieux défendre.",
    ],
    year: '2024',
    role: 'Conception & développement',
    tags: ['Sécurité', 'Réseau', 'CLI'],
    tech: ['Python'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/wipytest' }],
  },
  {
    id: 'telebox',
    name: 'Telebox',
    tagline: 'Mon premier produit complet, de la licence au paiement.',
    description: [
      "Telebox est une application desktop Python de gestion de membres Telegram : scraping de membres de groupes publics et ajout automatisé, pilotés depuis une interface CustomTkinter.",
      "Au-delà du code, c'est mon premier vrai produit : backend Flask avec gestion de licences, paiements Stripe, distribution aux utilisateurs. J'y ai appris tout ce qui entoure un logiciel — l'authentification, la monétisation, le support. Le projet est aujourd'hui open source.",
    ],
    year: '2023',
    role: 'Conception, développement & produit',
    tags: ['Desktop', 'Produit', 'Automatisation'],
    tech: ['Python', 'CustomTkinter', 'Flask', 'Stripe', 'Telegram API'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/Telegram-scraper-adder-app' }],
    blogSlug: 'telebox',
  },
];

const PROJECTS_EN: Project[] = [
  {
    id: 'sae5-aramis',
    name: 'Aramis',
    tagline: 'Voice-guided, 3D-visualized warehouse picking.',
    description: [
      'Aramis is a warehouse picking management web app, built as a team project during the final year of my CS degree. Order pickers work hands-free, guided by voice recognition, with a 3D visualization of the warehouse for instant orientation.',
      'On the supervision side, a real-time dashboard gives managers a complete view of operations: picker progress, stock levels, missing products. Built on Next.js and PostgreSQL, with particular care given to interaction fluidity under real warehouse conditions.',
    ],
    year: '2026',
    role: 'Full-stack development',
    tags: ['Web App', 'Real-time', '3D'],
    tech: ['Next.js', 'PostgreSQL', 'Voice recognition', '3D visualization'],
    links: [{ label: 'GitLab', url: 'https://gitlab.iut-valence.fr/huguesev/sae5_aramis' }],
  },
  {
    id: 'rmce',
    name: 'RMCE',
    tagline: 'Strava, but for cars.',
    description: [
      'RMCE is a mobile app for open-road car driving: trip recording, timing, leaderboards — the Strava spirit applied to cars.',
      'I built the backend API in Rust for maximum performance and reliability, and the mobile app in Flutter to ship on iOS and Android from a single codebase. An ideal playground for pushing two demanding ecosystems in parallel.',
    ],
    year: '2025',
    role: 'Design & development',
    tags: ['Mobile', 'API', 'Rust'],
    tech: ['Rust', 'Flutter', 'REST API'],
    links: [
      { label: 'API — GitHub', url: 'https://github.com/evanhgs/rust-rmce-api' },
      { label: 'App — GitHub', url: 'https://github.com/evanhgs/rmce_app' },
    ],
  },
  {
    id: 'dashdust',
    name: 'Dashdust',
    tagline: 'A server dashboard powered by Rust and WebAssembly.',
    description: [
      'Dashdust is a server monitoring dashboard: simple, modern, and above all fast. The heart of the project is an obsession with performance — the backend and critical processing are written in Rust and compiled to WebAssembly to run at near-native speed.',
      'Born from my self-hosting practice, it answers a real need: monitoring my own machines with a lightweight tool, without the weight of enterprise solutions.',
    ],
    year: '2025',
    role: 'Design & development',
    tags: ['Dashboard', 'Rust', 'WebAssembly'],
    tech: ['Rust', 'WebAssembly'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/dashdust' }],
  },
  {
    id: 'turbo-selector',
    name: 'Turbo Selector',
    tagline: 'The 8 best possible NBA lineups, in under 500 ms.',
    description: [
      'A colleague had a problem: his PHP backend took over 3 seconds to generate the best NBA lineup for the Sorare fantasy game. I told him I could do better.',
      'Turbo Selector is a combinatorial optimization API: it uses linear programming (PuLP) to explore the space of possible lineups and return the 8 best teams in under 500 ms — roughly 6× faster than the original solution, with a mathematically optimal result.',
    ],
    year: '2024',
    role: 'Design & development',
    tags: ['API', 'Optimization', 'Data'],
    tech: ['Python', 'FastAPI', 'PuLP', 'Docker'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/turbo-selector' }],
    blogSlug: 'turbo-selector',
  },
  {
    id: 'valenstagram',
    name: 'Valenstagram',
    tagline: 'Rebuilding Instagram to master API architecture.',
    description: [
      'Valenstagram is an open-source Instagram clone: a complete RESTful API (users, posts, comments, authentication) and an SPA frontend. The goal: learn API design and modern frontend development in depth.',
      "The project went through two major, deliberate and documented rewrites: the API migrated from Flask to FastAPI for typing robustness and performance, and the frontend rebuilt from React to Next.js. It's the project that taught me that good architecture is designed before coding — and how to recover when it isn't.",
    ],
    year: '2024',
    role: 'Design & development',
    tags: ['Web App', 'API', 'Open source'],
    tech: ['FastAPI', 'Python', 'Next.js', 'React'],
    links: [
      { label: 'API — GitHub', url: 'https://github.com/evanhgs/val-api' },
      { label: 'App — GitHub', url: 'https://github.com/evanhgs/val-webapp' },
    ],
    blogSlug: 'valenstagram',
  },
  {
    id: 'hibiki',
    name: 'Hibiki',
    tagline: 'A music app built as a collective.',
    description: [
      'Hibiki is a music application developed in an open organization on GitHub. The project explores streaming and music library management, with a collaborative approach to development.',
    ],
    year: '2025',
    role: 'Development',
    tags: ['Music', 'Open source'],
    tech: ['TypeScript'],
    links: [{ label: 'GitHub', url: 'https://github.com/Hibiki-music-app/hibiki' }],
  },
  {
    id: 'wipytest',
    name: 'Wipytest',
    tagline: 'Passive Wi-Fi scanning and vulnerability analysis.',
    description: [
      'Wipytest is a passive Wi-Fi scanning and network vulnerability analysis tool written in Python. It listens to the radio environment without transmitting, maps networks in range and flags risky configurations.',
      'This project extends my offensive security practice on Root-Me and Hack The Box: understanding attacks to defend better.',
    ],
    year: '2024',
    role: 'Design & development',
    tags: ['Security', 'Network', 'CLI'],
    tech: ['Python'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/wipytest' }],
  },
  {
    id: 'telebox',
    name: 'Telebox',
    tagline: 'My first complete product, from licensing to payments.',
    description: [
      'Telebox is a Python desktop app for Telegram member management: scraping members from public groups and automated adding, driven from a CustomTkinter interface.',
      "Beyond the code, it's my first real product: a Flask backend with license management, Stripe payments, distribution to users. It taught me everything that surrounds software — authentication, monetization, support. The project is now open source.",
    ],
    year: '2023',
    role: 'Design, development & product',
    tags: ['Desktop', 'Product', 'Automation'],
    tech: ['Python', 'CustomTkinter', 'Flask', 'Stripe', 'Telegram API'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/Telegram-scraper-adder-app' }],
    blogSlug: 'telebox',
  },
];

export const content: Record<Locale, SiteContent> = {
  fr: {
    meta: {
      title: 'Evan Hugues — Développeur full-stack',
      description:
        'Portfolio d’Evan Hugues, développeur full-stack titulaire d’un BUT Informatique (bac+3). Python, TypeScript, Rust — applications web rapides, robustes et sécurisées.',
    },
    hero: {
      kicker: 'Développeur full-stack — Cybersécurité & self-hosting',
      statement:
        'Je conçois des applications rapides, robustes et sécurisées — de l’API au pixel, du code au serveur qui l’héberge.',
    },
    ticker: [
      'Disponible',
      'Full-stack',
      'Python',
      'TypeScript',
      'Rust',
      'Cybersécurité',
      'Self-hosting',
    ],
    about: {
      teaser:
        'Titulaire d’un BUT Informatique (bac+3), je développe en Python, TypeScript, PHP et Rust. J’héberge et j’exploite mes propres architectures de production, et je pratique la sécurité offensive sur Root-Me et Hack The Box.',
      paragraphs: [
        'Je suis Evan Hugues, développeur full-stack titulaire d’un BUT Informatique (bac+3). Je construis des applications web de bout en bout : conception d’API, bases de données, interfaces, déploiement et exploitation.',
        'Ce qui me distingue : je ne m’arrête pas au code. Passionné de self-hosting, j’héberge de nombreuses applications sur mon serveur personnel et j’y conçois des architectures proches de la production — reverse proxy, CI/CD, conteneurs, monitoring. Mes projets ne vivent pas que sur GitHub : ils tournent, en vrai, et je les opère.',
        'La cybersécurité traverse tout ce que je fais. Actif sur Root-Me et Hack The Box, j’aborde chaque application avec un réflexe : comment pourrait-on la casser ? C’est la meilleure façon de construire des systèmes qui tiennent.',
      ],
      education: {
        degree: 'BUT Informatique — bac+3',
        detail: 'IUT de Valence · Diplômé',
      },
    },
    capabilities: [
      {
        title: 'Développement',
        items: ['Python', 'TypeScript / JavaScript', 'Rust', 'PHP', 'Java', 'SQL', 'FastAPI · Flask', 'Next.js · React', 'Symfony · Spring Boot', 'Axum · Flutter'],
      },
      {
        title: 'Infrastructure & DevOps',
        items: ['Docker · Compose', 'Linux', 'PostgreSQL', 'CI/CD — GitHub & GitLab runners', 'Cloudflare', 'Nginx', 'Self-hosting & homelab'],
      },
      {
        title: 'Sécurité',
        items: ['Sécurité offensive', 'Analyse réseau', 'Hack The Box', 'Root-Me', 'Durcissement d’applications'],
      },
    ],
    contact: CONTACT,
    projects: PROJECTS_FR,
  },

  en: {
    meta: {
      title: 'Evan Hugues — Full-stack developer',
      description:
        'Portfolio of Evan Hugues, full-stack developer with a 3-year CS degree (BUT Informatique). Python, TypeScript, Rust — fast, robust and secure web applications.',
    },
    hero: {
      kicker: 'Full-stack developer — Cybersecurity & self-hosting',
      statement:
        'I build fast, robust and secure applications — from API to pixel, from the code to the server that runs it.',
    },
    ticker: [
      'Available',
      'Full-stack',
      'Python',
      'TypeScript',
      'Rust',
      'Cybersecurity',
      'Self-hosting',
    ],
    about: {
      teaser:
        'Holder of a 3-year CS degree (BUT Informatique), I develop in Python, TypeScript, PHP and Rust. I host and operate my own production-grade architectures, and practice offensive security on Root-Me and Hack The Box.',
      paragraphs: [
        'I’m Evan Hugues, a full-stack developer holding a BUT Informatique — a 3-year French CS degree. I build web applications end to end: API design, databases, interfaces, deployment and operations.',
        'What sets me apart: I don’t stop at the code. Passionate about self-hosting, I run many applications on my personal server and design production-grade architectures there — reverse proxy, CI/CD, containers, monitoring. My projects don’t just live on GitHub: they run, for real, and I operate them.',
        'Cybersecurity runs through everything I do. Active on Root-Me and Hack The Box, I approach every application with one reflex: how could it be broken? It’s the best way to build systems that hold.',
      ],
      education: {
        degree: 'BUT Informatique — 3-year CS degree',
        detail: 'IUT de Valence · Graduated',
      },
    },
    capabilities: [
      {
        title: 'Development',
        items: ['Python', 'TypeScript / JavaScript', 'Rust', 'PHP', 'Java', 'SQL', 'FastAPI · Flask', 'Next.js · React', 'Symfony · Spring Boot', 'Axum · Flutter'],
      },
      {
        title: 'Infrastructure & DevOps',
        items: ['Docker · Compose', 'Linux', 'PostgreSQL', 'CI/CD — GitHub & GitLab runners', 'Cloudflare', 'Nginx', 'Self-hosting & homelab'],
      },
      {
        title: 'Security',
        items: ['Offensive security', 'Network analysis', 'Hack The Box', 'Root-Me', 'Application hardening'],
      },
    ],
    contact: CONTACT,
    projects: PROJECTS_EN,
  },
};
