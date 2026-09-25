// Escalier de Penrose en WebGL (page 404). Seize colonnes réelles, en
// spirale ; une caméra orthographique alignée sur le décalage D de la boucle,
// et la dernière marche semble rejoindre la première. Un petit cube monte
// sans fin : arrivé en haut, il est téléporté de D, invisible depuis l'angle
// magique. Glisser fait tourner la vue et révèle le truc ; au relâcher,
// l'escalier revient à l'angle magique.
import { BoxGeometry, Mesh, OrthographicCamera, Scene, ShaderMaterial, Vector3 } from 'three';
import { penroseStairs } from '@lib/geometry/penrose';
import { damp } from '../../core/ticker';
import { createStage, rgb } from '../stage';

interface Tones {
	x: string;
	y: string;
	z: string;
	stroke: string;
}

const STEP_TONES: Tones = { x: '#8e8e92', y: '#ececec', z: '#2a2a2d', stroke: '#0a0a0a' };
const WALKER_TONES: Tones = { x: '#ff4f1f', y: '#ff9a7a', z: '#9c2c0c', stroke: '#0a0a0a' };
const BASE = -2;
const WALKER = 0.36;
const HOP = 0.52; // secondes par marche

const vertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec2 vUv;
void main() {
	vNormal = normal;
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Aplats par orientation de face (comme les posters SVG) et arêtes tracées
// à épaisseur constante à l'écran.
const fragmentShader = /* glsl */ `
uniform vec3 uX;
uniform vec3 uY;
uniform vec3 uZ;
uniform vec3 uStroke;
uniform float uLine;
varying vec3 vNormal;
varying vec2 vUv;
void main() {
	vec3 n = abs(vNormal);
	vec3 c = n.y > 0.5 ? uY : (n.x > 0.5 ? uX : uZ);
	vec2 d = min(vUv, 1.0 - vUv) / max(fwidth(vUv), vec2(1e-5));
	float edge = min(d.x, d.y);
	c = mix(uStroke, c, smoothstep(uLine - 0.6, uLine + 0.6, edge));
	gl_FragColor = vec4(c, 1.0);
}
`;

function toneMaterial(t: Tones) {
	return new ShaderMaterial({
		vertexShader,
		fragmentShader,
		uniforms: {
			uX: { value: rgb(t.x) },
			uY: { value: rgb(t.y) },
			uZ: { value: rgb(t.z) },
			uStroke: { value: rgb(t.stroke) },
			uLine: { value: 1.2 },
		},
	});
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export interface StairsOptions {
	host: HTMLElement;
	reducedMotion: () => boolean;
	onReady: () => void;
}

export function startStairs(canvas: HTMLCanvasElement, opts: StairsOptions) {
	const stage = createStage(canvas, { host: opts.host });
	if (!stage) return null;

	const { steps, D } = penroseStairs();
	const scene = new Scene();
	const box = new BoxGeometry(1, 1, 1);
	const stepMaterial = toneMaterial(STEP_TONES);
	for (const s of steps) {
		const h = s.top - BASE;
		const mesh = new Mesh(box, stepMaterial);
		mesh.position.set(s.x + 0.5, BASE + h / 2, s.z + 0.5);
		mesh.scale.set(1, h, 1);
		scene.add(mesh);
	}
	const walkerMaterial = toneMaterial(WALKER_TONES);
	const walker = new Mesh(box, walkerMaterial);
	walker.scale.setScalar(WALKER);
	scene.add(walker);

	// Angle magique : on regarde le long de D.
	const dir = new Vector3(...D).normalize();
	const AZ0 = Math.atan2(dir.x, dir.z);
	const EL0 = Math.asin(dir.y);

	// Cadrage : emprise projetée de l'escalier à l'angle magique.
	const worldUp = new Vector3(0, 1, 0);
	const right = new Vector3().crossVectors(worldUp, dir).normalize();
	const up = new Vector3().crossVectors(dir, right);
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	const corner = new Vector3();
	for (const s of steps)
		for (const dx of [0, 1])
			for (const dy of [BASE, s.top])
				for (const dz of [0, 1]) {
					corner.set(s.x + dx, dy, s.z + dz);
					const px = corner.dot(right);
					const py = corner.dot(up);
					minX = Math.min(minX, px);
					maxX = Math.max(maxX, px);
					minY = Math.min(minY, py);
					maxY = Math.max(maxY, py);
				}
	const target = right
		.clone()
		.multiplyScalar((minX + maxX) / 2)
		.add(up.clone().multiplyScalar((minY + maxY) / 2));
	const spanW = maxX - minX;
	const spanH = maxY - minY;

	const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
	stage.onResize((w, h) => {
		const aspect = w / h;
		const half = Math.max(spanH / 2, spanW / 2 / aspect) * 1.14;
		camera.left = -half * aspect;
		camera.right = half * aspect;
		camera.top = half;
		camera.bottom = -half;
		camera.updateProjectionMatrix();
	});

	// Orientation : décalage (azimut, élévation) par rapport à l'angle magique.
	const reduced = opts.reducedMotion();
	const cur = { az: reduced ? 0 : 0.95, el: reduced ? 0 : -0.3 };
	const goal = { az: 0, el: 0 };
	let drag: { id: number; x: number; y: number; az: number; el: number; touch: boolean } | null = null;
	let releasedAt = -Infinity;

	const onDown = (e: PointerEvent) => {
		if (e.button !== 0) return;
		drag = { id: e.pointerId, x: e.clientX, y: e.clientY, az: goal.az, el: goal.el, touch: e.pointerType !== 'mouse' };
		canvas.setPointerCapture(e.pointerId);
		canvas.style.cursor = 'grabbing';
	};
	const onMove = (e: PointerEvent) => {
		if (!drag || e.pointerId !== drag.id) return;
		goal.az = drag.az - (e.clientX - drag.x) * 0.009;
		if (!drag.touch) goal.el = Math.max(-0.75, Math.min(0.5, drag.el + (e.clientY - drag.y) * 0.006));
	};
	const onUp = (e: PointerEvent) => {
		if (!drag || e.pointerId !== drag.id) return;
		drag = null;
		releasedAt = performance.now();
		canvas.style.cursor = 'grab';
	};
	canvas.addEventListener('pointerdown', onDown);
	canvas.addEventListener('pointermove', onMove);
	canvas.addEventListener('pointerup', onUp);
	canvas.addEventListener('pointercancel', onUp);
	canvas.style.cursor = 'grab';

	// Marcheur : de marche en marche ; après la dernière, la marche « suivante »
	// est la première décalée de D, puis retour instantané sur la première.
	const top = (i: number) => {
		const s = steps[i % steps.length];
		const lap = Math.floor(i / steps.length);
		return new Vector3(s.x + 0.5 + D[0] * lap, s.top + WALKER / 2 + D[1] * lap, s.z + 0.5 + D[2] * lap);
	};
	let clock = 0;
	const camPos = new Vector3();
	let ready = false;

	stage.onFrame((_t, dt) => {
		const still = opts.reducedMotion();
		clock += still ? 0 : dt;

		// Retour à l'angle magique une fois la vue relâchée.
		if (!drag && performance.now() - releasedAt > 700) {
			goal.az = 0;
			goal.el = 0;
		}
		const lambda = drag ? 14 : still ? 60 : 2.4;
		cur.az = damp(cur.az, goal.az, lambda, dt);
		cur.el = damp(cur.el, goal.el, lambda, dt);
		const az = AZ0 + cur.az;
		const el = EL0 + cur.el;
		camPos.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).multiplyScalar(60).add(target);
		camera.position.copy(camPos);
		camera.up.copy(worldUp);
		camera.lookAt(target);

		// Saut (87 % du temps), puis réception écrasée sur la marche.
		const n = Math.floor(clock / HOP);
		const u = clock / HOP - n;
		const f = easeInOut(Math.min(1, u / 0.87));
		const i = ((n % steps.length) + steps.length) % steps.length;
		walker.position.lerpVectors(top(i), top(i + 1), f);
		walker.position.y += Math.sin(Math.PI * f) * 0.42;
		const squash = u > 0.87 ? 1 - 0.2 * Math.sin((Math.PI * (u - 0.87)) / 0.13) : 1;
		walker.scale.set(WALKER * (2 - squash), WALKER * squash, WALKER * (2 - squash));
		walker.position.y -= (WALKER * (1 - squash)) / 2;

		stage.renderer.render(scene, camera);
		if (!ready) {
			ready = true;
			opts.onReady();
		}
	});

	return {
		dispose() {
			canvas.removeEventListener('pointerdown', onDown);
			canvas.removeEventListener('pointermove', onMove);
			canvas.removeEventListener('pointerup', onUp);
			canvas.removeEventListener('pointercancel', onUp);
			box.dispose();
			stepMaterial.dispose();
			walkerMaterial.dispose();
			stage.dispose();
		},
	};
}
