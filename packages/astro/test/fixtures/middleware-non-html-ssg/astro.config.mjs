import { defineConfig } from 'astro/config';

export default defineConfig({
	output: "static",
	integrations: [
		{
			name: "manifest-tester",
			hooks: {
				'astro:build:ssr': (options) => {
					// @TODO Can we add a test for this?
					console.log(`astro:build:ssr`, {options, assets: options.manifest?.assets})
				},
				// 'astro:build:done': ({dir, routes, pages}) => {
				// 	// @TODO Can we add a test for this?
				// 	console.log(`astro:build:done`, {dir, routes, pages})
				// },
			}
		}
	]
});
