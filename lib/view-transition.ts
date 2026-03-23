export function viewTransition(updateDOM: () => void) {
	document.documentElement.dataset.style = 'angled';
	document.startViewTransition(updateDOM);
}
