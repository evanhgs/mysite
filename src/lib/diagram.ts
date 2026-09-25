// Mise en page des schémas d'architecture : nœuds sur une grille, arêtes
// orthogonales (droites ou en L) qui contournent les cellules occupées.
import type { CollectionEntry } from 'astro:content';

export type Diagram = NonNullable<CollectionEntry<'projets'>['data']['diagram']>;
type Node = Diagram['nodes'][number];
type Edge = Diagram['edges'][number];

export interface Variant {
	/** Largeur et hauteur d'une cellule (unités du viewBox). */
	cellW: number;
	cellH: number;
	nodeW: number;
	nodeH: number;
	/** Tailles de police (unités du viewBox). */
	label: number;
	sub: number;
	edgeLabel: number;
	/** Permute lignes et colonnes (version mobile, verticale). */
	transpose: boolean;
}

export const DESKTOP: Variant = { cellW: 300, cellH: 180, nodeW: 226, nodeH: 88, label: 17, sub: 13.5, edgeLabel: 13, transpose: false };
export const MOBILE: Variant = { cellW: 340, cellH: 270, nodeW: 304, nodeH: 132, label: 36, sub: 26, edgeLabel: 25, transpose: true };

export interface LaidNode extends Node {
	x: number;
	y: number;
	w: number;
	h: number;
	cx: number;
	cy: number;
}

export interface LaidEdge extends Edge {
	d: string;
	/** L'étiquette ne tient pas sur son segment : elle reste dans la description textuelle. */
	labelHidden: boolean;
	labelX: number;
	labelY: number;
	labelWidth: number;
	fromLabel: string;
	toLabel: string;
}

export interface Layout {
	width: number;
	height: number;
	nodes: LaidNode[];
	edges: LaidEdge[];
	variant: Variant;
}

type Pt = [number, number];

export function layoutDiagram(diagram: Diagram, v: Variant): Layout {
	const cols = v.transpose ? diagram.rows : diagram.cols;
	const rows = v.transpose ? diagram.cols : diagram.rows;
	const nodes: LaidNode[] = diagram.nodes.map((n) => {
		const col = v.transpose ? n.row : n.col;
		const row = v.transpose ? n.col : n.row;
		const x = col * v.cellW + (v.cellW - v.nodeW) / 2;
		const y = row * v.cellH + (v.cellH - v.nodeH) / 2;
		return { ...n, col, row, x, y, w: v.nodeW, h: v.nodeH, cx: x + v.nodeW / 2, cy: y + v.nodeH / 2 };
	});
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const occupied = new Set(nodes.map((n) => `${n.col}:${n.row}`));
	const free = (c: number, r: number) => !occupied.has(`${c}:${r}`);
	const range = (a: number, b: number) => {
		const out: number[] = [];
		for (let i = Math.min(a, b) + 1; i < Math.max(a, b); i++) out.push(i);
		return out;
	};

	const edges: LaidEdge[] = diagram.edges.map((e) => {
		const a = byId.get(e.from)!;
		const b = byId.get(e.to)!;
		let path: Pt[];

		// Point d'attache sur le bord d'un nœud, dans la direction (dx, dy).
		const side = (n: LaidNode, dx: number, dy: number): Pt =>
			dx !== 0 ? [n.cx + Math.sign(dx) * (n.w / 2), n.cy] : [n.cx, n.cy + Math.sign(dy) * (n.h / 2)];

		if (a.row === b.row) {
			path = [side(a, b.col - a.col, 0), side(b, a.col - b.col, 0)];
		} else if (a.col === b.col) {
			path = [side(a, 0, b.row - a.row), side(b, 0, a.row - b.row)];
		} else {
			// En L : horizontal puis vertical si la voie est libre, sinon l'inverse.
			const hThenV =
				free(b.col, a.row) && range(a.col, b.col).every((c) => free(c, a.row)) && range(a.row, b.row).every((r) => free(b.col, r));
			if (hThenV) {
				path = [side(a, b.col - a.col, 0), [b.cx, a.cy], side(b, 0, a.row - b.row)];
			} else {
				path = [side(a, 0, b.row - a.row), [a.cx, b.cy], side(b, a.col - b.col, 0)];
			}
		}

		// Étiquette au milieu du plus long segment.
		let best = 0;
		let bestLen = -1;
		for (let i = 0; i < path.length - 1; i++) {
			const len = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
			if (len > bestLen) {
				bestLen = len;
				best = i;
			}
		}
		const [p, q] = [path[best], path[best + 1]];
		const labelWidth = (e.label?.length ?? 0) * v.edgeLabel * 0.56 + v.edgeLabel;
		const horizontal = p[1] === q[1];
		const room = bestLen - 12;
		const labelHidden = horizontal ? labelWidth > room : v.edgeLabel * 1.7 > room;
		const d = path.map(([x, y], i) => `${i ? 'L' : 'M'}${round(x)} ${round(y)}`).join(' ');
		return {
			...e,
			d,
			labelHidden,
			labelX: round((p[0] + q[0]) / 2),
			labelY: round((p[1] + q[1]) / 2),
			labelWidth: round(labelWidth),
			fromLabel: a.label,
			toLabel: b.label,
		};
	});

	return { width: cols * v.cellW, height: rows * v.cellH, nodes, edges, variant: v };
}

const round = (n: number) => Math.round(n * 10) / 10;
