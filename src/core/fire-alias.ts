/* eslint-disable @typescript-eslint/no-explicit-any */
import { distance } from "fastest-levenshtein"
import { BehaviorSubject, Observable, type Subject } from "rxjs"
import browser, { type Omnibox } from "webextension-polyfill"
import { NoUrlDefinedError } from "./errors/no-url-defined-error"
import { addHttps, startsWithProtocol } from "./utils/url-utils"

export enum StorageKeys {
	AliasMap = "alias_map",
}

interface AliasDistance {
	alias: string
	distance: number
}

type AliasSuggestion = {
	url: string
} & AliasDistance

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

function getSortedDistances(aliases: string[], enteredAlias: string) {
	const distances: AliasDistance[] = []

	aliases.forEach((alias) => {
		const dist = distance(enteredAlias, alias)

		distances.push({
			distance: dist,
			alias,
		})
	})

	distances.sort((a, b) => {
		return a.distance - b.distance
	})

	return distances
}

function toSuggestResult(
	items: AliasSuggestion[],
): browser.Omnibox.SuggestResult[] {
	return items.map((item) => ({
		content: item.url,
		description: item.alias,
	}))
}

function getPrefixLength(value: string, prefix: string) {
	let i
	for (i = 0; i < Math.min(value.length, prefix.length); i++) {
		if (value.charAt(i) !== prefix.charAt(i)) {
			break
		}
	}

	return i
}

function replaceParameters(alias: string, url: string, input: string) {
	const aliasParts = alias.split(" ")
	const inputParts = input.split(" ").slice(aliasParts.length)

	let replacedUrl = url
	replacedUrl = replacedUrl.replace(/\{0\}/g, alias)
	replacedUrl = replacedUrl.replace(/\{@\}/g, encodeURIComponent(inputParts.join(" ")))

	for (let i = 0; i < inputParts.length; i++) {
		const parameter = i + 1
		replacedUrl = replacedUrl.replace(new RegExp(`\\{${parameter}\\}`, "g"), inputParts[i])
	}

	return replacedUrl
}

export class FireAlias {
	private aliasMap = new Map<string, string>()
	private lastSuggestions: AliasSuggestion[] = []
	private aliasSubject: Subject<[string, string][]> = new BehaviorSubject<
		[string, string][]
	>([])

	constructor() {
		this.loadFromStorage()
	}

	private has(alias: string) {
		return this.aliasMap.has(alias)
	}

	private get(alias: string) {
		return this.aliasMap.get(alias)
	}

	private getDefined(alias: string) {
		const url = this.aliasMap.get(alias)
		if (!url) {
			throw new NoUrlDefinedError(alias)
		}

		return url
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

	private addUrls(items: AliasDistance[], input: string = ""): AliasSuggestion[] {
		const validItems = items.filter((item) => this.has(item.alias))
		return validItems.map((item) => ({
			...item,
			url: replaceParameters(item.alias, this.getDefined(item.alias), input),
		}))
	}

	private findLongestPrefix(text: string) {
		const keys = [...this.aliasMap.keys()]

		const prefixLenghts = keys.map((key) => ({
			key,
			length: getPrefixLength(key, text),
		}))

		prefixLenghts.sort((a, b) => b.length - a.length)
		if (prefixLenghts.length === 0) {
			return undefined
		}
		return prefixLenghts[0].key
	}

	private getMatches(text: string) {
		const keys = [...this.aliasMap.keys()]
		const longestPrefix = this.findLongestPrefix(text)
		keys.splice(keys.findIndex((key) => key === longestPrefix))
		const prefixKeys = keys.filter((key) => key.startsWith(text))
		const nonPrefixKeys = keys.filter((key) => !key.startsWith(text))

		const longestPrefixDistance = getSortedDistances(
			longestPrefix ? [longestPrefix] : [],
			text,
		)
		const prefixDistances = getSortedDistances(prefixKeys, text)
		const nonPrefixDistances = getSortedDistances(nonPrefixKeys, text)
		const aliasSuggestions = [
			...longestPrefixDistance,
			...prefixDistances,
			...nonPrefixDistances,
		].slice(
			0,
			Math.min(
				prefixDistances.length +
					nonPrefixDistances.length +
					longestPrefixDistance.length,
				6,
			),
		)

		return this.addUrls(aliasSuggestions, text)
	}

	private findTextInLastSuggestions(text: string) {
		const firstSuggestion = this.lastSuggestions.find(
			(suggestion) => suggestion.alias.localeCompare(text) === 0,
		)
		const secondSuggestion = this.lastSuggestions.find(
			(suggestion) => suggestion.url.localeCompare(text) === 0,
		)
		const fallback =
			this.lastSuggestions.length > 0
				? this.lastSuggestions[0]
				: undefined

		return firstSuggestion ?? secondSuggestion ?? fallback
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
		this.aliasMap.set(alias.trim(), url.trim())
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
		addSuggestions(toSuggestResult(suggestions))
	}

	private getBestMatch(input: string): AliasSuggestion {
		const matches = this.getMatches(input)
		const fallback = this.findTextInLastSuggestions(input) 
		const bestMatch = matches.length > 0 ? matches[0] : undefined

		return bestMatch ?? fallback ?? {
			url: input,
			alias: "",
			distance: 0,
		}
	}

	private getUrl(input: string) {
		if (startsWithProtocol(input)) {
			console.log(`[getUrl][startsWithProtocol]`)
			return input
		}

		const bestMatch = this.getBestMatch(input)
		console.log(`[getUrl][bestMatch][alias: ${bestMatch.alias}, url: ${bestMatch.url}]`)
		return bestMatch.url
	}

	public inputEnteredListener = (
		text: string,
		disposition: browser.Omnibox.OnInputEnteredDisposition,
	) => {
		const url = addHttps(this.getUrl(text))
		console.log(`[inputEnteredListener][url: ${url}]`)

		switch (disposition) {
			case "currentTab":
				browser.tabs.update({
					url
				})
				break
			case "newForegroundTab":
				browser.tabs.create({
					url
				})
				break
			case "newBackgroundTab":
				browser.tabs.create({ url, active: false })
				break
		}
	}

	public observeAliases(): Observable<[string, string][]> {
		return this.aliasSubject.asObservable()
	}
}
