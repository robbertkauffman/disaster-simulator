import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
	}
});

export default app;

export function getTimestamp(date) {
	return new Date(date).toLocaleString('en-US', { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit'});
};