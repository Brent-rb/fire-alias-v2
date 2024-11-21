import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

export default defineConfig({
	source: {
		aliasStrategy: "prefer-tsconfig",
	},
	environments: {
		background: {
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
		extension: {
			source: {
				entry: {
					index: `./src/extension/index.tsx`,
				},
			},
			output: {
				copy: [{ from: "./manifest.json" }],
			},
		},
	},
	plugins: [pluginReact()],
})
