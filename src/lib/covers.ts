// Couvertures op-art génératives, une par projet. Déterministes (graine),
// en SVG pur : servies en <img>, en aperçu au survol et en texture WebGL.
import { mulberry32 } from './prng';

export type Motif = 'lattice' | 'moire' | 'bulge' | 'sheets' | 'shelves' | 'speed' | 'dots' | 'broken' | 'orbit';

const W = 1600;
const H = 1000;
const BG = '#0a0a0a';
const FG = '#ececec';
const DIM = '#1c1c1f';

interface Ctx {
	accent: string;
	rand: () => number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const pts = (p: [number, number][]) => p.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ');
const SQ3 = Math.sqrt(3);

/** Treillis de cubes isométriques ; au centre, les cubes s'inversent (Vasarely). */
function lattice({ accent }: Ctx): string {
	const s = 84;
	const dx = s * SQ3;
	const dy = s * 1.5;
	const cx = W / 2;
	const cy = H / 2;
	let out = '';
	for (let row = -1; row * dy < H + s; row++) {
		for (let col = -1; col * dx < W + dx; col++) {
			const x = col * dx + (row % 2 ? dx / 2 : 0);
			const y = row * dy;
			const d = Math.hypot((x - cx) / W, (y - cy) / H);
			const inverted = d < 0.26;
			const top: [number, number][] = [[x, y - s], [x + dx / 2, y - s / 2], [x, y], [x - dx / 2, y - s / 2]];
			const left: [number, number][] = [[x - dx / 2, y - s / 2], [x, y], [x, y + s], [x - dx / 2, y + s / 2]];
			const right: [number, number][] = [[x, y], [x + dx / 2, y - s / 2], [x + dx / 2, y + s / 2], [x, y + s]];
			const [ft, fl, fr] = inverted ? [DIM, FG, accent] : [FG, accent, DIM];
			out += `<polygon points="${pts(top)}" fill="${ft}"/><polygon points="${pts(left)}" fill="${fl}"/><polygon points="${pts(right)}" fill="${fr}"/>`;
		}
	}
	return `<g stroke="${BG}" stroke-width="3" stroke-linejoin="round">${out}</g>`;
}

/** Deux familles de cercles concentriques légèrement décalées : un moiré. */
function moire({ accent, rand }: Ctx): string {
	const a = [W * 0.44, H * 0.5];
	const b = [W * 0.56 + rand() * 30, H * 0.52];
	let ga = '';
	let gb = '';
	for (let r = 10; r < 1000; r += 15) {
		ga += `<circle cx="${r1(a[0])}" cy="${r1(a[1])}" r="${r}"/>`;
		gb += `<circle cx="${r1(b[0])}" cy="${r1(b[1])}" r="${r + 5}"/>`;
	}
	return `<g fill="none" stroke-width="5"><g stroke="${FG}">${ga}</g><g stroke="${accent}" opacity="0.9">${gb}</g></g>`;
}

/** Damier déformé par une lentille bombée. */
function bulge({ accent }: Ctx): string {
	const nx = 24;
	const ny = 15;
	const cx = W / 2;
	const cy = H / 2;
	const R = 560;
	const warp = (u: number, v: number): [number, number] => {
		const x = (u / nx) * W;
		const y = (v / ny) * H;
		const dxp = x - cx;
		const dyp = y - cy;
		const d = Math.hypot(dxp, dyp);
		if (d >= R || d === 0) return [x, y];
		const k = Math.pow(d / R, 0.62) * R;
		return [cx + (dxp / d) * k, cy + (dyp / d) * k];
	};
	let out = '';
	for (let v = 0; v < ny; v++) {
		for (let u = 0; u < nx; u++) {
			if ((u + v) % 2) continue;
			const center = warp(u + 0.5, v + 0.5);
			const inside = Math.hypot(center[0] - cx, center[1] - cy) < R * 0.42;
			const poly = [warp(u, v), warp(u + 1, v), warp(u + 1, v + 1), warp(u, v + 1)];
			out += `<polygon points="${pts(poly)}" fill="${inside ? accent : FG}"/>`;
		}
	}
	return out;
}

/** Feuilles empilées en recul : le presse-papiers et ses copies. */
function sheets({ accent }: Ctx): string {
	let out = '';
	const n = 13;
	for (let i = n - 1; i >= 0; i--) {
		const t = i / (n - 1);
		const w = 820 - t * 400;
		const h = 560 - t * 280;
		const x = W * 0.4 + t * 460 - w / 2;
		const y = H * 0.6 - t * 300 - h / 2;
		const front = i === 0;
		out += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${BG}" stroke="${front ? accent : FG}" stroke-width="${front ? 6 : 3}"/>`;
		if (front) {
			for (let l = 0; l < 6; l++) {
				const lw = w * (0.8 - (l % 3) * 0.17);
				out += `<rect x="${r1(x + 50)}" y="${r1(y + 70 + l * 62)}" width="${r1(lw - 60)}" height="16" fill="${l === 1 ? accent : FG}"/>`;
			}
		}
	}
	return out;
}

/** Rayonnages isométriques et colis empilés (palettisation), cadrés au centre. */
function shelves({ accent, rand }: Ctx): string {
	type P = [number, number];
	// Projection isométrique unitaire, puis mise à l'échelle sur le cadre.
	const iso = (x: number, y: number, z: number): P => [(x - y) * (SQ3 / 2), (x + y) * 0.5 - z];
	const shapes: { poly: P[]; fill: string; stroke?: boolean }[] = [];
	const box = (x: number, y: number, z: number, sx: number, sy: number, sz: number, hot: boolean) => {
		shapes.push({ poly: [iso(x, y, z + sz), iso(x + sx, y, z + sz), iso(x + sx, y + sy, z + sz), iso(x, y + sy, z + sz)], fill: hot ? accent : FG });
		shapes.push({ poly: [iso(x, y + sy, z), iso(x + sx, y + sy, z), iso(x + sx, y + sy, z + sz), iso(x, y + sy, z + sz)], fill: hot ? '#3d6f84' : '#8e8e92' });
		shapes.push({ poly: [iso(x + sx, y, z), iso(x + sx, y + sy, z), iso(x + sx, y + sy, z + sz), iso(x + sx, y, z + sz)], fill: DIM });
	};
	const L = 16;
	const D = 5;
	const levels = [0, 3.4, 6.8];
	const posts: [P, P][] = [];
	for (const z of levels) {
		shapes.push({ poly: [iso(0, 0, z), iso(L, 0, z), iso(L, D, z), iso(0, D, z)], fill: 'none', stroke: true });
		for (let x = 0; x < L; ) {
			const sx = 1.3 + Math.floor(rand() * 3) * 0.75;
			if (x + sx > L) break;
			const sy = 2 + rand() * 2.6;
			const sz = 1 + rand() * 1.7;
			if (rand() > 0.18) box(x, D - sy, z, sx, sy, sz, rand() > 0.7);
			x += sx + 0.35;
		}
	}
	for (const [x, y] of [[0, 0], [L, 0], [L, D], [0, D]] as P[]) posts.push([iso(x, y, 0), iso(x, y, 10)]);

	const all = [...shapes.flatMap((s) => s.poly), ...posts.flat()];
	const minX = Math.min(...all.map((p) => p[0]));
	const maxX = Math.max(...all.map((p) => p[0]));
	const minY = Math.min(...all.map((p) => p[1]));
	const maxY = Math.max(...all.map((p) => p[1]));
	const k = Math.min((W * 0.82) / (maxX - minX), (H * 0.82) / (maxY - minY));
	const ox = W / 2 - ((minX + maxX) / 2) * k;
	const oy = H / 2 - ((minY + maxY) / 2) * k;
	const tr = (p: P): P => [ox + p[0] * k, oy + p[1] * k];

	let out = '';
	for (const s of shapes) {
		out += s.stroke
			? `<polygon points="${pts(s.poly.map(tr))}" fill="none" stroke="${FG}" stroke-width="3"/>`
			: `<polygon points="${pts(s.poly.map(tr))}" fill="${s.fill}"/>`;
	}
	for (const [a, b] of posts) {
		const [x1, y1] = tr(a);
		const [x2, y2] = tr(b);
		out += `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${FG}" stroke-width="4"/>`;
	}
	return out;
}

/** Lignes ondulées façon Bridget Riley : la vitesse. */
function speed({ accent }: Ctx): string {
	let out = '';
	const lines = 48;
	for (let i = 0; i < lines; i++) {
		const y0 = (i + 0.5) * (H / lines);
		let d = '';
		for (let x = -32; x <= W + 32; x += 32) {
			const t = x / W;
			const amp = 38 * Math.sin(Math.PI * t) * (0.4 + 0.6 * Math.sin((i / lines) * Math.PI));
			const y = y0 + amp * Math.sin(t * 9 + i * 0.22);
			d += `${d ? 'L' : 'M'}${r1(x)} ${r1(y)}`;
		}
		const hot = i > lines * 0.44 && i < lines * 0.56;
		out += `<path d="${d}" stroke="${hot ? accent : FG}"/>`;
	}
	return `<g fill="none" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${out}</g>`;
}

/** Trame de points modulée ; huit points sélectionnés (l'équipe optimale). */
function dots({ accent, rand }: Ctx): string {
	const nx = 27;
	const ny = 17;
	const step = W / nx;
	const hubs = [
		[W * 0.35, H * 0.4],
		[W * 0.68, H * 0.62],
	];
	const chosen = new Set<number>();
	while (chosen.size < 8) chosen.add(Math.floor(rand() * nx * ny));
	let out = '';
	let picked = '';
	for (let j = 0; j < ny; j++) {
		for (let i = 0; i < nx; i++) {
			const x = (i + 0.5) * step;
			const y = (j + 0.5) * (H / ny);
			const d = Math.min(...hubs.map(([hx, hy]) => Math.hypot(x - hx, y - hy)));
			const r = 5 + 19 * Math.exp(-d / 330);
			const id = j * nx + i;
			if (chosen.has(id)) {
				picked += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r + 6)}" fill="${accent}"/><circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r + 18)}" fill="none" stroke="${accent}" stroke-width="3"/>`;
			} else {
				out += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}"/>`;
			}
		}
	}
	return `<g fill="${FG}">${out}</g>${picked}`;
}

