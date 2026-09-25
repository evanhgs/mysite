// Page contact : case « Je ne suis pas un robot » → preuve de travail →
// l'adresse apparaît, se recompose lettre par lettre, et peut être copiée.
import { solve } from './altcha-solve';

const root = document.querySelector<HTMLElement>('[data-captcha]');
const result = document.querySelector<HTMLElement>('[data-result]');

if (root && result) {
	const payload = root.dataset.payload!;
	const check = root.querySelector<HTMLButtonElement>('[data-check]')!;
	const status = root.querySelector<HTMLElement>('[data-status]')!;
	const emailEl = result.querySelector<HTMLAnchorElement>('[data-email]')!;
	const mailto = result.querySelector<HTMLAnchorElement>('[data-mailto]')!;
	const copyBtn = result.querySelector<HTMLButtonElement>('[data-copy]')!;
	const copied = result.querySelector<HTMLElement>('[data-copied]')!;
	const page = document.querySelector<HTMLElement>('[data-contact]');
	let state: 'idle' | 'working' | 'done' = 'idle';

	const renderEmail = (email: string) => {
		const href = `mailto:${email}?subject=${encodeURIComponent('Contact depuis evanhgs.fr')}`;
		emailEl.href = href;
		mailto.href = href;
		emailEl.setAttribute('aria-label', email);
		emailEl.replaceChildren(
			...[...email].map((ch, i) => {
				const span = document.createElement('span');
				span.className = 'ch';
				span.textContent = ch;
				span.setAttribute('aria-hidden', 'true');
				span.style.setProperty('--i', String(i));
				span.style.setProperty('--z', String(Math.round((Math.sin(i * 12.9898) * 43758.5453) % 1 * 900)));
				span.style.setProperty('--r', String(Math.round((Math.cos(i * 78.233) * 12345.678) % 1 * 70)));
				return span;
			}),
		);
	};

	const run = async () => {
		if (state !== 'idle') return;
		state = 'working';
		check.setAttribute('aria-checked', 'mixed');
		root.setAttribute('aria-busy', 'true');
		root.dataset.state = 'working';
		status.textContent = 'Vérification en cours…';
		const started = performance.now();
		try {
			const email = await solve(payload, (n) => {
				status.textContent = `Vérification : essai n° ${n}`;
			});
			// Durée minimale : la vérification doit se lire comme une étape.
			const wait = 900 - (performance.now() - started);
			if (wait > 0) await new Promise((r) => setTimeout(r, wait));
			state = 'done';
			check.setAttribute('aria-checked', 'true');
			check.disabled = true;
			root.removeAttribute('aria-busy');
			root.dataset.state = 'done';
			status.textContent = 'Vérifié.';
			renderEmail(email);
			result.hidden = false;
			page?.setAttribute('data-revealed', '');
			// Deux images : le temps que les lettres prennent leur position de départ.
			requestAnimationFrame(() => requestAnimationFrame(() => result.classList.add('is-in')));
			copyBtn.focus({ preventScroll: true });
		} catch (err) {
			state = 'idle';
			check.setAttribute('aria-checked', 'false');
			root.removeAttribute('aria-busy');
			root.dataset.state = 'error';
			status.textContent = 'La vérification a échoué. Réessayez, ou passez par LinkedIn.';
			console.error(err);
		}
	};

	check.addEventListener('click', run);

	// Esprit Typeform : Entrée lance la vérification si rien n'a le focus.
	document.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter' || state !== 'idle') return;
		const active = document.activeElement;
		if (active && active !== document.body && active !== check) return;
		e.preventDefault();
		run();
	});

	copyBtn.addEventListener('click', async () => {
		const email = emailEl.getAttribute('aria-label') ?? '';
		try {
			await navigator.clipboard.writeText(email);
			copied.textContent = 'Adresse copiée.';
		} catch {
			const range = document.createRange();
			range.selectNodeContents(emailEl);
			getSelection()?.removeAllRanges();
			getSelection()?.addRange(range);
			copied.textContent = 'Sélectionnée : Ctrl+C pour copier.';
		}
	});
}
