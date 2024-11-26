import { NoUrlDefinedError } from "@core/errors/no-url-defined-error"

export class AliasMap {
	constructor(private map: Map<string, string>) {}

	static fromObject(data: object) {
		// console.log(`[AliasMap][fromObject]`)
		const map = new Map(Object.entries(data))
		return new AliasMap(map)
	}

	public has(alias: string) {
		// console.log(`[AliasMap][has]`)
		return this.map.has(alias)
	}

	public get(alias: string) {
		// console.log(`[AliasMap][get]`)
		return this.map.get(alias)
	}

	public getDefined(alias: string) {
		// console.log(`[AliasMap][getDefined]`)
		const url = this.get(alias)
		if (!url) {
			throw new NoUrlDefinedError(alias)
		}

		return url
	}

	public set(alias: string, url: string) {
		// console.log(`[AliasMap][set]`)
		this.map.set(alias.trim(), url.trim())
	}

	public delete(alias: string) {
		// console.log(`[AliasMap][delete]`)
		if (this.map.has(alias)) {
			this.map.delete(alias)
		}
	}

	public clear() {
		this.map.clear()
	}

	public rename(oldAlias: string, newAlias: string) {
		// console.log(`[AliasMap][rename]`)
		const value = this.get(oldAlias)
		if (!value) {
			return
		}

		this.delete(oldAlias)
		this.set(newAlias, value)
	}

	public keys() {
		// console.log(`[AliasMap][keys]`)
		return this.map.keys()
	}

	public entries() {
		// console.log(`[AliasMap][entries]`)
		return this.map.entries()
	}

	public object() {
		// console.log(`[AliasMap][object]`)
		let mapObject = {}
		for (const [key, value] of this.map) {
			mapObject = {
				...mapObject,
				[key]: value,
			}
		}

		return mapObject
	}
}