/** Rayures diagonales interrompues par une bande décalée : le signal coupé. */
function broken({ accent }: Ctx): string {
	const period = 64;
	const band = [H * 0.4, H * 0.6];
	const stripes = (offset: number) => {
		let s = '';
		for (let x = -H; x < W + H; x += period) {
			const a = x + offset;
			s += `<polygon points="${pts([[a, 0], [a + period / 2, 0], [a + period / 2 + H, H], [a + H, H]])}"/>`;
		}
		return s;
	};
	return `<defs><clipPath id="cv-out"><rect width="${W}" height="${band[0]}"/><rect y="${band[1]}" width="${W}" height="${H - band[1]}"/></clipPath><clipPath id="cv-in"><rect y="${band[0]}" width="${W}" height="${band[1] - band[0]}"/></clipPath></defs><g fill="${FG}" clip-path="url(#cv-out)">${stripes(0)}</g><g fill="${accent}" clip-path="url(#cv-in)">${stripes(period / 2)}</g><rect y="${band[0] - 3}" width="${W}" height="6" fill="${BG}"/><rect y="${band[1] - 3}" width="${W}" height="6" fill="${BG}"/>`;
}

/** Orbites et trajectoires pointillées ; un avion en papier. */
function orbit({ accent, rand }: Ctx): string {
	let out = '';
	const cx = W * 0.5;
	const cy = H * 0.5;
	for (let i = 0; i < 11; i++) {
		const rx = 140 + i * 72;
		const ry = 70 + i * 36;
		const rot = -18 + i * 2.2;
		out += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${r1(rot)} ${cx} ${cy})" stroke-dasharray="${i % 2 ? '2 16' : '26 14'}"/>`;
	}
	let sats = '';
	for (let i = 0; i < 11; i++) {
		const rx = 140 + i * 72;
		const ry = 70 + i * 36;
		const a = rand() * Math.PI * 2;
		const rot = ((-18 + i * 2.2) * Math.PI) / 180;
		const x = rx * Math.cos(a);
		const y = ry * Math.sin(a);
		sats += `<circle cx="${r1(cx + x * Math.cos(rot) - y * Math.sin(rot))}" cy="${r1(cy + x * Math.sin(rot) + y * Math.cos(rot))}" r="${i % 3 ? 7 : 12}"/>`;
	}
	const plane = pts([[cx - 70, cy + 40], [cx + 90, cy - 30], [cx - 20, cy + 70]]);
	const wing = pts([[cx - 20, cy + 70], [cx + 90, cy - 30], [cx - 5, cy + 30]]);
	return `<g fill="none" stroke="${FG}" stroke-width="4">${out}</g><g fill="${FG}">${sats}</g><polygon points="${plane}" fill="${accent}"/><polygon points="${wing}" fill="${FG}"/>`;
}

const MOTIFS: Record<Motif, (ctx: Ctx) => string> = {
	lattice,
	moire,
	bulge,
	sheets,
	shelves,
	speed,
	dots,
	broken,
	orbit,
};

export interface CoverOptions {
	motif: Motif;
	accent: string;
	seed?: number;
	title?: string;
}

/** Document SVG complet (1600 × 1000), recadrable par `xMidYMid slice`. */
export function coverSvg({ motif, accent, seed = 1, title }: CoverOptions): string {
	const body = MOTIFS[motif]({ accent, rand: mulberry32(seed * 9973 + motif.length) });
	const label = title ? `<title>${title}</title>` : '';
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" role="img">${label}<rect width="${W}" height="${H}" fill="${BG}"/>${body}</svg>`;
}
