// La couverture du projet survolé suit le curseur (pointeur fin, animations actives).
import { prefs } from '../core/prefs';
import { damp, onTick } from '../core/ticker';

for (const list of document.querySelectorAll<HTMLElement>('[data-project-list]')) {
	const preview = list.querySelector<HTMLElement>('.preview');
	const img = preview?.querySelector('img');
	if (!preview || !img || !matchMedia('(pointer: fine)').matches) continue;

	let tx = 0;
	let ty = 0;
	let x = 0;
	let y = 0;
	let stopLoop: (() => void) | null = null;

	const place = () => {
		preview.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
	};

	const loop = (_t: number, dt: number) => {
		x = damp(x, tx, 14, dt);
		y = damp(y, ty, 14, dt);
		place();
		if (list.dataset.preview !== 'on' && Math.abs(x - tx) < 0.5 && Math.abs(y - ty) < 0.5) {
			stopLoop?.();
			stopLoop = null;
		}
	};

	list.addEventListener('pointermove', (e) => {
		if (prefs.reducedMotion) return;
		tx = e.clientX + 24;
		ty = e.clientY;
		if (!stopLoop) {
			if (list.dataset.preview !== 'on') {
				x = tx;
				y = ty;
				place();
			}
			stopLoop = onTick(loop);
		}
	});

	for (const row of list.querySelectorAll<HTMLAnchorElement>('a[data-cover]')) {
		row.addEventListener('pointerenter', () => {
			if (prefs.reducedMotion) return;
			const src = row.dataset.cover!;
			if (!img.src.endsWith(src)) img.src = src;
			list.dataset.preview = 'on';
		});
	}

	list.addEventListener('pointerleave', () => {
		delete list.dataset.preview;
	});
}
