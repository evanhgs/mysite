// Accueil : active la scène au défilement (si les animations sont permises),
// puis charge la scène WebGL après le premier affichage, sans bloquer le LCP.
import { prefs } from '../core/prefs';
import { trackScene, type SceneTracker, type Station } from '../core/scroll-progress';

export const STATIONS: Station[] = [
	{ name: 'nom', from: 0 },
	{ name: 'revelation', from: 0.16 },
	{ name: 'vertigo', from: 0.38 },
	{ name: 'triangle', from: 0.58 },
	{ name: 'faille', from: 0.76 },
	{ name: 'sortie', from: 0.94 },
];

function webgl2Available(): boolean {
	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2');
		gl?.getExtension('WEBGL_lose_context')?.loseContext();
		return Boolean(gl);
	} catch {
		return false;
	}
}

const whenIdle = (fn: () => void) =>
	requestAnimationFrame(() =>
		requestAnimationFrame(() =>
			'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 250),
		),
	);

const scene = document.querySelector<HTMLElement>('[data-scene]');
const root = document.documentElement;

if (scene) {
	let tracker: SceneTracker | null = null;
	let loading = false;

	const sync = () => {
		const live = !prefs.reducedMotion && !prefs.saveData;
		scene.classList.toggle('is-live', live);
		if (!live) return;
		tracker ??= trackScene(scene, STATIONS);
		if (loading) return;
		loading = true;
		if (!webgl2Available()) {
			root.dataset.gl = 'fallback';
			return;
		}
		root.dataset.gl = 'pending';
		whenIdle(() => {
			import('./scene')
				.then(({ startScene }) => startScene(scene, tracker!))
				.catch((err) => {
					console.error(err);
					root.dataset.gl = 'fallback';
				});
		});
	};

	sync();
	prefs.onChange(sync);
}
