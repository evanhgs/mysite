// /apple-touch-icon.png : 180 × 180, tuile carrée (iOS arrondit lui-même).
import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { iconSvg } from '@lib/icon';

export const GET: APIRoute = async () => {
	const png = await sharp(Buffer.from(iconSvg(0)), { density: 432 }).resize(180, 180).png({ compressionLevel: 9 }).toBuffer();
	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
