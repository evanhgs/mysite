// Icône du site : le triangle impossible de l'accueil, trois cubes par côté,
// sur une tuile sombre. Une seule source pour le SVG, le .ico et l'icône iOS.
import { impossibleTriangleParts } from './geometry/svg';

const TONES = { x: '#ff4f1f', y: '#ececec', z: '#5c5c61', stroke: '#0a0a0a' };

/**
 * @param radius rayon des coins de la tuile (sur 100) ; 0 pour l'icône iOS,
 *               que le système arrondit lui-même
 */
export function iconSvg(radius = 22): string {
	const { viewBox, inner } = impossibleTriangleParts(3, TONES);
	const [x, y, w, h] = viewBox.split(' ').map(Number);
	const margin = 0.15;
	const scale = ((1 - 2 * margin) * 100) / Math.max(w, h);
	const tx = 50 - (x + w / 2) * scale;
	const ty = 50 - (y + h / 2) * scale;
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">` +
		`<rect width="100" height="100" rx="${radius}" fill="#0a0a0a"/>` +
		`<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">${inner}</g></svg>`
	);
}
