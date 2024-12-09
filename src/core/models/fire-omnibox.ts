import { distance } from "fastest-levenshtein"
import { AliasMap } from "./alias-map"
import { replaceParameters } from "@core/utils/parameter-utils"
import browser, { Omnibox } from "webextension-polyfill"
import { addHttps, startsWithProtocol } from "@core/utils/url-utils"

export interface Alias {
	alias: string
	link: string
}

export type AliasInfo = Alias & {
	distance: number
	prefix: number
}

function distanceAscendingSort<T extends { distance: number }>(a: T, b: T) {
	return a.distance - b.distance
}

function prefixDescendingSort<T extends { prefix: number }>(a: T, b: T) {
	return b.prefix - a.prefix
}

function aliasInfoSort(a: AliasInfo, b: AliasInfo) {
	const prefixCompare = prefixDescendingSort(a, b)
	const distanceCompare = distanceAscendingSort(a, b)

	return prefixCompare !== 0 ? prefixCompare : distanceCompare
}

function calculatePrefixLength(value: string, prefix: string) {
	let i
	for (i = 0; i < Math.min(value.length, prefix.length); i++) {
		if (value.charAt(i) !== prefix.charAt(i)) {
			break
		}
	}

	return i
}

function toSuggestResult(items: AliasInfo[]): Omnibox.SuggestResult[] {
	return items.map((item) => ({
		content: item.link,
		description: item.alias,
	}))
}

export class FireOmnibox {
	private lastAliasInfoList: AliasInfo[] = []

	constructor(private aliasMap: AliasMap) {}

	public setMap(aliasMap: AliasMap) {
		// console.log(`[FireOmnibox][setMap]`)
		this.aliasMap = aliasMap
	}

	public getAliasList(input: string = ""): Alias[] {
		// console.log(`[FireOmnibox][getAliasList]`)
		return [...this.aliasMap.entries()].map(([alias, link]) => ({
			alias,
			link: replaceParameters(alias, link, input),
		}))
	}

	public getAliasInfoList(input: string): AliasInfo[] {
		// console.log(`[FireOmnibox][getAliasInfoList]`)
		const list: AliasInfo[] = this.getAliasList(input).map((alias) => ({
			...alias,
			distance: distance(
				alias.alias,
				input.substring(0, alias.alias.length),
			),
			prefix: calculatePrefixLength(alias.alias, input),
		}))

		list.sort(aliasInfoSort)
		return list
	}

	public getBestAliases(input: string) {
		// console.log(`[FireOmnibox][getBestAliases]`)
		const aliasList = this.getAliasInfoList(input)
		return aliasList.slice(0, 5)
	}

	private findInLastList(text: string) {
		// console.log(`[FireOmnibox][findInLastList]`)
		const aliasMatch = this.lastAliasInfoList.find(
			(aliasInfo) => aliasInfo.alias.localeCompare(text) === 0,
		)
		const linkMatch = this.lastAliasInfoList.find(
			(aliasInfo) => aliasInfo.link.localeCompare(text) === 0,
		)
		const fallback =
			this.lastAliasInfoList.length > 0
				? this.lastAliasInfoList[0]
				: undefined

		return aliasMatch ?? linkMatch ?? fallback
	}

	private getBestAlias(input: string): AliasInfo {
		// console.log(`[FireOmnibox][getBestAlias]`)
		const matches = this.getBestAliases(input)
		const linkFallback = this.findInLastList(input)
		const bestMatch = matches.length > 0 ? matches[0] : undefined
		const defaultFallback: AliasInfo = {
			alias: "no-match",
			link: input,
			distance: 0,
			prefix: 0,
		}

		return bestMatch ?? linkFallback ?? defaultFallback
	}

	private getUrl(input: string) {
		// console.log(`[FireOmnibox][getUrl]`)
		if (startsWithProtocol(input)) {
			return input
		}

		const bestMatch = this.getBestAlias(input)
		return bestMatch.link
	}

	public inputChangeListener = (
		text: string,
		addSuggestions: (suggestions: Omnibox.SuggestResult[]) => void,
	) => {
		// console.log(`[FireOmnibox][inputChangeListener]`)
		const suggestions = this.getBestAliases(text)
		addSuggestions(toSuggestResult(suggestions))
	}

	public inputEnteredListener = (
		text: string,
		disposition: Omnibox.OnInputEnteredDisposition,
	) => {
		// console.log(`[FireOmnibox][inputEnteredListener]`)
		const url = addHttps(this.getUrl(text))

		switch (disposition) {
			case "currentTab":
				browser.tabs.update({
					url,
				})
				break
			case "newForegroundTab":
				browser.tabs.create({
					url,
				})
				break
			case "newBackgroundTab":
				browser.tabs.create({ url, active: false })
				break
		}
	}
}
