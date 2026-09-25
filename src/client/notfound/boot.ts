// Page 404 : l'escalier de Penrose passe en WebGL si les animations sont
// permises ; sinon (ou en attendant), le poster SVG reste affiché.
import { prefs } from '../core/prefs';
import { webgl2Available } from '../gl/support';

const stage = document.querySelector<HTMLElement>('[data-stairs]');
const canvas = stage?.querySelector('canvas');

if (stage && canvas) {
	let started = false;
	const sync = () => stage.toggleAttribute('data-ready', started && !prefs.reducedMotion);

	if (!prefs.reducedMotion && !prefs.saveData && webgl2Available()) {
		import('../gl/stairs/scene')
			.then(({ startStairs }) =>
				startStairs(canvas, {
					host: stage,
					reducedMotion: () => prefs.reducedMotion,
					onReady: () => {
						started = true;
						sync();
					},
				}),
			)
			.catch((err) => console.error(err));
	}
	prefs.onChange(sync);
}
