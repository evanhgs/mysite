// Préférences d'animation partagées par tous les scripts du site.
const KEY = 'motion';
const root = document.documentElement;

const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
type Listener = () => void;
const listeners = new Set<Listener>();

function readStored(): string | null {
	try {
		return localStorage.getItem(KEY);
	} catch {
		return null;
	}
}

let userOff = readStored() === 'off';
if (userOff) root.dataset.motion = 'off';

const notify = () => listeners.forEach((fn) => fn());
reducedQuery.addEventListener('change', notify);

export const prefs = {
	/** Animations coupées par le système ou par l'interrupteur du pied de page. */
	get reducedMotion(): boolean {
		return reducedQuery.matches || userOff;
	},
	get saveData(): boolean {
		const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
		return Boolean(c?.saveData);
	},
	get coarsePointer(): boolean {
		return matchMedia('(pointer: coarse)').matches;
	},
	setUserMotion(on: boolean) {
		userOff = !on;
		if (userOff) root.dataset.motion = 'off';
		else delete root.dataset.motion;
		try {
			localStorage.setItem(KEY, on ? 'on' : 'off');
		} catch {
			/* stockage indisponible : réglage limité à la page */
		}
		notify();
	},
	onChange(fn: Listener) {
		listeners.add(fn);
		return () => listeners.delete(fn);
	},
};
