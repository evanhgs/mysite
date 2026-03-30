export type Locale = 'fr' | 'en';

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
  links: ProjectLink[];
  blogSlug?: string;
}

export interface SiteContent {
  whoami: string;
  about: string[];
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
  };
  contact: {
    github: string;
    linkedin: string;
    htb: string;
  };
  projects: Project[];
  welcome: string[];
  help: string[];
}

const PROJECTS_FR: Project[] = [
  {
    id: 'sae5-aramis',
    name: 'SAE 5 Aramis',
    description:
      "Application web de gestion de picking entrepôt. Les préparateurs traitent des supports guidés par reconnaissance vocale et visualisation 3D. Les superviseurs pilotent en temps réel l'activité, les stocks et les manquants.",
    tech: ['Next.js', 'PostgreSQL', 'Reconnaissance vocale', 'Visualisation 3D'],
    links: [{ label: 'GitLab', url: 'https://gitlab.iut-valence.fr/huguesev/sae5_aramis' }],
  },
  {
    id: 'rmce',
    name: 'RMCE',
    description:
      "Application mobile de course automobile, comme Strava mais pour les voitures sur routes ouvertes. API backend en Rust, application mobile en Flutter.",
    tech: ['Rust', 'Flutter', 'REST API'],
    links: [
      { label: 'API GitHub', url: 'https://github.com/evanhgs/rust-rmce-api' },
      { label: 'App GitHub', url: 'https://github.com/evanhgs/rmce_app' },
    ],
  },
  {
    id: 'valenstagram',
    name: 'Valenstagram',
    description:
      "Reproduction d'Instagram avec une API RESTful et un frontend React. Refactorisé de Flask vers FastAPI pour de meilleures performances. Frontend refait avec Next.js.",
    tech: ['FastAPI', 'React', 'Next.js', 'Python'],
    links: [
      { label: 'API GitHub', url: 'https://github.com/evanhgs/val-api' },
      { label: 'App GitHub', url: 'https://github.com/evanhgs/val-webapp' },
    ],
    blogSlug: 'valenstagram',
  },
  {
    id: 'telebox',
    name: 'Telebox',
    description:
      "Application desktop Python pour scraper des membres Telegram et les ajouter dans des groupes. Frontend CustomTkinter, backend Flask avec gestion de licences et paiements Stripe. Aujourd'hui open source.",
    tech: ['Python', 'CustomTkinter', 'Flask', 'Stripe', 'Telegram API'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/Telegram-scraper-adder-app' }],
    blogSlug: 'telebox',
  },
  {
    id: 'hibiki',
    name: 'Hibiki',
    description: "Application musicale.",
    tech: [],
    links: [{ label: 'GitHub', url: 'https://github.com/Hibiki-music-app/hibiki' }],
  },
  {
    id: 'dashdust',
    name: 'Dashdust',
    description:
      "Dashboard serveur simple, puissant et moderne. Optimisé grâce à Rust et WebAssembly pour des performances maximales.",
    tech: ['Rust', 'WebAssembly'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/dashdust' }],
  },
  {
    id: 'turbo-selector',
    name: 'Turbo Selector',
    description:
      "API d'optimisation de sélection de joueurs NBA pour le jeu Sorare. Utilise la programmation linéaire (PuLP) pour générer les 8 meilleures équipes possibles en moins de 500ms.",
    tech: ['Python', 'FastAPI', 'PuLP', 'Docker'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/turbo-selector' }],
    blogSlug: 'turbo-selector',
  },
  {
    id: 'wipytest',
    name: 'Wipytest',
    description: "Application de scan Wi-Fi passif et d'analyse de vulnérabilités réseau.",
    tech: ['Python'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/wipytest' }],
  },
];

const PROJECTS_EN: Project[] = [
  {
    id: 'sae5-aramis',
    name: 'SAE 5 Aramis',
    description:
      'Warehouse picking management web app. Workers follow voice-guided picking with 3D visualization. Supervisors monitor activity, stock, and shortages in real time.',
    tech: ['Next.js', 'PostgreSQL', 'Voice Recognition', '3D Visualization'],
    links: [{ label: 'GitLab', url: 'https://gitlab.iut-valence.fr/huguesev/sae5_aramis' }],
  },
  {
    id: 'rmce',
    name: 'RMCE',
    description:
      'Mobile car racing app, like Strava but for cars on open roads. Rust backend API, Flutter mobile app.',
    tech: ['Rust', 'Flutter', 'REST API'],
    links: [
      { label: 'API GitHub', url: 'https://github.com/evanhgs/rust-rmce-api' },
      { label: 'App GitHub', url: 'https://github.com/evanhgs/rmce_app' },
    ],
  },
  {
    id: 'valenstagram',
    name: 'Valenstagram',
    description:
      'Instagram clone built to learn RESTful API design. Refactored from Flask to FastAPI for better performance. Frontend rebuilt with Next.js.',
    tech: ['FastAPI', 'React', 'Next.js', 'Python'],
    links: [
      { label: 'API GitHub', url: 'https://github.com/evanhgs/val-api' },
      { label: 'App GitHub', url: 'https://github.com/evanhgs/val-webapp' },
    ],
    blogSlug: 'valenstagram',
  },
  {
    id: 'telebox',
    name: 'Telebox',
    description:
      'Python desktop app to scrape Telegram group members and add them to other groups. CustomTkinter UI, Flask backend with license management and Stripe payments. Now open source.',
    tech: ['Python', 'CustomTkinter', 'Flask', 'Stripe', 'Telegram API'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/Telegram-scraper-adder-app' }],
    blogSlug: 'telebox',
  },
  {
    id: 'hibiki',
    name: 'Hibiki',
    description: 'Music application.',
    tech: [],
    links: [{ label: 'GitHub', url: 'https://github.com/Hibiki-music-app/hibiki' }],
  },
  {
    id: 'dashdust',
    name: 'Dashdust',
    description:
      'Simple, powerful, modern server dashboard. Optimized with Rust and WebAssembly for maximum performance.',
    tech: ['Rust', 'WebAssembly'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/dashdust' }],
  },
  {
    id: 'turbo-selector',
    name: 'Turbo Selector',
    description:
      'NBA player selection optimization API for Sorare. Uses linear programming (PuLP) to generate the 8 best possible teams in under 500ms.',
    tech: ['Python', 'FastAPI', 'PuLP', 'Docker'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/turbo-selector' }],
    blogSlug: 'turbo-selector',
  },
  {
    id: 'wipytest',
    name: 'Wipytest',
    description: 'Passive Wi-Fi scanning and network vulnerability analysis tool.',
    tech: ['Python'],
    links: [{ label: 'GitHub', url: 'https://github.com/evanhgs/wipytest' }],
  },
];

export const content: Record<Locale, SiteContent> = {
  fr: {
    whoami: 'Evan Hugues - développeur full-stack, passionné de cybersécurité et de self-hosting.',
    about: [
      'Bienvenue sur mon portfolio interactif.',
      '',
      "Je suis un jeune développeur issu d'un BUT Informatique (bac +3).",
      'Je développe principalement des applications en Python, TypeScript, PHP et Rust.',
      'Je maîtrise également plusieurs frameworks : Flask, FastAPI, Next.js et Symfony.',
      '',
      'Je suis passionné par le self-hosting : j\'héberge de nombreuses applications',
      'et conçois des architectures proches de la production sur mon serveur personnel.',
      '',
      'Je m\'intéresse particulièrement à la cybersécurité.',
      'Je suis actif sur Root-Me et Hack The Box.',
    ],
    skills: {
      languages:  ['Python', 'JavaScript/TypeScript', 'PHP', 'Rust', 'React', 'Html/css/tailwindcss', 'SQL', 'Java'],
      frameworks: ['Flask', 'FastAPI', 'Next.js', 'Symfony', 'Springboot', 'Axum'],
      tools:      ['Docker/Docker compose', 'Git', 'Linux', 'PostgreSQL', 'Github/Gitlab runner', 'Cloudflare', 'MCP'],
    },
    contact: {
      github:   'https://github.com/evanhgs',
      linkedin: 'https://www.linkedin.com/in/evanhugues/',
      htb:      'https://profile.hackthebox.com/profile/019d1fae-bea8-70cc-976c-77909e028c23',
    },
    projects: PROJECTS_FR,
    welcome: [
      '  ███████╗██╗   ██╗ █████╗ ███╗   ██╗',
      '  ██╔════╝██║   ██║██╔══██╗████╗  ██║',
      '  █████╗  ██║   ██║███████║██╔██╗ ██║',
      '  ██╔══╝  ╚██╗ ██╔╝██╔══██║██║╚██╗██║',
      '  ███████╗ ╚████╔╝ ██║  ██║██║ ╚████║',
      '  ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝',
      '',
      '  ██╗  ██╗██╗   ██╗ ██████╗ ██╗   ██╗███████╗███████╗',
      '  ██║  ██║██║   ██║██╔════╝ ██║   ██║██╔════╝██╔════╝',
      '  ███████║██║   ██║██║  ███╗██║   ██║█████╗  ███████╗',
      '  ██╔══██║██║   ██║██║   ██║██║   ██║██╔══╝  ╚════██║',
      '  ██║  ██║╚██████╔╝╚██████╔╝╚██████╔╝███████╗███████║',
      '  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚══════╝',
      '',
      '  evan@portfolio:~  [FR]  v1.0.0',
      '  ─────────────────────────────────────────────────────',
      "  Tapez 'help' pour voir les commandes disponibles.",
      '',
    ],
    help: [
      'Commandes disponibles :',
      '',
      '  help             - afficher cette aide',
      '  whoami           - qui suis-je ?',
      '  about            - en savoir plus sur moi',
      '  skills           - mes compétences techniques',
      '  projects         - liste de mes projets',
      '  project <id>     - détails d\'un projet  (ex: project telebox)',
      '  games            - mes projets de jeux',
      '  blog             - liste des articles de blog',
      '  blog <n|slug>    - lire un article  (ex: blog 1, blog telebox)',
      '  contact          - mes liens de contact',
      '  cv               - télécharger mon CV (PDF)',
      '  lang <fr|en>     - changer de langue',
      '  clear            - vider le terminal',
      '',
      '  Ctrl+C  annuler la saisie',
      '  Ctrl+L  vider le terminal',
      '  ↑ ↓     naviguer dans l\'historique',
      '  Tab     autocomplétion',
    ],
  },

  en: {
    whoami: 'Evan Hugues - full-stack developer, cybersecurity enthusiast and self-hoster.',
    about: [
      'Welcome to my interactive portfolio.',
      '',
      'I am a young developer with a 3-year Computer Science degree (BUT Informatique).',
      'I mainly develop applications in Python, TypeScript, PHP and Rust.',
      'I am also proficient in several frameworks: Flask, FastAPI, Next.js and Symfony.',
      '',
      'I am passionate about self-hosting: I run many applications',
      'and build production-like architectures on my personal server.',
      '',
      'I have a strong interest in cybersecurity.',
      'I am active on Root-Me and Hack The Box.',
    ],
    skills: {
      languages:  ['Python', 'TypeScript', 'PHP', 'Rust'],
      frameworks: ['Flask', 'FastAPI', 'Next.js', 'Symfony'],
      tools:      ['Docker', 'Git', 'Linux', 'PostgreSQL', 'WebAssembly', 'Flutter'],
    },
    contact: {
      github:   'https://github.com/evanhgs',
      linkedin: 'https://www.linkedin.com/in/evanhugues/',
      htb:      'https://profile.hackthebox.com/profile/019d1fae-bea8-70cc-976c-77909e028c23',
    },
    projects: PROJECTS_EN,
    welcome: [
      '  ███████╗██╗   ██╗ █████╗ ███╗   ██╗',
      '  ██╔════╝██║   ██║██╔══██╗████╗  ██║',
      '  █████╗  ██║   ██║███████║██╔██╗ ██║',
      '  ██╔══╝  ╚██╗ ██╔╝██╔══██║██║╚██╗██║',
      '  ███████╗ ╚████╔╝ ██║  ██║██║ ╚████║',
      '  ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝',
      '',
      '  ██╗  ██╗██╗   ██╗ ██████╗ ██╗   ██╗███████╗███████╗',
      '  ██║  ██║██║   ██║██╔════╝ ██║   ██║██╔════╝██╔════╝',
      '  ███████║██║   ██║██║  ███╗██║   ██║█████╗  ███████╗',
      '  ██╔══██║██║   ██║██║   ██║██║   ██║██╔══╝  ╚════██║',
      '  ██║  ██║╚██████╔╝╚██████╔╝╚██████╔╝███████╗███████║',
      '  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚══════╝',
      
      '',
      '  evan@portfolio:~  [EN]  v1.0.0',
      '  ─────────────────────────────────────────────────────',
      "  Type 'help' to see available commands.",
      '',
    ],
    help: [
      'Available commands:',
      '',
      '  help             - show this help',
      '  whoami           - who am I?',
      '  about            - learn more about me',
      '  skills           - my technical skills',
      '  projects         - list my projects',
      '  project <id>     - project details  (e.g. project telebox)',
      '  games            - my game projects',
      '  blog             - list blog posts',
      '  blog <n|slug>    - read a post  (e.g. blog 1, blog telebox)',
      '  contact          - my contact links',
      '  cv               - download my CV (PDF)',
      '  lang <fr|en>     - switch language',
      '  clear            - clear the terminal',
      '',
      '  Ctrl+C  cancel input',
      '  Ctrl+L  clear terminal',
      '  ↑ ↓     navigate history',
      '  Tab     autocomplete',
    ],
  },
};
