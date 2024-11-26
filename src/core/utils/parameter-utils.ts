function _replacePart(replacementMap: Map<string, string>, alias: string) {
	const regex = /\{?(\d+?):(.+?)\}/
	const match = alias.match(regex)
	if (!match) {
		const replacement = replacementMap.get(alias) ?? ""
		console.log(
			`[_replacePart] ${alias} -> ${replacement === "" ? "<empty-string>" : replacement}`,
		)
		return replacement
	}

	const aliasNumber = match[1]
	const replacement = match[2]

	if (replacementMap.has(`{${aliasNumber}}`)) {
		console.log(`[_replacePart] ${alias} -> ${replacement}`)
		return replacement
	}

	console.log(`[_replacePart] ${alias} -> <empty-string>`)
	return ""
}

function _replaceParameters(
	replacementMap: Map<string, string>,
	url: string,
	startIndex = 0,
) {
	let buffer = ""
	let i = startIndex
	for (; i < url.length; i++) {
		const char = url.charAt(i)

		if (char === "{") {
			const result = _replaceParameters(replacementMap, url, i + 1)
			const replacement = _replacePart(
				replacementMap,
				`{${result.value}}`,
			)
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

	const replacementMap = new Map([
		["{0}", alias],
		["{@}", inputParts.join(" ")],
	])

	for (let i = 0; i < inputParts.length; i++) {
		replacementMap.set(`{${i + 1}}`, inputParts[i])
	}

	return _replaceParameters(replacementMap, url).value
}
