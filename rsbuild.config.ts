import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

export default defineConfig({
	source: {
		aliasStrategy: "prefer-tsconfig",
	},
	server: {
		publicDir: false,
	},
	environments: {
		backgroundFirefox: {
			source: {
				entry: {
					index: `./src/background/index.ts`,
				},
			},
			output: {
				filename: {
					js: "background.js",
				},
				distPath: {
					root: "./dist-firefox",
					js: "./",
				},
				target: "web-worker",
			},
			performance: {
				chunkSplit: {
					strategy: "all-in-one",
				},
			},
		},
		extensionFirefox: {
			source: {
				entry: {
					index: `./src/extension/index.tsx`,
				},
			},
			output: {
				distPath: {
					root: "./dist-firefox",
				},
				copy: [
					{ from: "./manifest.firefox.json", to: "manifest.json" },
					{ from: "./public", to: "./" },
				],
			},
		},

		backgroundChrome: {
			source: {
				entry: {
					index: `./src/background/index.ts`,
				},
			},
			output: {
				filename: {
					js: "background.js",
				},
				distPath: {
					root: "./dist-chrome",
					js: "./",
				},
				target: "web-worker",
			},
			performance: {
				chunkSplit: {
					strategy: "all-in-one",
				},
			},
		},
		extensionChrome: {
			source: {
				entry: {
					index: `./src/extension/index.tsx`,
				},
			},
			output: {
				distPath: {
					root: "./dist-chrome",
				},
				copy: [
					{ from: "./manifest.chrome.json", to: "./manifest.json" },
					{ from: "./public", to: "./" },
				],
			},
		},
	},
	plugins: [pluginReact()],
})
