import { distance, closest } from "fastest-levenshtein"
import { BehaviorSubject, Observable, type Subject } from "rxjs"
import browser, { runtime, type Omnibox } from "webextension-polyfill"

export enum StorageKeys {
	AliasMap = "alias_map",
}

interface AliasDistance {
	distance: number
	alias: string
	url: string
}

function getAliasMapFromLocal() {
	return browser.storage.local.get(StorageKeys.AliasMap)
}

function getAliasMapFromSync() {
	return browser.storage.sync.get(StorageKeys.AliasMap)
}

function setAliasMapToLocal(map: { [key: string]: string }) {
	return browser.storage.local.set({
		[StorageKeys.AliasMap]: map,
	})
}

function setAliasMapToSync(map: { [key: string]: string }) {
	return browser.storage.sync.set({
		[StorageKeys.AliasMap]: map,
	})
}

function getBestMatches(distances: AliasDistance[], limit = 5) {
	let suggestions: browser.Omnibox.SuggestResult[] = []

	for (var i = 0; i < distances.length && i < limit; i++) {
		suggestions.push({
			content: distances[i].url,
			description: distances[i].alias,
		})
	}

	return suggestions
}

export class FireAlias {
	private aliasMap = new Map<string, string>()
	private lastSuggestions: browser.Omnibox.SuggestResult[] = []
	private aliasSubject: Subject<[string, string][]> = new BehaviorSubject<
		[string, string][]
	>([])

	constructor() {
		this.loadFromStorage()
	}

	private onUpdate() {
		const records = [...this.aliasMap.entries()]
		records.sort((left, right) => left[0].localeCompare(right[0]))
		this.aliasSubject.next(records)
	}

	private loadFromObject(data?: { [key: string]: string }) {
		if (!data) {
			return
		}

		this.aliasMap.clear()
		for (const alias in data) {
			this.aliasMap.set(alias, data[alias])
		}
		this.onUpdate()
	}

	public async loadFromStorage() {
		const storage =
			(await getAliasMapFromSync()) ?? (await getAliasMapFromLocal())
		const storageMap = storage[StorageKeys.AliasMap]
		this.loadFromObject(storageMap as any)
	}

	private calculateDistances(aliases: string[], enteredAlias: string) {
		const distances: AliasDistance[] = []

		aliases.forEach((alias) => {
			const dist = distance(enteredAlias, alias)

			distances.push({
				distance: dist,
				alias,
				url: this.aliasMap.get(alias) ?? "",
			})
		})

		distances.sort((a, b) => {
			return a.distance - b.distance
		})

		return distances
	}

	private getMatches(text: string) {
		var keys = [...this.aliasMap.keys()]
		let distances = this.calculateDistances(keys, text)
		const suggestions = getBestMatches(distances, 6)
		this.lastSuggestions = suggestions

		return suggestions
	}

	private tryMatchAlias(text: string) {
		const suggestion = this.lastSuggestions.find(
			(suggestion) => suggestion.description.localeCompare(text) === 0,
		)
		const fallback =
			this.lastSuggestions.length > 0
				? this.lastSuggestions[0]
				: undefined
		return suggestion ?? fallback
	}

	private async saveItems() {
		let storageMap = {}
		for (const [key, value] of this.aliasMap) {
			storageMap = {
				...storageMap,
				[key]: value,
			}
		}

		try {
			await Promise.all([
				setAliasMapToLocal(storageMap),
				setAliasMapToSync(storageMap),
			])
		} catch (error) {
			console.warn(error)
		}
	}

	public async removeItem(alias: string) {
		if (this.aliasMap.has(alias)) {
			this.aliasMap.delete(alias)
		}

		await this.saveItems()
		this.onUpdate()
	}

	public async updateItem(
		oldAlias: string,
		newAlias: string,
		newLink: string,
	) {
		if (this.aliasMap.has(oldAlias)) {
			this.aliasMap.delete(oldAlias)
		}

		this.addItem(newAlias, newLink)
	}

	public async addItem(alias: string, url: string) {
		this.aliasMap.set(alias, url)
		await this.saveItems()
		this.onUpdate()
	}

	public storageChangeListener = (
		changes: Record<string, browser.Storage.StorageChange>,
		area: string,
	) => {
		if (area !== "sync" && area !== "local") {
			return
		}

		const aliasMap = changes[StorageKeys.AliasMap]
		if (aliasMap !== undefined) {
			this.loadFromObject(aliasMap.newValue as any)
		}
	}

	public inputChangeListener = (
		text: string,
		addSuggestions: (suggestions: browser.Omnibox.SuggestResult[]) => void,
	) => {
		const suggestions = this.getMatches(text)
		addSuggestions(suggestions)
	}

	public inputEnteredListener = (
		text: string,
		disposition: browser.Omnibox.OnInputEnteredDisposition,
	) => {
		console.log(text)
		const suggestion: Omnibox.SuggestResult = this.tryMatchAlias(text) ?? {
			content: text,
			description: "",
		}

		const url = suggestion.content
		const prefixedUrl = url.startsWith("http") ? url : `https://${url}`

		switch (disposition) {
			case "currentTab":
				browser.tabs.update({
					url: prefixedUrl,
				})
				break
			case "newForegroundTab":
				browser.tabs.create({
					url: prefixedUrl,
				})
				break
			case "newBackgroundTab":
				browser.tabs.create({ url: prefixedUrl, active: false })
				break
		}
	}

	public observeAliases(): Observable<[string, string][]> {
		return this.aliasSubject.asObservable()
	}
}
