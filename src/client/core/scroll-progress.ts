// Progression d'une scène « sticky » (0 → 1) pendant qu'elle défile, lissée,
// exposée en CSS (--p, data-station) et aux scripts (WebGL).
import { damp, onTick } from './ticker';

export interface Station {
	name: string;
	/** Progression à partir de laquelle la station commence. */
	from: number;
}

export interface SceneTracker {
	readonly progress: number;
	readonly station: string;
	onUpdate(fn: (p: number, dt: number) => void): void;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function trackScene(el: HTMLElement, stations: Station[]): SceneTracker {
	let top = 0;
	let span = 1;
	const measure = () => {
		const r = el.getBoundingClientRect();
		top = r.top + scrollY;
		span = Math.max(1, el.offsetHeight - innerHeight);
	};
	measure();
	new ResizeObserver(measure).observe(el);
	addEventListener('resize', measure, { passive: true });

	const raw = () => clamp01((scrollY - top) / span);
	let smooth = raw();
	let station = '';
	const listeners: ((p: number, dt: number) => void)[] = [];

	const apply = (dt: number) => {
		smooth = dt > 0 ? damp(smooth, raw(), 9, dt) : raw();
		el.style.setProperty('--p', smooth.toFixed(4));
		const current = stations.reduce((acc, s) => (smooth >= s.from ? s.name : acc), stations[0].name);
		if (current !== station) {
			station = current;
			el.dataset.station = current;
		}
		for (const fn of listeners) fn(smooth, dt);
	};
	apply(0);

	// On ne calcule que lorsque la scène est à l'écran.
	let stop: (() => void) | null = null;
	new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting && !stop) stop = onTick((_t, dt) => apply(dt));
		else if (!entry.isIntersecting && stop) {
			stop();
			stop = null;
		}
	}).observe(el);

	return {
		get progress() {
			return smooth;
		},
		get station() {
			return station;
		},
		onUpdate(fn) {
			listeners.push(fn);
		},
	};
}
