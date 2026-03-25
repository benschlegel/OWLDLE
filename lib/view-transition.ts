import { startTransition } from 'react';

export function viewTransition(navigate: () => void) {
	document.documentElement.dataset.style = 'angled';
	document.startViewTransition(() => {
		startTransition(navigate);
	});
}
