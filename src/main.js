import App from './App.svelte';
import parsing from "./parsing"
const app = new App({
	target: document.body,
	props: {
		name: 'world',
	},
});

export default app;
