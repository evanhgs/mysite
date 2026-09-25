// Déchiffre une donnée obfusquée au format ALTCHA (altcha-lib/obfuscation)
// par preuve de travail : PBKDF2/SHA-256 sur nonce + compteur (uint32 big-endian)
// jusqu'à retrouver le préfixe de clé publié, puis AES-256-GCM.
// Uniquement WebCrypto : pas de worker, pas de blob, compatible CSP stricte.

interface Payload {
	parameters: { algorithm: string; nonce: string; salt: string; cost: number; keyLength?: number; keyPrefix: string };
	cipher: { iv: string; data: string };
}

const hex = (s: string) => Uint8Array.from(s.match(/../g) ?? [], (b) => parseInt(b, 16));

async function derive(nonce: Uint8Array, counter: number, salt: Uint8Array, cost: number, bytes: number) {
	const password = new Uint8Array(nonce.length + 4);
	password.set(nonce);
	new DataView(password.buffer).setUint32(nonce.length, counter, false);
	const base = await crypto.subtle.importKey('raw', password, 'PBKDF2', false, ['deriveBits']);
	const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: cost, hash: 'SHA-256' }, base, bytes * 8);
	return new Uint8Array(bits);
}

/**
 * @param encoded   données encodées en base64 (sortie de `obfuscate`)
 * @param onAttempt appelé avec le nombre d'essais effectués
 */
export async function solve(encoded: string, onAttempt?: (n: number) => void): Promise<string> {
	const { parameters: p, cipher } = JSON.parse(atob(encoded)) as Payload;
	if (p.algorithm !== 'PBKDF2/SHA-256') throw new Error(`Algorithme non pris en charge : ${p.algorithm}`);
	const nonce = hex(p.nonce);
	const salt = hex(p.salt);
	const prefix = hex(p.keyPrefix);
	const bytes = p.keyLength ?? 32;
	const lanes = Math.max(1, Math.min(4, navigator.hardwareConcurrency || 2));

	for (let start = 0; start < 1_000_000; start += lanes) {
		const keys = await Promise.all(
			Array.from({ length: lanes }, (_, i) => derive(nonce, start + i, salt, p.cost, bytes)),
		);
		onAttempt?.(start + lanes);
		const key = keys.find((k) => prefix.every((b, i) => k[i] === b));
		if (key) {
			const aes = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt']);
			const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: hex(cipher.iv) }, aes, hex(cipher.data));
			return new TextDecoder().decode(plain);
		}
	}
	throw new Error('Aucune solution trouvée.');
}
