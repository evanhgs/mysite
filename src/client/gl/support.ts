// Détection de WebGL2 sans garder de contexte ouvert (les navigateurs en
// limitent le nombre).
export function webgl2Available(): boolean {
	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2');
		gl?.getExtension('WEBGL_lose_context')?.loseContext();
		return Boolean(gl);
	} catch {
		return false;
	}
}
