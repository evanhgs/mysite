// Scène WebGL de l'accueil : le nom anamorphique, la révélation, le vertigo,
// le triangle impossible et sa faille, pilotés par le défilement.
import { Matrix4, PerspectiveCamera, Scene } from 'three';
import { ISO_VIEW, REUTERSVARD_ROLL } from '@lib/geometry/reutersvard';
import { prefs } from '../core/prefs';
import type { SceneTracker } from '../core/scroll-progress';
import { damp } from '../core/ticker';
import { CubeField } from '../gl/cubes/field';
import {
	type CameraSpec,
	exitFormation,
	nameFormation,
	scatterFormation,
	triangleFormation,
	triangleGroups,
} from '../gl/cubes/formations';
import { sampleHeading } from '../gl/cubes/text-sampler';
import { createStage } from '../gl/stage';

const FOV = 32;
const DIST = 30;
const N = 4;
const ROW = { scatter: 0, name: 1, triangle: 2, exit: 3 } as const;
/** Les cubes regardent le point de vue exact seulement dans la formation du nom. */
const FACING = [0, 1, 0, 0];
/** Lumière : vers l'œil pour le nom (faces avant claires), isométrique sinon. */
const LIGHT_EYE: [number, number, number] = [0.3, 0.5, 1];
const LIGHT_ISO: [number, number, number] = [0.45, 0.85, 0.05];
const LIGHTS = [LIGHT_ISO, LIGHT_EYE, LIGHT_ISO, LIGHT_ISO];

const ISO_AZ = Math.atan2(ISO_VIEW[0], ISO_VIEW[2]);
const ISO_EL = Math.asin(ISO_VIEW[1] / Math.hypot(...ISO_VIEW));

interface Pose {
	p: number;
	/** Facteur de distance (recul de la caméra). */
	zoom: number;
	az: number;
	el: number;
	roll: number;
	ortho: number;
	flat: number;
	fog: number;
}

// Poses de caméra le long du défilement (interpolées en douceur).
const KEYS: Pose[] = [
	{ p: 0.0, zoom: 1, az: 0, el: 0, roll: 0, ortho: 0, flat: 1, fog: 0 },
	{ p: 0.1, zoom: 1, az: 0, el: 0, roll: 0, ortho: 0, flat: 1, fog: 0 },
	{ p: 0.28, zoom: 1.05, az: 1.15, el: 0.34, roll: 0, ortho: 0, flat: 0, fog: 0.35 },
	{ p: 0.38, zoom: 1.05, az: 1.3, el: 0.4, roll: 0, ortho: 0, flat: 0, fog: 0.35 },
	{ p: 0.56, zoom: 1, az: ISO_AZ, el: ISO_EL, roll: REUTERSVARD_ROLL, ortho: 1, flat: 0, fog: 0 },
	{ p: 0.77, zoom: 1, az: ISO_AZ, el: ISO_EL, roll: REUTERSVARD_ROLL, ortho: 1, flat: 0, fog: 0 },
	{ p: 0.93, zoom: 1.45, az: ISO_AZ + 0.62, el: ISO_EL - 0.1, roll: REUTERSVARD_ROLL, ortho: 0.6, flat: 0, fog: 0.1 },
	{ p: 1.0, zoom: 1.7, az: ISO_AZ + 0.9, el: ISO_EL - 0.06, roll: REUTERSVARD_ROLL, ortho: 0.4, flat: 0, fog: 0.35 },
];

const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function poseAt(p: number): Pose {
	let i = 0;
	while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
	const a = KEYS[i];
	const b = KEYS[i + 1];
	const t = smooth(clamp01((p - a.p) / (b.p - a.p)));
	return {
		p,
		zoom: lerp(a.zoom, b.zoom, t),
		az: lerp(a.az, b.az, t),
		el: lerp(a.el, b.el, t),
		roll: lerp(a.roll, b.roll, t),
		ortho: lerp(a.ortho, b.ortho, t),
		flat: lerp(a.flat, b.flat, t),
		fog: lerp(a.fog, b.fog, t),
	};
}

