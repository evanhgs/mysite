// Titre tranché : le point de vue (perspective-origin) suit le pointeur et
// glisse avec le défilement. Les bandes, à des profondeurs différentes, se
// décalent entre elles ; au repos, en haut de page, elles se recollent.
import { prefs } from '../core/prefs';
import { damp, onTick } from '../core/ticker';

const title = document.querySelector<HTMLElement>('[data-sliced]');

if (title) {
	const fine = matchMedia('(pointer: fine)').matches;
	let pointer: { x: number; y: number } | null = null;
	let x = 0;
	let y = 0;
	let visible = false;
	let stop: (() => void) | null = null;

	const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
	const target = () => {
		const r = title.getBoundingClientRect();
		// Effet proportionnel à la taille du titre (mobile : plus discret).
		const k = Math.max(0.35, Math.min(1, r.height / 260));
		// Défilement : le point de vue descend à mesure que le titre monte.
		let ty = Math.min(scrollY, 600) * 0.4 * k;
		let tx = 0;
		if (pointer) {
			tx += clamp((pointer.x - (r.left + r.width / 2)) * 0.22, 180) * k;
			ty += clamp((pointer.y - (r.top + r.height / 2)) * 0.22, 120) * k;
		}
		return { tx, ty };
	};

	const loop = (_t: number, dt: number) => {
		const { tx, ty } = target();
		x = damp(x, tx, 7, dt);
		y = damp(y, ty, 7, dt);
		title.style.setProperty('--ox', `${x.toFixed(1)}px`);
		title.style.setProperty('--oy', `${y.toFixed(1)}px`);
		if (Math.abs(x - tx) < 0.2 && Math.abs(y - ty) < 0.2) {
			stop?.();
			stop = null;
		}
	};
	const wake = () => {
		if (!visible || prefs.reducedMotion || stop) return;
		stop = onTick(loop);
	};

	new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		if (visible) wake();
		else {
			stop?.();
			stop = null;
		}
	}).observe(title);

	if (fine) {
		addEventListener(
			'pointermove',
			(e) => {
				pointer = { x: e.clientX, y: e.clientY };
				wake();
			},
			{ passive: true },
		);
		document.documentElement.addEventListener('pointerleave', () => {
			pointer = null;
			wake();
		});
	}
	addEventListener('scroll', wake, { passive: true });
	prefs.onChange(() => {
		if (!prefs.reducedMotion) return wake();
		stop?.();
		stop = null;
		x = y = 0;
		title.style.removeProperty('--ox');
		title.style.removeProperty('--oy');
	});
}
