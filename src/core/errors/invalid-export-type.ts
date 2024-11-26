export class InvalidExportTypeError extends Error {
	constructor(type: string) {
		super(`Invalid export type: ${type}`)
	}
}
