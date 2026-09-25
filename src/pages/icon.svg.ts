// /icon.svg : favicon vectoriel (navigateurs récents).
import type { APIRoute } from 'astro';
import { iconSvg } from '@lib/icon';

export const GET: APIRoute = () => new Response(iconSvg(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
