import { flushSync } from 'react-dom';

export function viewTransition(navigate: () => void) {
	document.documentElement.dataset.style = 'angled';
	if (!document.startViewTransition) {
		navigate();
		return;
	}
	document.startViewTransition(() => {
		flushSync(navigate);
	});
}
