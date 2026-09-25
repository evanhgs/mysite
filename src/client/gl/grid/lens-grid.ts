// Grille infinie de projets, façon phantom.land : cartes en WebGL sur une
// surface bombée comme sous une lentille, glisser avec inertie, survol, clic.
// Portage vanilla de la grille d'Universe (beat-grid.tsx), avec trois
// différences : amortissement indépendant de la fréquence d'écran, sélection
// calculée analytiquement sur la surface courbée (un raycast sur le plan
// raterait les bords bombés), et axe vertical relié au défilement de la page
// (la grille est collante : on ne reste jamais bloqué dedans).
import { CanvasTexture, Mesh, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, type IUniform } from 'three';
import { damp } from '../../core/ticker';
import { createStage } from '../stage';

export interface GridItem {
	slug: string;
	title: string;
	/** « 2026 · Startup » */
	meta: string;
	tagline: string;
	accent: string;
	href: string;
}

export interface LensGridOptions {
	/** Bloc collant qui contient le canvas. */
	host: HTMLElement;
	/** Défilement de la page absorbé par le bloc collant, en px CSS. */
	scrollOffset: () => number;
	reducedMotion: () => boolean;
	onHover: (item: GridItem | null) => void;
	onOpen: (item: GridItem) => void;
	onReady: () => void;
}

export interface LensGrid {
	/** Rejoue l'entrée (retour sur la vue grille). */
	intro(): void;
	dispose(): void;
}

const CARD_ASPECT = 1.25; // hauteur / largeur
const GAP = 0.14; // en fraction de largeur de carte
const FOV = 42;
const CAM_Z = 9;
const TAN_H = Math.tan((FOV * Math.PI) / 360);

const vertexShader = /* glsl */ `
uniform float uCurve;
varying vec2 vUv;
varying float vR2;
void main() {
	vUv = uv;
	vec4 world = modelMatrix * vec4(position, 1.0);
	float r2 = dot(world.xy, world.xy);
	world.z -= uCurve * r2;
	vR2 = r2;
	gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uMap;
uniform float uHover;
uniform float uDim;
uniform float uMaxR2;
varying vec2 vUv;
varying float vR2;
void main() {
	vec3 c = texture2D(uMap, vUv).rgb;
	float edge = smoothstep(uMaxR2, uMaxR2 * 0.18, vR2);
	c *= (0.28 + 0.72 * edge) * mix(1.0, 0.5, uDim * (1.0 - uHover));
	gl_FragColor = vec4(c + uHover * 0.05, 1.0);
}
`;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

async function loadImage(src: string): Promise<HTMLImageElement> {
	const img = new Image();
	img.decoding = 'async';
	img.src = src;
	await img.decode();
	return img;
}

/** Carte : couverture op-art recadrée, puis un bandeau avec l'année, le contexte et le titre. */
function paintCard(item: GridItem, cover: HTMLImageElement | null, family: string, w: number): HTMLCanvasElement {
	const h = Math.round(w * CARD_ASPECT);
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = '#0a0a0a';
	ctx.fillRect(0, 0, w, h);

	const band = Math.round(h * 0.24);
	const area = h - band;
	if (cover) {
		const s = Math.max(w / 1600, area / 1000);
		ctx.drawImage(cover, (w - 1600 * s) / 2, (area - 1000 * s) / 2, 1600 * s, 1000 * s);
	}
	ctx.fillStyle = '#0a0a0a';
	ctx.fillRect(0, area, w, band);
	ctx.fillStyle = '#262628';
	ctx.fillRect(0, area, w, Math.max(1, Math.round(w / 400)));

	const pad = Math.round(w * 0.055);
	const u = w / 100;
	ctx.fillStyle = item.accent;
	ctx.fillRect(pad, area + pad * 0.95, u * 1.9, u * 1.9);
	ctx.fillStyle = '#8e8e92';
	ctx.font = `600 semi-condensed ${Math.round(u * 3)}px ${family}`;
	ctx.letterSpacing = `${(u * 0.27).toFixed(1)}px`;
	ctx.textBaseline = 'top';
	ctx.fillText(item.meta.toUpperCase(), pad + u * 3.4, area + pad * 0.8);

	let size = Math.round(u * 11);
	const title = item.title.toUpperCase();
	ctx.letterSpacing = '0px';
	ctx.fillStyle = '#ececec';
	ctx.textBaseline = 'alphabetic';
	for (;;) {
		ctx.font = `800 condensed ${size}px ${family}`;
		if (ctx.measureText(title).width <= w - pad * 2 || size < u * 5) break;
		size -= 2;
	}
	ctx.fillText(title, pad - u * 0.3, h - pad * 0.9);
	return canvas;
}

