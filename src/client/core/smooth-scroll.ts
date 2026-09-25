// Défilement doux (Lenis) : desktop à pointeur fin, animations actives.
// Lenis garde le défilement natif du document, donc position: sticky marche.
// Chargé à la demande : ni les mobiles ni les visiteurs en « animations
// réduites » ne le téléchargent, et il ne pèse pas sur le premier affichage.
import type Lenis from 'lenis';
import { prefs } from './prefs';
import { onTick } from './ticker';

let lenis: Lenis | null = null;
let loading: Promise<Lenis | null> | null = null;
let stopTick: (() => void) | null = null;

const wanted = () => !prefs.reducedMotion && matchMedia('(pointer: fine)').matches;

export function startSmoothScroll(): Promise<Lenis | null> {
	if (lenis || !wanted()) return Promise.resolve(lenis);
	loading ??= import('lenis')
		.then(({ default: LenisClass }) => {
			if (!lenis && wanted()) {
				lenis = new LenisClass({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: 0.11, anchors: true });
				stopTick = onTick((t) => lenis?.raf(t * 1000));
			}
			return lenis;
		})
		.catch(() => null)
		.finally(() => (loading = null));
	return loading;
}

export function stopSmoothScroll() {
	stopTick?.();
	stopTick = null;
	lenis?.destroy();
	lenis = null;
}

export const getLenis = () => lenis;

prefs.onChange(() => (prefs.reducedMotion ? stopSmoothScroll() : void startSmoothScroll()));
