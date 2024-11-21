export class NoUrlDefinedError extends Error {
	constructor(alias: string) {
		super(`No url defined for alias: ${alias}`)
	}
}
