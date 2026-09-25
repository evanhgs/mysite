// Échantillonne un titre HTML en points (coordonnées CSS relatives au canvas
// WebGL), glyphe par glyphe, exactement là où le navigateur l'a dessiné.
// Chaque caractère est redessiné à sa position DOM et mis à la largeur DOM :
// crénage, interlettrage et largeur variable (font-stretch) restent fidèles
// même si le canvas 2D ne gère pas tout.

export interface TextSample {
	/** Couples (x, y) en px CSS, relatifs au canvas cible. */
	points: Float32Array;
	count: number;
	/** Pas d'échantillonnage (px CSS) : taille apparente d'un cube. */
	pitch: number;
}

const STRETCH: Record<string, string> = {
	'50%': 'ultra-condensed',
	'62.5%': 'extra-condensed',
	'75%': 'condensed',
	'87.5%': 'semi-condensed',
	'100%': 'normal',
};

export async function sampleHeading(el: HTMLElement, target: DOMRect, wanted: number): Promise<TextSample | null> {
	const text = el.firstChild;
	if (!text || text.nodeType !== Node.TEXT_NODE) return null;
	const style = getComputedStyle(el);
	const size = parseFloat(style.fontSize);
	const stretch = STRETCH[style.fontStretch] ?? 'normal';
	const font = `${style.fontStyle} ${style.fontWeight} ${stretch} ${size}px ${style.fontFamily}`;
	try {
		await Promise.race([document.fonts.load(font), new Promise((r) => setTimeout(r, 2500))]);
	} catch {
		/* on dessine avec ce qui est chargé */
	}

	// Rectangle de chaque caractère visible.
	const content = text.textContent ?? '';
	const range = document.createRange();
	const glyphs: { ch: string; r: DOMRect }[] = [];
	for (let i = 0; i < content.length; i++) {
		const ch = content[i];
		if (ch.trim() === '') continue;
		range.setStart(text, i);
		range.setEnd(text, i + 1);
		const r = range.getBoundingClientRect();
		if (r.width > 0) glyphs.push({ ch: style.textTransform === 'uppercase' ? ch.toUpperCase() : ch, r });
	}
	if (glyphs.length === 0) return null;

	const left = Math.min(...glyphs.map((g) => g.r.left));
	const top = Math.min(...glyphs.map((g) => g.r.top));
	const right = Math.max(...glyphs.map((g) => g.r.right));
	const bottom = Math.max(...glyphs.map((g) => g.r.bottom));
	const scale = 2; // précision : 2 px de canvas par px CSS
	const pad = 4;
	const w = Math.ceil((right - left + pad * 2) * scale);
	const h = Math.ceil((bottom - top + pad * 2) * scale);

	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) return null;
	ctx.scale(scale, scale);
	ctx.font = font;
	ctx.fillStyle = '#fff';
	ctx.textBaseline = 'alphabetic';

	for (const { ch, r } of glyphs) {
		const m = ctx.measureText(ch);
		const ascent = m.fontBoundingBoxAscent ?? size * 0.9;
		const descent = m.fontBoundingBoxDescent ?? size * 0.25;
		const baseline = r.top - top + pad + (r.height - (ascent + descent)) / 2 + ascent;
		const sx = m.width > 0 ? r.width / m.width : 1;
		ctx.save();
		ctx.translate(r.left - left + pad, baseline);
		ctx.scale(sx, 1);
		ctx.fillText(ch, 0, 0);
		ctx.restore();
	}

	const img = ctx.getImageData(0, 0, w, h).data;
	const alpha = (x: number, y: number) => img[(Math.floor(y * scale) * w + Math.floor(x * scale)) * 4 + 3];

	// Pas choisi pour obtenir environ `wanted` points.
	let ink = 0;
	for (let i = 3; i < img.length; i += 4) if (img[i] > 127) ink++;
	const inkCss = ink / (scale * scale);
	let pitch = Math.sqrt(inkCss / wanted);
	const cssW = w / scale;
	const cssH = h / scale;

	const collect = (p: number) => {
		const pts: number[] = [];
		for (let y = p / 2; y < cssH; y += p) {
			for (let x = p / 2; x < cssW; x += p) {
				if (alpha(x, y) > 127) pts.push(x + left - pad - target.left, y + top - pad - target.top);
			}
		}
		return pts;
	};
	let pts = collect(pitch);
	// Ajustement : on vise juste en dessous de `wanted`.
	for (let i = 0; i < 6 && pts.length / 2 > wanted; i++) {
		pitch *= Math.sqrt(pts.length / 2 / wanted) * 1.01;
		pts = collect(pitch);
	}
	return { points: Float32Array.from(pts), count: pts.length / 2, pitch };
}
