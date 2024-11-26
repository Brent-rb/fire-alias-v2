import {
	BrowserDownloads,
	BrowserStorage,
	ExportType,
	StorageValue,
} from "@core/utils/browser-utils"
import { Storage } from "webextension-polyfill"

export class BrowserItem<
	StoredType extends StorageValue,
	ItemType = StoredType,
> {
	constructor(
		protected key: string,
		protected item: ItemType,
		private callbacks: {
			onItemLoaded: (item: ItemType) => void
			onItemSaved: (item: ItemType) => void
			transformOnLoad: (data: StoredType) => Promise<ItemType>
			transformOnSave: (item: ItemType) => Promise<StoredType>
			transformOnJson: (item: ItemType) => Promise<object>
			transformOnCsv: (item: ItemType) => Promise<string[][]>
			getStorageDefault: () => StoredType
		},
	) {}

	public async load() {
		// console.log(`[BrowserItem][load]`)
		const storedItem = await BrowserStorage.fetchDefault<StoredType>(
			this.key,
			this.callbacks.getStorageDefault(),
		)

		const parsedItem = await this.callbacks.transformOnLoad(storedItem)
		this.item = parsedItem
		this.callbacks.onItemLoaded(this.item)
	}

	public async save() {
		// console.log(`[BrowserItem][save]`)
		const storedItem = await this.callbacks.transformOnSave(this.item)
		await BrowserStorage.put(this.key, storedItem)
		this.callbacks.onItemSaved(this.item)
	}

	private async toJsonString() {
		// console.log(`[BrowserItem][toJsonString]`)
		const data = await this.callbacks.transformOnJson(this.item)
		return JSON.stringify(data, undefined, "\t")
	}

	private async toCsvString() {
		// console.log(`[BrowserItem][toCsvString]`)
		const data = await this.callbacks.transformOnCsv(this.item)
		return data.map((row) => row.join(",")).join("\n")
	}

	private toString(type: ExportType) {
		// console.log(`[BrowserItem][toString]`)
		switch (type) {
			case "json":
				return this.toJsonString()
			case "csv":
				return this.toCsvString()
		}
	}

	public async export(type: ExportType) {
		// console.log(`[BrowserItem][export]`)
		const data = await this.toString(type)
		await BrowserDownloads.export(data, type)
	}

	public storageChangeListener = (
		changes: Record<string, Storage.StorageChange>,
		area: string,
	) => {
		// console.log(`[BrowserItem][storageChangeListener]`)
		if (area !== "sync" && area !== "local") {
			return
		}

		const item = changes[this.key]?.newValue as StoredType | undefined
		if (!item) {
			return
		}

		this.callbacks.transformOnLoad(item).then((parsedItem) => {
			this.item = parsedItem
			this.callbacks.onItemLoaded(this.item)
		})
	}
}
