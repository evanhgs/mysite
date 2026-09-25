// Script commun à toutes les pages : horloge de l'en-tête et interrupteur
// d'animations du pied de page.
import { prefs } from './prefs';
import { startSmoothScroll } from './smooth-scroll';

function startClock() {
	const el = document.querySelector<HTMLTimeElement>('[data-clock]');
	if (!el) return;
	const fmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
	const tick = () => {
		const now = new Date();
		el.textContent = fmt.format(now);
		el.dateTime = now.toISOString();
	};
	tick();
	setInterval(tick, 15_000);
}

function motionToggle() {
	const btn = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
	const state = btn?.querySelector('[data-motion-state]');
	if (!btn || !state) return;
	const render = () => {
		const on = !prefs.reducedMotion;
		btn.setAttribute('aria-pressed', String(on));
		state.textContent = on ? 'activées' : 'coupées';
	};
	btn.addEventListener('click', () => prefs.setUserMotion(prefs.reducedMotion));
	prefs.onChange(render);
	render();
}

startClock();
motionToggle();
startSmoothScroll();
