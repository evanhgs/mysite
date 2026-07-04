import type { Locale } from '../data/content';

export const routes: Record<Locale, {
  home: string;
  projects: string;
  about: string;
  blog: string;
}> = {
  fr: {
    home: '/fr/',
    projects: '/fr/projets/',
    about: '/fr/about/',
    blog: '/fr/blog/',
  },
  en: {
    home: '/en/',
    projects: '/en/projects/',
    about: '/en/about/',
    blog: '/en/blog/',
  },
};

export function projectUrl(locale: Locale, id: string): string {
  return `${routes[locale].projects}${id}/`;
}

export function blogPostUrl(locale: Locale, slug: string): string {
  return `${routes[locale].blog}${slug}/`;
}

export const ui: Record<Locale, Record<string, string>> = {
  fr: {
    'nav.projects': 'Projets',
    'nav.about': 'À propos',
    'nav.blog': 'Journal',
    'nav.contact': 'Contact',
    'home.selectedWork': 'Projets sélectionnés',
    'home.allProjects': 'Tous les projets',
    'home.aboutLabel': 'À propos',
    'home.moreAbout': 'En savoir plus',
    'home.capabilities': 'Compétences',
    'project.label': 'Projet',
    'project.year': 'Année',
    'project.role': 'Rôle',
    'project.stack': 'Stack',
    'project.links': 'Liens',
    'project.readPost': 'Lire l’article du journal',
    'project.next': 'Projet suivant',
    'project.backToProjects': 'Tous les projets',
    'projects.title': 'Projets',
    'projects.intro': 'Huit projets, huit problèmes réels — du picking d’entrepôt à l’optimisation combinatoire.',
    'about.title': 'À propos',
    'about.education': 'Formation',
    'about.skills': 'Compétences',
    'blog.title': 'Journal',
    'blog.intro': 'Les coulisses de mes projets : décisions, refontes, leçons.',
    'blog.read': 'Lire',
    'blog.frOnly': 'Écrit en français',
    'blog.back': 'Journal',
    'blog.updated': 'Mis à jour le',
    'footer.cta': 'Travaillons ensemble',
    'footer.ctaSub': 'Un projet, une opportunité, une question ?',
    'footer.rights': 'Tous droits réservés',
    'footer.madeWith': 'Site statique — zéro JavaScript, 100 % artisanal',
    'notfound.title': 'Page introuvable',
    'notfound.back': 'Retour à l’accueil',
    'lang.switch': 'EN',
    'lang.switchLabel': 'Switch to English',
  },
  en: {
    'nav.projects': 'Work',
    'nav.about': 'About',
    'nav.blog': 'Journal',
    'nav.contact': 'Contact',
    'home.selectedWork': 'Selected work',
    'home.allProjects': 'All projects',
    'home.aboutLabel': 'About',
    'home.moreAbout': 'More about me',
    'home.capabilities': 'Capabilities',
    'project.label': 'Project',
    'project.year': 'Year',
    'project.role': 'Role',
    'project.stack': 'Stack',
    'project.links': 'Links',
    'project.readPost': 'Read the journal post',
    'project.next': 'Next project',
    'project.backToProjects': 'All projects',
    'projects.title': 'Work',
    'projects.intro': 'Eight projects, eight real problems — from warehouse picking to combinatorial optimization.',
    'about.title': 'About',
    'about.education': 'Education',
    'about.skills': 'Skills',
    'blog.title': 'Journal',
    'blog.intro': 'Behind the scenes of my projects: decisions, rewrites, lessons.',
    'blog.read': 'Read',
    'blog.frOnly': 'Written in French',
    'blog.back': 'Journal',
    'blog.updated': 'Updated on',
    'footer.cta': 'Let’s work together',
    'footer.ctaSub': 'A project, an opportunity, a question?',
    'footer.rights': 'All rights reserved',
    'footer.madeWith': 'Static site — zero JavaScript, fully handcrafted',
    'notfound.title': 'Page not found',
    'notfound.back': 'Back home',
    'lang.switch': 'FR',
    'lang.switchLabel': 'Passer en français',
  },
};

export function t(locale: Locale, key: string): string {
  return ui[locale][key] ?? key;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'fr' ? 'en' : 'fr';
}
