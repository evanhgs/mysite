// Boucle d'animation unique, partagée par Lenis, les scènes WebGL et les
// petites animations. S'arrête quand l'onglet est caché ou la page quittée.
type Tick = (time: number, dt: number) => void;

const subs = new Set<Tick>();
let raf = 0;
let last = 0;
let running = false;

function frame(now: number) {
	// L'horodatage de rAF peut précéder le performance.now() pris au démarrage :
	// sans ce plancher, la première image aurait un dt négatif.
	const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
	last = now;
	for (const fn of subs) fn(now / 1000, dt);
	raf = requestAnimationFrame(frame);
}

function start() {
	if (running || subs.size === 0 || document.hidden) return;
	running = true;
	last = performance.now();
	raf = requestAnimationFrame(frame);
}

function stop() {
	running = false;
	cancelAnimationFrame(raf);
}

document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
addEventListener('pagehide', stop);
addEventListener('pageshow', start);

/** Abonne une fonction à la boucle ; renvoie la fonction de désabonnement. */
export function onTick(fn: Tick): () => void {
	subs.add(fn);
	start();
	return () => {
		subs.delete(fn);
		if (subs.size === 0) stop();
	};
}

/** Amortissement exponentiel indépendant de la fréquence d'affichage. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
	target + (current - target) * Math.exp(-lambda * dt);
