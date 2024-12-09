import { RegexReplacement } from "@core/types/replacement-types"

export const conditionalReplacements: RegexReplacement[] = [
	{
		match: /^\{\?(\d+?):(.+?)\}/,
		transform: (match, replace) => {
			const aliasNumber = match[1]
			const replacement = match[2]
			if (replace(`{${aliasNumber}}`) !== undefined) {
				return replacement
			}
			return ""
		},
	},
]
