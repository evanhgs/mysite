// /favicon.ico : conteneur ICO avec trois PNG (16, 32 et 48 px), pour les
// navigateurs et outils qui ne lisent pas le SVG.
import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { iconSvg } from '@lib/icon';

const SIZES = [16, 32, 48];

export const GET: APIRoute = async () => {
	const svg = Buffer.from(iconSvg());
	const pngs = await Promise.all(
		SIZES.map((s) => sharp(svg, { density: 300 }).resize(s, s).png({ compressionLevel: 9 }).toBuffer()),
	);
	const header = Buffer.alloc(6 + 16 * SIZES.length);
	header.writeUInt16LE(0, 0); // réservé
	header.writeUInt16LE(1, 2); // type : icône
	header.writeUInt16LE(SIZES.length, 4);
	let offset = header.length;
	SIZES.forEach((s, i) => {
		const at = 6 + 16 * i;
		header.writeUInt8(s, at); // largeur
		header.writeUInt8(s, at + 1); // hauteur
		header.writeUInt8(0, at + 2); // palette
		header.writeUInt8(0, at + 3); // réservé
		header.writeUInt16LE(1, at + 4); // plans
		header.writeUInt16LE(32, at + 6); // bits par pixel
		header.writeUInt32LE(pngs[i].length, at + 8);
		header.writeUInt32LE(offset, at + 12);
		offset += pngs[i].length;
	});
	const ico = Buffer.concat([header, ...pngs]);
	return new Response(new Uint8Array(ico), { headers: { 'Content-Type': 'image/x-icon' } });
};
