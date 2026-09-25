// Triangle impossible d'Oscar Reutersvärd (1934) en cubes : trois jambes
// +x, +y, +z de n cubes. Le cube suivant le dernier serait en (n, n, n),
// qui se projette exactement sur le premier en vue isométrique (1, 1, 1).
import type { Vec3 } from './iso';

export const ISO_VIEW: Vec3 = [1, 1, 1];

/** Positions (coin minimal) des 3n cubes, dans l'ordre du chemin. */
export function reutersvardPath(n: number): Vec3[] {
	const cubes: Vec3[] = [];
	for (let k = 0; k < 3 * n; k++) {
		if (k < n) cubes.push([k, 0, 0]);
		else if (k < 2 * n) cubes.push([n, k - n, 0]);
		else cubes.push([n, n, k - 2 * n]);
	}
	return cubes;
}

/**
 * Indices des cubes dont l'ordre de dessin doit être « truqué » pour que la
 * jonction paraisse continue : le premier cube et son voisin passent devant
 * le dernier, alors qu'ils sont en réalité loin derrière.
 */
export function reutersvardJoin(n: number): { front: number[]; back: number } {
	return { front: [0, 1], back: 3 * n - 1 };
}

/** Roulis (radians) qui pose le triangle sur sa base, pointe en haut. */
export const REUTERSVARD_ROLL = Math.PI / 2;
