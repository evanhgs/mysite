// Escalier de Penrose : quatre volées qui montent sans fin. Le dernier pas
// est décalé du premier d'un vecteur D exactement parallèle à la direction
// de vue : en projection orthographique, la boucle se referme.
import type { Vec3 } from './iso';

export interface PenroseOptions {
	/** Nombre de marches de chaque volée (+x, +z, −x, −z). */
	flights?: [number, number, number, number];
	/** Hauteur d'une contremarche, en profondeurs de marche. */
	rise?: number;
}

export interface Step {
	/** Coin minimal de la marche (x, z au sol ; y = hauteur du dessus). */
	x: number;
	z: number;
	top: number;
	flight: 0 | 1 | 2 | 3;
}

export function penroseStairs({ flights = [5, 5, 3, 3], rise = 0.25 }: PenroseOptions = {}) {
	const [n1, n2, n3, n4] = flights;
	const steps: Step[] = [];
	let k = 0;
	const push = (x: number, z: number, flight: Step['flight']) => steps.push({ x, z, top: (k++ + 1) * rise, flight });
	for (let j = 0; j < n1; j++) push(j, 0, 0);
	for (let j = 0; j < n2; j++) push(n1, j, 1);
	for (let j = 0; j < n3; j++) push(n1 - j, n2, 2);
	for (let j = 0; j < n4; j++) push(n1 - n3, n2 - j, 3);
	const total = steps.length;
	/** Décalage entre la marche N (virtuelle) et la marche 0 : la direction de vue. */
	const D: Vec3 = [n1 - n3, total * rise, n2 - n4];
	return { steps, D, rise };
}