function morphAt(p: number): { from: number; to: number; t: number } {
	if (p < 0.38) return { from: ROW.name, to: ROW.name, t: 0 };
	if (p < 0.56) return { from: ROW.name, to: ROW.triangle, t: (p - 0.38) / 0.16 };
	if (p < 0.94) return { from: ROW.triangle, to: ROW.triangle, t: 0 };
	return { from: ROW.triangle, to: ROW.exit, t: (p - 0.94) / 0.06 };
}

export async function startScene(sceneEl: HTMLElement, tracker: SceneTracker) {
	const root = document.documentElement;
	const canvas = sceneEl.querySelector<HTMLCanvasElement>('canvas[data-gl-canvas]');
	const heading = sceneEl.querySelector<HTMLElement>('[data-hero-name]');
	const pin = canvas?.parentElement;
	if (!canvas || !heading || !pin) return;

	const stage = createStage(canvas, { host: sceneEl, stencil: true });
	if (!stage) {
		root.dataset.gl = 'fallback';
		return;
	}

	const coarse = matchMedia('(pointer: coarse)').matches;
	const k = coarse || innerWidth < 700 ? 5 : 7;
	const count = 3 * N * k ** 3;
	const field = new CubeField(count, 4, triangleGroups(N, k), {
		x: '#8e8e92',
		y: '#ececec',
		z: '#2a2a2d',
		flat: '#ececec',
		fog: '#0a0a0a',
	});
	const scene = new Scene();
	field.addTo(scene);
	const camera = new PerspectiveCamera(FOV, 1, 0.1, 500);
	const u = field.uniforms;
	u.uFogNear.value = DIST * 0.6;
	u.uFogFar.value = DIST * 2.4;
	u.uEye.value = [0, 0, DIST];

	// --- Formations (dépendent de la mise en page) ---
	let triangle: Float32Array = new Float32Array(0);
	let built = false;
	const build = async () => {
		const rect = canvas.getBoundingClientRect();
		const spec: CameraSpec = { fov: FOV, aspect: rect.width / rect.height, dist: DIST, width: rect.width, height: rect.height };
		const sample = await sampleHeading(heading, rect, count * 0.92);
		if (!sample) throw new Error('Échantillonnage du titre impossible');
		const name = nameFormation(sample, spec, count);
		triangle = triangleFormation(N, k, spec);
		if (!built) field.setFormation(ROW.scatter, scatterFormation(count, DIST * 1.6, name[3] || 0.4));
		field.setFormation(ROW.name, name);
		field.setFormation(ROW.triangle, triangle);
		field.setFormation(ROW.exit, exitFormation(triangle, count));
		built = true;
	};
	await build();

	let lastW = stage.width;
	let rebuild = 0;
	stage.onResize((w, h) => {
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		if (built && Math.abs(w - lastW) > 2) {
			lastW = w;
			clearTimeout(rebuild);
			rebuild = window.setTimeout(() => build().catch(console.error), 180);
		}
	});
	stage.onContextRestored(() => field.reupload());

	// --- Pointeur : décale la caméra autour du point de vue exact ---
	let ptrX = 0;
	let ptrY = 0;
	let offAz = 0;
	let offEl = 0;
	let lastMove = -10;
	let now = 0;
	addEventListener(
		'pointermove',
		(e) => {
			if (e.pointerType === 'touch') return;
			ptrX = (e.clientX / innerWidth) * 2 - 1;
			ptrY = (e.clientY / innerHeight) * 2 - 1;
			lastMove = now;
		},
		{ passive: true },
	);
	// Tactile : glisser horizontalement sur la scène (le défilement vertical reste natif).
	let touchStart: number | null = null;
	pin.addEventListener('pointerdown', (e) => {
		if (e.pointerType === 'touch') touchStart = e.clientX;
	});
	pin.addEventListener(
		'pointermove',
		(e) => {
			if (e.pointerType !== 'touch' || touchStart === null) return;
			ptrX = Math.max(-1, Math.min(1, ((e.clientX - touchStart) / innerWidth) * 2.4));
			ptrY = 0;
			lastMove = now;
		},
		{ passive: true },
	);
	const endTouch = () => (touchStart = null);
	pin.addEventListener('pointerup', endTouch);
	pin.addEventListener('pointercancel', endTouch);

	// --- Intro : les cubes convergent vers le titre, puis le titre s'efface ---
	// Durée réelle (horloge), pas cumul d'images : sur un appareil lent,
	// l'intro dure quand même 2,6 s.
	const INTRO = 2.6;
	let introStart = -1;
	let introT = prefs.reducedMotion ? INTRO : 0;
	root.dataset.gl = 'ready';

	const orthoProj = new Matrix4();
	const tanH = Math.tan((FOV * Math.PI) / 360);

	stage.onFrame((time, dt) => {
		now = time;
		u.uTime.value = time;
		const p = tracker.progress;
		const pose = poseAt(p);

		// Intro pilotée par le temps (tant qu'on est en haut de page).
		let from: number = ROW.name;
		let to: number = ROW.name;
		let t = 0;
		let introAz = 0;
		if (introT < INTRO) {
			if (introStart < 0) introStart = time;
			introT = Math.min(INTRO, time - introStart);
			const e = 1 - Math.pow(1 - introT / INTRO, 3);
			from = ROW.scatter;
			to = ROW.name;
			t = e;
			introAz = (1 - e) * 0.55;
			u.uSwirl.value = (1 - e) * 4;
			if (introT >= INTRO * 0.96) sceneEl.classList.add('is-formed');
		} else {
			const m = morphAt(p);
			from = m.from;
			to = m.to;
			t = m.t;
			u.uSwirl.value = to !== from ? 3 * Math.sin(Math.PI * clamp01(t)) : 0;
		}
		u.uFrom.value = from;
		u.uTo.value = to;
		u.uT.value = clamp01(t);
		u.uFaceFrom.value = FACING[from];
		u.uFaceTo.value = FACING[to];
		u.uLightFrom.value = LIGHTS[from];
		u.uLightTo.value = LIGHTS[to];

		// Influence du pointeur : forte sur le nom, nulle sur le triangle exact.
		const idle = time - lastMove > 2.5;
		// Tactile : de temps en temps, le nom se casse puis se recompose tout seul.
		const sway = coarse && idle ? Math.pow(Math.sin(time * 0.42), 9) * 0.2 : 0;
		const weight = p < 0.2 ? 1 : p > 0.78 && p < 0.95 ? 0.35 : 0;
		const tAz = (idle ? sway : ptrX * 0.5) * weight;
		const tEl = (idle ? 0 : -ptrY * 0.24) * weight;
		offAz = damp(offAz, tAz, 4, dt);
		offEl = damp(offEl, tEl, 4, dt);

		const az = pose.az + offAz + introAz;
		const el = pose.el + offEl;
		const dist = DIST * pose.zoom;
		camera.position.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
		camera.up.set(0, 1, 0);
		camera.lookAt(0, 0, 0);
		camera.rotateZ(pose.roll);
		camera.updateMatrixWorld();

		// Aplat quand on est pile au bon point de vue : le nom se lit net.
		const deviation = Math.hypot(offAz + introAz, offEl);
		const flat = pose.flat * (1 - smooth(clamp01((deviation - 0.02) / 0.2)));
		u.uFlatAmt.value = flat;
		u.uFogAmt.value = Math.max(pose.fog, (1 - flat) * (p < 0.2 ? 0.3 : 0));

		// Même focale au plan de la cible : l'orthographique « aplatit » sans zoomer.
		const halfH = dist * tanH;
		orthoProj.makeOrthographic(-halfH * camera.aspect, halfH * camera.aspect, halfH, -halfH, camera.near, camera.far);
		u.uOrthoProj.value.copy(orthoProj);
		u.uOrtho.value = pose.ortho;

		// Jonction impossible : seulement dans l'axe exact.
		field.setJoinActive(pose.ortho > 0.995 && Math.abs(offAz) + Math.abs(offEl) < 0.01 && from === ROW.triangle && to === ROW.triangle);

		stage.renderer.render(scene, camera);
	});
}
