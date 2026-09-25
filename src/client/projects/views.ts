// /projets/ : vue « Liste » (HTML : référencement, lecteurs d'écran, clavier)
// ou « Grille » (WebGL). La liste reste dans le DOM dans les deux cas ; le
// choix est mémorisé. Par défaut : grille sur grand écran à pointeur fin.
import { prefs } from '../core/prefs';
import { webgl2Available } from '../gl/support';
import type { GridItem, LensGrid } from '../gl/grid/lens-grid';

type Vue = 'liste' | 'grille';
const KEY = 'projets:vue';
const root = document.documentElement;

const stageEl = document.querySelector<HTMLElement>('[data-grid]');
const pin = stageEl?.querySelector<HTMLElement>('[data-grid-pin]');
const canvas = stageEl?.querySelector<HTMLCanvasElement>('canvas');
const caption = stageEl?.querySelector<HTMLElement>('[data-grid-caption]');
const switcher = document.querySelector<HTMLElement>('[data-views]');
const buttons = [...(switcher?.querySelectorAll<HTMLButtonElement>('button[data-view]') ?? [])];

const isVue = (v: string | null | undefined): v is Vue => v === 'liste' || v === 'grille';

function stored(): Vue | null {
	try {
		const v = localStorage.getItem(KEY);
		return isVue(v) ? v : null;
	} catch {
		return null;
	}
}

function store(v: Vue) {
	try {
		localStorage.setItem(KEY, v);
	} catch {
		/* stockage indisponible : choix limité à la page */
	}
}

const items: GridItem[] = [...document.querySelectorAll<HTMLAnchorElement>('[data-project-list] a[data-slug]')].map((a) => ({
	slug: a.dataset.slug!,
	title: a.querySelector('.title')?.textContent?.trim() ?? '',
	meta: a.dataset.meta ?? '',
	tagline: a.querySelector('.tagline')?.textContent?.trim() ?? '',
	accent: a.dataset.accent ?? '#ececec',
	href: a.pathname,
}));

if (stageEl && pin && canvas && caption && switcher && items.length) {
	let gl = webgl2Available();
	let grid: Promise<LensGrid | null> | null = null;
	const allowed = () => gl && !prefs.reducedMotion;
	const preferred = (): Vue =>
		stored() ?? (matchMedia('(pointer: fine) and (min-width: 60rem)').matches && !prefs.saveData ? 'grille' : 'liste');

	// Défilement absorbé par le bloc collant : c'est l'axe vertical de la grille.
	const scrollOffset = () => {
		const r = stageEl.getBoundingClientRect();
		return Math.min(Math.max(-r.top, 0), Math.max(0, r.height - pin.offsetHeight));
	};

	const hint = caption.innerHTML;
	const showCaption = (item: GridItem | null) => {
		if (!item) {
			caption.innerHTML = hint;
			return;
		}
		const title = document.createElement('strong');
		title.textContent = item.title;
		const tagline = document.createElement('span');
		tagline.textContent = item.tagline;
		caption.replaceChildren(title, tagline);
	};

	const start = async (): Promise<LensGrid | null> => {
		try {
			const { createLensGrid } = await import('../gl/grid/lens-grid');
			const g = await createLensGrid(canvas, items, {
				host: pin,
				scrollOffset,
				reducedMotion: () => prefs.reducedMotion,
				onHover: showCaption,
				onOpen: (item) => location.assign(item.href),
				onReady: () => (stageEl.dataset.ready = ''),
			});
			if (!g) throw new Error('WebGL2 indisponible');
			return g;
		} catch (err) {
			console.error(err);
			gl = false;
			show('liste');
			return null;
		}
	};

	function show(v: Vue) {
		if (v === 'grille' && !allowed()) v = 'liste';
		root.dataset.vue = v;
		switcher!.hidden = !allowed();
		for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.view === v));
		if (v !== 'grille') return;
		if (grid) void grid.then((g) => g?.intro());
		else grid = start();
	}

	// ?vue=grille ou ?vue=liste : lien direct vers une vue, mémorisée ensuite.
	const params = new URLSearchParams(location.search);
	const asked = params.get('vue');
	if (isVue(asked)) {
		store(asked);
		params.delete('vue');
		const query = params.toString();
		history.replaceState(history.state, '', location.pathname + (query ? `?${query}` : '') + location.hash);
	}
	show(preferred());

	for (const b of buttons) {
		b.addEventListener('click', () => {
			const v = b.dataset.view;
			if (!isVue(v) || v === root.dataset.vue) return;
			store(v);
			const swap = () => {
				show(v);
				// Le haut de la vue choisie, sous le titre de la page.
				const target = v === 'grille' ? stageEl : document.querySelector('[data-list]');
				if (target && target.getBoundingClientRect().top < 0) target.scrollIntoView({ block: 'start' });
			};
			if (document.startViewTransition && !prefs.reducedMotion) document.startViewTransition(swap);
			else swap();
		});
	}

	prefs.onChange(() => show(preferred()));
}
