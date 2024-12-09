import { RegexReplacement } from "@core/types/replacement-types"
import {
	camelCase,
	capitalCase,
	dotCase,
	kebabCase,
	pascalCase,
	pathCase,
	snakeCase,
} from "change-case"

export const casingReplacements: RegexReplacement[] = [
	{
		match: /^\{upper:(.+?)\}/,
		transform: (match) => {
			return match[1].toUpperCase()
		},
	},
	{
		match: /^\{lower:(.+?)\}/,
		transform: (match) => {
			return match[1].toUpperCase()
		},
	},
	{
		match: /^\{kebab:(.+?)\}/,
		transform: (match) => {
			return kebabCase(match[1])
		},
	},
	{
		match: /^\{camel:(.+?)\}/,
		transform: (match) => {
			return camelCase(match[1])
		},
	},
	{
		match: /^\{snake:(.+?)\}/,
		transform: (match) => {
			return snakeCase(match[1])
		},
	},
	{
		match: /^\{pascal:(.+?)\}/,
		transform: (match) => {
			return pascalCase(match[1])
		},
	},
	{
		match: /^\{capital:(.+?)\}/,
		transform: (match) => {
			return capitalCase(match[1])
		},
	},
	{
		match: /^\{path:(.+?)\}/,
		transform: (match) => {
			return pathCase(match[1])
		},
	},
	{
		match: /^\{dot:(.+?)\}/,
		transform: (match) => {
			return dotCase(match[1])
		},
	},
]
