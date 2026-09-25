// Défilement doux (Lenis) : desktop à pointeur fin, animations actives.
// Lenis garde le défilement natif du document, donc position: sticky marche.
import Lenis from 'lenis';
import { prefs } from './prefs';
import { onTick } from './ticker';

let lenis: Lenis | null = null;
let stopTick: (() => void) | null = null;

export function startSmoothScroll(): Lenis | null {
	if (lenis || prefs.reducedMotion || !matchMedia('(pointer: fine)').matches) return lenis;
	lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: 0.11, anchors: true });
	stopTick = onTick((t) => lenis?.raf(t * 1000));
	return lenis;
}

export function stopSmoothScroll() {
	stopTick?.();
	stopTick = null;
	lenis?.destroy();
	lenis = null;
}

export const getLenis = () => lenis;

prefs.onChange(() => (prefs.reducedMotion ? stopSmoothScroll() : startSmoothScroll()));
