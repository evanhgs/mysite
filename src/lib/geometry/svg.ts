// Rendu SVG (algorithme du peintre) des deux illusions : triangle de
// Reutersvärd et escalier de Penrose. Sert de poster sans WebGL, de
// version « mouvement réduit » et d'illustration de la section Artinova.
import { hull, projector, type Vec2, type Vec3, visibleFaces } from './iso';
import { penroseStairs } from './penrose';
import { ISO_VIEW, REUTERSVARD_ROLL, reutersvardJoin, reutersvardPath } from './reutersvard';

export interface Tones {
	x: string;
	y: string;
	z: string;
	stroke: string;
}

export const MONO: Tones = { x: '#8e8e92', y: '#ececec', z: '#2a2a2d', stroke: '#0a0a0a' };

/** Déclinaison sur fond bleu Artinova (#2457D6). */
export const ARTINOVA_TONES: Tones = { x: '#9fb8f5', y: '#ffffff', z: '#173b93', stroke: '#2457d6' };

const f = (n: number) => Math.round(n * 100) / 100;
const poly = (pts: Vec2[]) => pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');

interface Block {
	min: Vec3;
	size: Vec3;
}

function renderBlocks(
	blocks: Block[],
	project: (p: Vec3) => Vec2,
	depth: (p: Vec3) => number,
	view: Vec3,
	tones: Tones,
	fix?: { front: number[]; back: number },
	pad = 0.4,
) {
	const center = (b: Block): Vec3 => [b.min[0] + b.size[0] / 2, b.min[1] + b.size[1] / 2, b.min[2] + b.size[2] / 2];
	const order = blocks.map((_, i) => i).sort((a, b) => depth(center(blocks[a])) - depth(center(blocks[b])));

	const drawBlock = (b: Block) =>
		visibleFaces(b.min, b.size, view)
			.map((face) => `<polygon points="${poly(face.corners.map(project))}" fill="${tones[face.normal]}"/>`)
			.join('');

	let body = order.map((i) => drawBlock(blocks[i])).join('');

	let defs = '';
	if (fix) {
		// La jonction impossible : on redessine les premiers blocs, mais
		// seulement à l'intérieur de la silhouette du dernier.
		const back = blocks[fix.back];
		const corners: Vec3[] = [];
		for (const dx of [0, 1]) for (const dy of [0, 1]) for (const dz of [0, 1])
			corners.push([back.min[0] + dx * back.size[0], back.min[1] + dy * back.size[1], back.min[2] + dz * back.size[2]]);
		defs = `<defs><clipPath id="join"><polygon points="${poly(hull(corners.map(project)))}"/></clipPath></defs>`;
		body += `<g clip-path="url(#join)">${fix.front.map((i) => drawBlock(blocks[i])).join('')}</g>`;
	}

	// Cadre au plus juste.
	const pts: Vec2[] = [];
	for (const b of blocks)
		for (const dx of [0, 1]) for (const dy of [0, 1]) for (const dz of [0, 1])
			pts.push(project([b.min[0] + dx * b.size[0], b.min[1] + dy * b.size[1], b.min[2] + dz * b.size[2]]));
	const minX = Math.min(...pts.map((p) => p[0])) - pad;
	const maxX = Math.max(...pts.map((p) => p[0])) + pad;
	const minY = Math.min(...pts.map((p) => p[1])) - pad;
	const maxY = Math.max(...pts.map((p) => p[1])) + pad;
	return {
		viewBox: `${f(minX)} ${f(minY)} ${f(maxX - minX)} ${f(maxY - minY)}`,
		inner: `${defs}<g stroke="${tones.stroke}" stroke-width="0.035" stroke-linejoin="round">${body}</g>`,
	};
}

/** Triangle de Reutersvärd de n cubes par côté. */
export function impossibleTriangleSvg(n = 4, tones: Tones = MONO, title = 'Triangle impossible de Reutersvärd') {
	const P = projector(ISO_VIEW, REUTERSVARD_ROLL);
	const blocks = reutersvardPath(n).map((min) => ({ min, size: [1, 1, 1] as Vec3 }));
	const { viewBox, inner } = renderBlocks(blocks, P.project, P.depth, P.view, tones, reutersvardJoin(n));
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img"><title>${title}</title>${inner}</svg>`;
}

export interface StairsSvg {
	svg: string;
	/** Positions (en % du cadre) du milieu de chaque volée, pour y poser des étiquettes. */
	anchors: { flight: number; x: number; y: number }[];
}

/** Escalier de Penrose : la boucle qui monte sans fin. */
export function penroseStairsSvg(tones: Tones = MONO, title = 'Escalier de Penrose'): StairsSvg {
	const { steps, D } = penroseStairs();
	const P = projector(D);
	// Des colonnes pleines posées sur un socle commun : l'escalier se lit
	// comme un bâtiment, et la boucle comme une montée sans fin.
	const base = -2;
	const blocks: Block[] = steps.map((s) => ({ min: [s.x, base, s.z], size: [1, s.top - base, 1] }));
	// Pas de retouche à la jonction : vue le long de D, la profondeur réelle
	// donne déjà le bon recouvrement (la dernière marche passe devant la
	// première, comme devant la « suivante »). Même rendu que la version WebGL.
	const { viewBox, inner } = renderBlocks(blocks, P.project, P.depth, P.view, tones, undefined, 0.6);
	const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
	const anchors = [0, 1, 2, 3].map((flight) => {
		const inFlight = steps.map((s, i) => ({ s, i })).filter(({ s }) => s.flight === flight);
		const mid = inFlight[Math.floor(inFlight.length / 2)].s;
		const [x, y] = P.project([mid.x + 0.5, mid.top, mid.z + 0.5]);
		return { flight, x: ((x - vx) / vw) * 100, y: ((y - vy) / vh) * 100 };
	});
	return {
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img"><title>${title}</title>${inner}</svg>`,
		anchors,
	};
}
