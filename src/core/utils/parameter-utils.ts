import { casingReplacements } from "@core/replacements/casing-replacements"
import { conditionalReplacements } from "@core/replacements/conditional-replacements"
import {
	ReplacementList,
	StringReplacement,
} from "@core/types/replacement-types"

function _findReplacement(
	replacements: ReplacementList,
	input: string,
): string | undefined {
	input = input.trim()

	// #region String replacements
	const stringReplacements = replacements.filter(
		(replacement) => typeof replacement.match === "string",
	) as StringReplacement[]
	const stringReplacement = stringReplacements.find((replacement) => {
		return replacement.match === input
	})
	if (stringReplacement !== undefined) {
		return stringReplacement.transform()
	}
	// #endregion

	// #region Regexp replacements
	const regexReplacements = replacements.filter(
		(replacement) => replacement.match instanceof RegExp,
	)
	const regexReplacement = regexReplacements.find((replacement) => {
		const hasMatch = input.match(replacement.match) !== null
		return hasMatch
	})
	if (!regexReplacement) {
		return undefined
	}

	return regexReplacement.transform(
		input.match(regexReplacement.match)!,
		(input) => _findReplacement(replacements, input),
	)
	// #endRegion
}

function _replaceParameters(
	replacements: ReplacementList,
	url: string,
	startIndex = 0,
) {
	let buffer = ""
	let i = startIndex
	for (; i < url.length; i++) {
		const char = url.charAt(i)

		if (char === "{") {
			const result = _replaceParameters(replacements, url, i + 1)
			const replacement =
				_findReplacement(replacements, `{${result.value}}`) ?? ""
			buffer = `${buffer}${replacement}`
			i = result.position
		} else if (char === "}") {
			return {
				value: `${buffer}`,
				position: i,
			}
		} else {
			buffer = `${buffer}${char}`
		}
	}

	return {
		value: buffer,
		position: i,
	}
}

export function replaceParameters(alias: string, url: string, input: string) {
	const aliasParts = alias.split(" ")
	const inputParts = input.trim().split(" ").slice(aliasParts.length)

	const partReplacements: StringReplacement[] = inputParts.map(
		(value, index) => ({
			match: `{${index + 1}}`,
			transform: () => value,
		}),
	)

	const replacements: ReplacementList = [
		{
			match: "{0}",
			transform: () => alias,
		},
		{
			match: "{@}",
			transform: () => inputParts.join(" "),
		},
		...partReplacements,
		...conditionalReplacements,
		...casingReplacements,
	]

	return _replaceParameters(replacements, url).value
}
