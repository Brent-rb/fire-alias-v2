export type StringReplacement = {
	match: string
	transform: () => string
}

export type RegexReplacement = {
	match: RegExp
	transform: (
		match: RegExpMatchArray,
		replace: (input: string) => string | undefined,
	) => string
}

export type Replacement = RegexReplacement | StringReplacement

export type ReplacementList = Replacement[]
