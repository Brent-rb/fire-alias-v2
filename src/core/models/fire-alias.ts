/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, Observable, type Subject } from "rxjs"
import { BrowserItem } from "./browser-item"
import { AliasMap } from "./alias-map"
import { FireOmnibox } from "./fire-omnibox"
import { ExportType } from "@core/utils/browser-utils"

export class FireAlias {
	private aliasMap = new AliasMap(new Map())
	private omnibox = new FireOmnibox(this.aliasMap)
	private browserItem = new BrowserItem<object, AliasMap>(
		"alias_map",
		this.aliasMap,
		{
			onItemLoaded: (aliasMap) => {
				this.aliasMap = aliasMap
				this.omnibox.setMap(aliasMap)
				this.onUpdate()
			},
			onItemSaved: () => {
				this.onUpdate()
			},
			transformOnLoad: async (storageValue) =>
				AliasMap.fromObject(storageValue),
			transformOnSave: async (aliasMap) => aliasMap.object(),
			transformOnJson: async (aliasMap) => aliasMap.object(),
			transformOnCsv: async (aliasMap) => [...aliasMap.entries()],
			getStorageDefault: () => ({}),
		},
	)

	private aliasSubject: Subject<[string, string][]> = new BehaviorSubject<
		[string, string][]
	>([])

	constructor() {
		this.browserItem.load()
	}

	private async onUpdate() {
		const records = [...this.aliasMap.entries()]
		records.sort((left, right) => left[0].localeCompare(right[0]))
		this.aliasSubject.next(records)
	}

	public async addAlias(alias: string, url: string) {
		if (alias === "" || url === "") {
			return
		}

		this.aliasMap.set(alias.trim(), url.trim())
		this.browserItem.save()
	}

	public async removeAlias(alias: string) {
		this.aliasMap.delete(alias)
		this.browserItem.save()
	}

	public async updateAlias(
		oldAlias: string,
		newAlias: string,
		newLink: string,
	) {
		if (oldAlias === "" || newAlias === "" || newLink === "") {
			return
		}
		if (oldAlias !== newAlias) {
			this.aliasMap.rename(oldAlias, newAlias)
		}
		this.aliasMap.set(newAlias, newLink)
		this.browserItem.save()
	}

	public clear() {
		this.aliasMap.clear()
		this.browserItem.save()
	}

	public export(type: ExportType) {
		return this.browserItem.export(type)
	}

	public observeAliases(): Observable<[string, string][]> {
		return this.aliasSubject.asObservable()
	}

	public listeners = {
		onInputChange: this.omnibox.inputChangeListener,
		onInputEntered: this.omnibox.inputEnteredListener,
		onStorageChange: this.browserItem.storageChangeListener,
	}
}
