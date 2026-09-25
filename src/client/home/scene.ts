// Scène WebGL de l'accueil (implémentée à l'étape suivante).
import type { SceneTracker } from '../core/scroll-progress';

export async function startScene(_el: HTMLElement, _tracker: SceneTracker) {
	document.documentElement.dataset.gl = 'fallback';
}
