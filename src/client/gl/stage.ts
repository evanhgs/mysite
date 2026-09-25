// Cycle de vie d'un rendu WebGL2 : DPR plafonné et adaptatif, redimensionnement,
// pause hors écran, perte de contexte. Rendu à la demande via la boucle commune.
import { WebGLRenderer } from 'three';
import { onTick } from '../core/ticker';

export interface StageOptions {
	/** Élément dont la visibilité conditionne le rendu (défaut : le canvas). */
	host?: Element;
	stencil?: boolean;
	clearColor?: number;
}

export interface Stage {
	renderer: WebGLRenderer;
	canvas: HTMLCanvasElement;
	/** Taille CSS du canvas. */
	readonly width: number;
	readonly height: number;
	onResize(fn: (w: number, h: number) => void): void;
	/** Appelé à chaque image tant que le canvas est visible. */
	onFrame(fn: (time: number, dt: number) => void): void;
	onContextRestored(fn: () => void): void;
	dispose(): void;
}

const coarse = () => matchMedia('(pointer: coarse)').matches;

function maxDpr(): number {
	const nav = navigator as Navigator & { deviceMemory?: number };
	const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
	if (weak) return 1.25;
	return coarse() ? 1.5 : 2;
}

export function createStage(canvas: HTMLCanvasElement, opts: StageOptions = {}): Stage | null {
	let renderer: WebGLRenderer;
	try {
		renderer = new WebGLRenderer({
			canvas,
			antialias: devicePixelRatio < 2,
			alpha: false,
			stencil: opts.stencil ?? false,
			powerPreference: 'high-performance',
		});
	} catch {
		return null;
	}
	renderer.setClearColor(opts.clearColor ?? 0x0a0a0a, 1);

	let dpr = Math.min(devicePixelRatio || 1, maxDpr());
	let width = 0;
	let height = 0;
	const resizeFns: ((w: number, h: number) => void)[] = [];
	const frameFns: ((t: number, dt: number) => void)[] = [];
	const restoreFns: (() => void)[] = [];

	const resize = () => {
		const r = canvas.getBoundingClientRect();
		const w = Math.max(1, Math.round(r.width));
		const h = Math.max(1, Math.round(r.height));
		if (w === width && h === height) return;
		width = w;
		height = h;
		renderer.setPixelRatio(dpr);
		renderer.setSize(w, h, false);
		for (const fn of resizeFns) fn(w, h);
	};
	const ro = new ResizeObserver(resize);
	ro.observe(canvas);
	resize();

	// DPR adaptatif : si les images sont trop lentes, on baisse la résolution.
	let slow = 0;
	let frames = 0;
	const adapt = (dt: number) => {
		frames++;
		if (dt > 0.022) slow++;
		if (frames >= 90) {
			if (slow > 45 && dpr > 1) {
				dpr = Math.max(1, dpr - 0.25);
				renderer.setPixelRatio(dpr);
				renderer.setSize(width, height, false);
			}
			frames = 0;
			slow = 0;
		}
	};

	let visible = true;
	let lost = false;
	let stopTick: (() => void) | null = null;
	const loop = (t: number, dt: number) => {
		if (!visible || lost) return;
		adapt(dt);
		for (const fn of frameFns) fn(t, dt);
	};
	const sync = () => {
		const run = visible && !lost;
		if (run && !stopTick) stopTick = onTick(loop);
		else if (!run && stopTick) {
			stopTick();
			stopTick = null;
		}
	};
	const io = new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		sync();
	});
	io.observe(opts.host ?? canvas);

	const onLost = (e: Event) => {
		e.preventDefault();
		lost = true;
		document.documentElement.dataset.gl = 'lost';
		sync();
	};
	const onRestored = () => {
		lost = false;
		for (const fn of restoreFns) fn();
		document.documentElement.dataset.gl = 'ready';
		sync();
	};
	canvas.addEventListener('webglcontextlost', onLost);
	canvas.addEventListener('webglcontextrestored', onRestored);

	return {
		renderer,
		canvas,
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		onResize(fn) {
			resizeFns.push(fn);
			if (width) fn(width, height);
		},
		onFrame(fn) {
			frameFns.push(fn);
			sync();
		},
		onContextRestored(fn) {
			restoreFns.push(fn);
		},
		dispose() {
			stopTick?.();
			ro.disconnect();
			io.disconnect();
			canvas.removeEventListener('webglcontextlost', onLost);
			canvas.removeEventListener('webglcontextrestored', onRestored);
			renderer.dispose();
		},
	};
}

/** « #rrggbb » → composantes sRGB brutes, sans conversion linéaire. */
export function rgb(hex: string): [number, number, number] {
	const n = parseInt(hex.replace('#', ''), 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
