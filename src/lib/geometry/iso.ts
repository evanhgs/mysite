// Projection orthographique le long d'une direction de vue. Deux points qui
// diffèrent d'un multiple de cette direction se projettent au même endroit :
// c'est tout le secret des objets impossibles.
export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

const norm = (v: Vec3): Vec3 => {
	const l = Math.hypot(v[0], v[1], v[2]);
	return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export interface Projector {
	/** Direction de la caméra vers la scène (unitaire, pointe vers l'observateur). */
	view: Vec3;
	right: Vec3;
	up: Vec3;
	/** Coordonnées écran (y vers le bas, pour le SVG). */
	project(p: Vec3): Vec2;
	/** Profondeur : plus grand = plus près de l'observateur. */
	depth(p: Vec3): number;
}

/**
 * @param towardViewer direction de la scène vers l'observateur
 * @param roll         rotation de l'image autour de l'axe de vue (radians)
 */
export function projector(towardViewer: Vec3, roll = 0): Projector {
	const view = norm(towardViewer);
	const worldUp: Vec3 = Math.abs(view[1]) > 0.999 ? [0, 0, -1] : [0, 1, 0];
	let right = norm(cross(worldUp, view));
	let up = cross(view, right);
	if (roll) {
		const c = Math.cos(roll);
		const s = Math.sin(roll);
		const r2: Vec3 = [right[0] * c + up[0] * s, right[1] * c + up[1] * s, right[2] * c + up[2] * s];
		const u2: Vec3 = [up[0] * c - right[0] * s, up[1] * c - right[1] * s, up[2] * c - right[2] * s];
		right = r2;
		up = u2;
	}
	return {
		view,
		right,
		up,
		project: (p) => [dot(p, right), -dot(p, up)],
		depth: (p) => dot(p, view),
	};
}

/** Faces visibles d'un pavé aligné sur les axes, vues depuis `view`. */
export function visibleFaces(min: Vec3, size: Vec3, view: Vec3): { normal: 'x' | 'y' | 'z'; corners: Vec3[] }[] {
	const [x, y, z] = min;
	const [a, b, c] = size;
	const faces: { normal: 'x' | 'y' | 'z'; corners: Vec3[] }[] = [];
	const sx = view[0] >= 0 ? x + a : x;
	const sy = view[1] >= 0 ? y + b : y;
	const sz = view[2] >= 0 ? z + c : z;
	faces.push({ normal: 'x', corners: [[sx, y, z], [sx, y + b, z], [sx, y + b, z + c], [sx, y, z + c]] });
	faces.push({ normal: 'y', corners: [[x, sy, z], [x + a, sy, z], [x + a, sy, z + c], [x, sy, z + c]] });
	faces.push({ normal: 'z', corners: [[x, y, sz], [x + a, y, sz], [x + a, y + b, sz], [x, y + b, sz]] });
	return faces;
}

/** Enveloppe convexe 2D (chaîne monotone d'Andrew). */
export function hull(points: Vec2[]): Vec2[] {
	const pts = [...points].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
	const turn = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lower: Vec2[] = [];
	for (const p of pts) {
		while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
		lower.push(p);
	}
	const upper: Vec2[] = [];
	for (const p of pts.reverse()) {
		while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
		upper.push(p);
	}
	return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
