import { InvalidExportTypeError } from "@core/errors/invalid-export-type"
import * as browser from "webextension-polyfill"

export type StorageValue = number | boolean | string | object | Array<unknown>

export class BrowserStorage {
	private static async fetchSync<T extends StorageValue>(key: string) {
		const syncData = await browser.storage.sync.get(key)
		if (syncData) {
			return syncData[key] as T
		}
	}

	private static async fetchLocal<T extends StorageValue>(key: string) {
		const localData = await browser.storage.local.get(key)
		if (localData) {
			return localData[key] as T
		}
	}

	private static putSync(key: string, value: StorageValue) {
		return browser.storage.sync.set({
			[key]: value,
		})
	}

	private static putLocal(key: string, value: StorageValue) {
		return browser.storage.local.set({
			[key]: value,
		})
	}

	static async fetch<T extends StorageValue>(key: string) {
		const syncData = await BrowserStorage.fetchSync<T>(key)
		if (syncData) {
			return syncData
		}

		const localData = await BrowserStorage.fetchLocal<T>(key)
		if (localData) {
			return localData
		}
	}

	static async fetchDefault<T extends StorageValue>(
		key: string,
		defaultValue: T,
	) {
		const storedItem = await BrowserStorage.fetch<T>(key)
		return storedItem ?? defaultValue
	}

	static async put(key: string, value: StorageValue) {
		await BrowserStorage.putLocal(key, value)
		await BrowserStorage.putSync(key, value)
	}
}

export type ExportType = "json" | "csv"

export class BrowserDownloads {
	static toMimeType(type: ExportType) {
		switch (type) {
			case "json":
				return "application/json"
			case "csv":
				return "text/csv"
			default:
				throw new InvalidExportTypeError(type)
		}
	}

	static export(data: string, type: ExportType) {
		const blob = new Blob([data], {
			type: BrowserDownloads.toMimeType(type),
		})

		const url = URL.createObjectURL(blob)
		return browser.tabs.create({
			url,
		})
	}
}