export async function createLensGrid(
	canvas: HTMLCanvasElement,
	items: GridItem[],
	opts: LensGridOptions,
): Promise<LensGrid | null> {
	if (!items.length) return null;
	const stage = createStage(canvas, { host: opts.host });
	if (!stage) return null;

	// Textures : la police doit être chargée avant de dessiner les titres.
	const family = getComputedStyle(document.documentElement).getPropertyValue('--font-mona').trim() || 'sans-serif';
	await Promise.race([
		Promise.all([
			document.fonts.load(`800 condensed 64px ${family}`),
			document.fonts.load(`600 semi-condensed 20px ${family}`),
		]),
		new Promise((r) => setTimeout(r, 2500)),
	]).catch(() => undefined);
	const texW = devicePixelRatio >= 1.5 && matchMedia('(pointer: fine)').matches ? 640 : 480;
	const covers = await Promise.all(items.map((it) => loadImage(`/covers/${it.slug}.svg`).catch(() => null)));
	const maxAniso = stage.renderer.capabilities.getMaxAnisotropy();
	const textures = items.map((it, i) => {
		const tex = new CanvasTexture(paintCard(it, covers[i], family, texW));
		tex.anisotropy = Math.min(4, maxAniso);
		return tex;
	});

	const scene = new Scene();
	const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
	camera.position.set(0, 0, CAM_Z);
	const geometry = new PlaneGeometry(1, CARD_ASPECT, 10, 12);
	const shared: Record<string, IUniform> = { uCurve: { value: 0 }, uMaxR2: { value: 1 }, uDim: { value: 0 } };

	let pitchX = 1;
	let pitchY = 1;
	let cardW = 1;
	let worldPerPx = 0.01;
	stage.onResize((w, h) => {
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		const visH = 2 * CAM_Z * TAN_H;
		const visW = visH * camera.aspect;
		const cols = Math.min(4.9, Math.max(1.9, w / 330));
		pitchX = visW / cols;
		cardW = pitchX / (1 + GAP);
		pitchY = cardW * (CARD_ASPECT + GAP);
		worldPerPx = visH / h;
		shared.uCurve.value = 0.075 / (visW * 0.28);
		shared.uMaxR2.value = (visW * visW + visH * visH) * 0.34;
	});

	// Intersection d'un rayon caméra avec la surface z = −c·(x² + y²),
	// en coordonnées monde relatives au centre de vue.
	const hit = (ndcX: number, ndcY: number): [number, number] => {
		const dx = ndcX * TAN_H * camera.aspect;
		const dy = ndcY * TAN_H;
		const k = camera.position.z;
		const a = shared.uCurve.value * (dx * dx + dy * dy);
		const t = a < 1e-9 ? k : (1 - Math.sqrt(Math.max(0, 1 - 4 * a * k))) / (2 * a);
		return [t * dx, t * dy];
	};

	// Cartes : réserve de maillages recyclés au fil du défilement.
	type Card = Mesh<PlaneGeometry, ShaderMaterial> & { userData: { item: number; hover: number } };
	const pool: Card[] = [];
	const active = new Map<string, Card>();
	const itemAt = (cx: number, cy: number) => {
		const m = cx * 7 + cy * 13;
		return ((m % items.length) + items.length) % items.length;
	};
	const makeCard = (): Card => {
		const material = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: { ...shared, uMap: { value: textures[0] }, uHover: { value: 0 } },
		});
		const mesh = new Mesh(geometry, material) as Card;
		mesh.userData = { item: 0, hover: 0 };
		scene.add(mesh);
		return mesh;
	};

	// État : `pan` est la cible (glisser, molette, clavier), `view` la suit.
	const pan = { x: 0, y: 0 };
	const view = { x: 0, y: 0 };
	const vel = { x: 0, y: 0 };
	let pointer: [number, number] | null = null;
	let drag: { id: number; x0: number; y0: number; t0: number; x: number; y: number; t: number; moved: number } | null = null;
	let hovered: Card | null = null;
	let cursor = '';
	let introAt = performance.now();

	// Départ : la carte phare au centre de la partie du canvas visible à l'arrivée.
	{
		const r = opts.host.getBoundingClientRect();
		if (r.top > 0 && r.top < innerHeight) {
			const visibleCenter = (Math.min(innerHeight, r.bottom) - r.top) / 2;
			pan.y = view.y = -(r.height / 2 - visibleCenter) * worldPerPx;
		}
	}

	const setPointer = (e: PointerEvent) => {
		const r = canvas.getBoundingClientRect();
		pointer = [((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2];
	};

	let viewY = 0; // centre de vue vertical, défilement de la page compris
	const pick = (): Card | null => {
		if (!pointer) return null;
		const [hx, hy] = hit(pointer[0], pointer[1]);
		const gx = hx + view.x;
		const gy = hy + viewY;
		const cx = Math.round(gx / pitchX);
		const cy = Math.round(gy / pitchY);
		if (Math.abs(gx - cx * pitchX) > cardW / 2 || Math.abs(gy - cy * pitchY) > (cardW * CARD_ASPECT) / 2) return null;
		return active.get(`${cx},${cy}`) ?? null;
	};

	const onDown = (e: PointerEvent) => {
		if (e.button !== 0) return;
		drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: e.timeStamp, x: e.clientX, y: e.clientY, t: e.timeStamp, moved: 0 };
		vel.x = vel.y = 0;
		canvas.setPointerCapture(e.pointerId);
	};
	const onMove = (e: PointerEvent) => {
		setPointer(e);
		if (!drag || e.pointerId !== drag.id) return;
		const dx = e.clientX - drag.x;
		const dy = e.clientY - drag.y;
		const dts = Math.max(4, e.timeStamp - drag.t) / 1000;
		drag.moved += Math.abs(dx) + Math.abs(dy);
		pan.x -= dx * worldPerPx;
		pan.y += dy * worldPerPx;
		// Vitesse lissée (monde/s), pour l'inertie au relâcher.
		vel.x = vel.x * 0.6 + ((-dx * worldPerPx) / dts) * 0.4;
		vel.y = vel.y * 0.6 + ((dy * worldPerPx) / dts) * 0.4;
		drag.x = e.clientX;
		drag.y = e.clientY;
		drag.t = e.timeStamp;
	};
	const onUp = (e: PointerEvent) => {
		if (!drag || e.pointerId !== drag.id) return;
		const tap = drag.moved < 8 && e.timeStamp - drag.t0 < 350;
		if (e.timeStamp - drag.t > 90 || opts.reducedMotion()) vel.x = vel.y = 0; // relâché à l'arrêt
		const max = 60;
		vel.x = Math.max(-max, Math.min(max, vel.x));
		vel.y = Math.max(-max, Math.min(max, vel.y));
		drag = null;
		if (tap) {
			setPointer(e);
			const card = pick();
			if (card) opts.onOpen(items[card.userData.item]);
		}
	};
	const onCancel = (e: PointerEvent) => {
		if (drag && e.pointerId === drag.id) drag = null;
		pointer = null;
	};
	const onLeave = (e: PointerEvent) => {
		if (!drag || e.pointerType !== 'mouse') pointer = null;
	};
	// Molette : l'axe vertical reste au défilement de la page ; seul un geste
	// surtout horizontal (pavé tactile, Maj + molette) fait glisser la grille.
	const onWheel = (e: WheelEvent) => {
		if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
		e.preventDefault();
		const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? canvas.clientWidth : 1;
		pan.x += e.deltaX * unit * worldPerPx;
	};
	// Flèches gauche/droite quand la grille est à l'écran et que rien n'a le focus.
	const onKey = (e: KeyboardEvent) => {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
		if (document.activeElement && document.activeElement !== document.body) return;
		const r = opts.host.getBoundingClientRect();
		if (r.bottom < innerHeight * 0.5 || r.top > innerHeight * 0.5) return;
		e.preventDefault();
		pan.x = (Math.round(pan.x / pitchX) + (e.key === 'ArrowRight' ? 1 : -1)) * pitchX;
	};

	canvas.addEventListener('pointerdown', onDown);
	canvas.addEventListener('pointermove', onMove);
	canvas.addEventListener('pointerup', onUp);
	canvas.addEventListener('pointercancel', onCancel);
	canvas.addEventListener('pointerleave', onLeave);
	canvas.addEventListener('wheel', onWheel, { passive: false });
	addEventListener('keydown', onKey);

	stage.onContextRestored(() => {
		for (const tex of textures) tex.needsUpdate = true;
	});

	let ready = false;
	let lastHoverItem = -1;
	stage.onFrame((_t, dt) => {
		const reduced = opts.reducedMotion();

		// Inertie puis amortissement vers la cible.
		if (!drag) {
			pan.x += vel.x * dt;
			pan.y += vel.y * dt;
			const decay = Math.exp(-3.7 * dt);
			vel.x *= decay;
			vel.y *= decay;
		}
		view.x = reduced ? pan.x : damp(view.x, pan.x, 11, dt);
		view.y = reduced ? pan.y : damp(view.y, pan.y, 11, dt);
		viewY = view.y - opts.scrollOffset() * worldPerPx;

		// Entrée : la caméra part de plus loin et se pose.
		const e = reduced ? 1 : Math.min(1, (performance.now() - introAt) / 1200);
		camera.position.z = CAM_Z * (1 + 0.55 * (1 - easeOutCubic(e)));

		// Cellules visibles : emprise des coins de l'écran sur la surface courbée.
		const [hx, hy] = hit(1, 1);
		const minX = Math.floor((view.x - hx - cardW) / pitchX);
		const maxX = Math.ceil((view.x + hx + cardW) / pitchX);
		const minY = Math.floor((viewY - hy - cardW) / pitchY);
		const maxY = Math.ceil((viewY + hy + cardW) / pitchY);
		const seen = new Set<string>();
		for (let cx = minX; cx <= maxX; cx++) {
			for (let cy = minY; cy <= maxY; cy++) {
				const key = `${cx},${cy}`;
				seen.add(key);
				let card = active.get(key);
				if (!card) {
					card = pool.pop() ?? makeCard();
					card.visible = true;
					card.userData.item = itemAt(cx, cy);
					card.userData.hover = 0;
					card.material.uniforms.uMap.value = textures[card.userData.item];
					active.set(key, card);
				}
				card.position.set(cx * pitchX - view.x, cy * pitchY - viewY, 0);
			}
		}
		for (const [key, card] of active) {
			if (seen.has(key)) continue;
			card.visible = false;
			active.delete(key);
			pool.push(card);
		}

		// Survol : la carte visée grossit, les autres s'assombrissent.
		hovered = drag || e < 1 ? null : pick();
		const hoverItem = hovered ? hovered.userData.item : -1;
		if (hoverItem !== lastHoverItem) {
			lastHoverItem = hoverItem;
			opts.onHover(hovered ? items[hoverItem] : null);
		}
		const nextCursor = drag ? 'grabbing' : hovered ? 'pointer' : 'grab';
		if (nextCursor !== cursor) canvas.style.cursor = cursor = nextCursor;
		shared.uDim.value = damp(shared.uDim.value, hovered ? 1 : 0, 8, dt);
		for (const card of active.values()) {
			const h = damp(card.userData.hover, card === hovered ? 1 : 0, 10, dt);
			card.userData.hover = h;
			card.material.uniforms.uHover.value = h;
			const s = cardW * (1 + 0.05 * h);
			card.scale.set(s, s, 1);
		}

		stage.renderer.render(scene, camera);
		if (!ready) {
			ready = true;
			introAt = performance.now();
			opts.onReady();
		}
	});

	return {
		intro() {
			introAt = performance.now();
		},
		dispose() {
			canvas.removeEventListener('pointerdown', onDown);
			canvas.removeEventListener('pointermove', onMove);
			canvas.removeEventListener('pointerup', onUp);
			canvas.removeEventListener('pointercancel', onCancel);
			canvas.removeEventListener('pointerleave', onLeave);
			canvas.removeEventListener('wheel', onWheel);
			removeEventListener('keydown', onKey);
			for (const card of [...active.values(), ...pool]) card.material.dispose();
			for (const tex of textures) tex.dispose();
			geometry.dispose();
			stage.dispose();
		},
	};
}
