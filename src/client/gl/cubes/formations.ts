// Formations du champ de cubes : chaque fonction renvoie count × [x, y, z, taille].
import { hull, projector, type Vec2, type Vec3 } from '@lib/geometry/iso';
import { ISO_VIEW, REUTERSVARD_ROLL, reutersvardPath } from '@lib/geometry/reutersvard';
import { mulberry32 } from '@lib/prng';
import type { FieldGroups } from './field';
import type { TextSample } from './text-sampler';

export interface CameraSpec {
	/** Champ vertical, en degrés. */
	fov: number;
	aspect: number;
	/** Distance caméra → cible, en unités monde. */
	dist: number;
	/** Taille CSS du canvas. */
	width: number;
	height: number;
}

/**
 * Anamorphose : chaque échantillon du titre devient un cube posé sur le rayon
 * caméra → pixel, à une profondeur aléatoire, avec une taille proportionnelle
 * à cette profondeur. Depuis la caméra (0, 0, dist) regardant l'origine, les
 * cubes recomposent exactement le titre ; de partout ailleurs, c'est un nuage.
 */
export function nameFormation(sample: TextSample, cam: CameraSpec, count: number, seed = 11): Float32Array {
	const out = new Float32Array(count * 4);
	const rand = mulberry32(seed);
	const tanH = Math.tan((cam.fov * Math.PI) / 360);
	const pitchNdc = (2 * sample.pitch) / cam.height;
	for (let i = 0; i < count; i++) {
		if (i < sample.count) {
			const ndcX = (sample.points[i * 2] / cam.width) * 2 - 1;
			const ndcY = 1 - (sample.points[i * 2 + 1] / cam.height) * 2;
			const z = cam.dist * (0.5 + rand() * 1.15);
			out[i * 4] = ndcX * tanH * cam.aspect * z;
			out[i * 4 + 1] = ndcY * tanH * z;
			out[i * 4 + 2] = cam.dist - z;
			out[i * 4 + 3] = pitchNdc * tanH * z * 0.9;
		} else {
			// Surplus : invisible (taille nulle), il grandira pendant le morphing.
			out[i * 4] = (rand() - 0.5) * cam.dist;
			out[i * 4 + 1] = (rand() - 0.5) * cam.dist;
			out[i * 4 + 2] = (rand() - 0.5) * cam.dist;
			out[i * 4 + 3] = 0;
		}
	}
	return out;
}

/** Groupes d'instances pour la jonction : P₀ et P₁ « devant », P₃ₙ₋₁ « derrière ». */
export function triangleGroups(n: number, k: number): FieldGroups {
	const per = k ** 3;
	return { mark: [(3 * n - 3) * per, 2 * per], late: [(3 * n - 1) * per, per] };
}

/**
 * Triangle de Reutersvärd : 3n gros cubes, chacun fait de k³ micro-cubes.
 * Ordre des ids : gros cubes 2 … 3n−2, puis P₀ et P₁ (marque), puis P₃ₙ₋₁.
 * Taille calculée pour remplir l'écran en vue isométrique orthographique.
 */
export function triangleFormation(n: number, k: number, cam: CameraSpec): Float32Array {
	const path = reutersvardPath(n);
	const count = path.length * k ** 3;
	const out = new Float32Array(count * 4);

	// Emprise projetée (en unités de gros cube) pour caler l'échelle.
	const P = projector(ISO_VIEW, REUTERSVARD_ROLL);
	const corners: Vec2[] = [];
	for (const [x, y, z] of path)
		for (const dx of [0, 1]) for (const dy of [0, 1]) for (const dz of [0, 1]) corners.push(P.project([x + dx, y + dy, z + dz]));
	const hw = Math.max(...corners.map((c) => c[0])) - Math.min(...corners.map((c) => c[0]));
	const hh = Math.max(...corners.map((c) => c[1])) - Math.min(...corners.map((c) => c[1]));
	const tanH = Math.tan((cam.fov * Math.PI) / 360);
	const half = cam.dist * tanH;
	const B = Math.min((1.3 * half) / hh, (1.6 * half * cam.aspect) / hw);

	// Centre projeté de l'emprise → origine (la caméra vise l'origine).
	const hullPts = hull(corners);
	const cx = hullPts.reduce((s, p) => s + p[0], 0) / hullPts.length;
	const cy = hullPts.reduce((s, p) => s + p[1], 0) / hullPts.length;
	// Point 3D qui se projette sur (cx, cy) : combinaison des axes écran.
	const center: Vec3 = [
		P.right[0] * cx - P.up[0] * cy,
		P.right[1] * cx - P.up[1] * cy,
		P.right[2] * cx - P.up[2] * cy,
	];

	const order = [...Array.from({ length: 3 * n - 3 }, (_, i) => i + 2), 0, 1, 3 * n - 1];
	const gap = 0.92;
	let id = 0;
	for (const big of order) {
		const [bx, by, bz] = path[big];
		for (let i = 0; i < k; i++)
			for (let j = 0; j < k; j++)
				for (let l = 0; l < k; l++) {
					const ux = bx + 0.5 + ((i + 0.5) / k - 0.5) * gap;
					const uy = by + 0.5 + ((j + 0.5) / k - 0.5) * gap;
					const uz = bz + 0.5 + ((l + 0.5) / k - 0.5) * gap;
					out[id * 4] = (ux - center[0]) * B;
					out[id * 4 + 1] = (uy - center[1]) * B;
					out[id * 4 + 2] = (uz - center[2]) * B;
					out[id * 4 + 3] = (B / k) * gap * 1.03;
					id++;
				}
	}
	return out;
}

/** Nuage de départ : les cubes arrivent de partout avant de former le nom. */
export function scatterFormation(count: number, radius: number, size: number, seed = 5): Float32Array {
	const out = new Float32Array(count * 4);
	const rand = mulberry32(seed);
	for (let i = 0; i < count; i++) {
		const u = rand() * 2 - 1;
		const a = rand() * Math.PI * 2;
		const r = radius * Math.cbrt(0.2 + rand() * 0.8);
		const s = Math.sqrt(1 - u * u);
		out[i * 4] = r * s * Math.cos(a);
		out[i * 4 + 1] = r * u;
		out[i * 4 + 2] = r * s * Math.sin(a);
		out[i * 4 + 3] = size * (0.3 + rand() * 0.9);
	}
	return out;
}

/** Sortie : la formation s'étire et se disperse vers l'extérieur. */
export function exitFormation(from: Float32Array, count: number, seed = 9): Float32Array {
	const out = new Float32Array(count * 4);
	const rand = mulberry32(seed);
	for (let i = 0; i < count; i++) {
		const x = from[i * 4];
		const y = from[i * 4 + 1];
		const z = from[i * 4 + 2];
		const d = Math.hypot(x, y, z) || 1;
		const push = 18 + rand() * 40;
		out[i * 4] = x * 1.4 + (x / d) * push + (rand() - 0.5) * 12;
		out[i * 4 + 1] = y * 1.4 + (y / d) * push + 10 + rand() * 25;
		out[i * 4 + 2] = z * 1.4 + (z / d) * push + (rand() - 0.5) * 12;
		out[i * 4 + 3] = from[i * 4 + 3] * 0.35;
	}
	return out;
}
