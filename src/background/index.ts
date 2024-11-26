import browser from "webextension-polyfill"
import { FireAlias } from "@core/models/fire-alias"

const fireAlias = new FireAlias()

browser.omnibox.onInputChanged.addListener(fireAlias.listeners.onInputChange)
browser.omnibox.onInputEntered.addListener(fireAlias.listeners.onInputEntered)
browser.storage.onChanged.addListener(fireAlias.listeners.onStorageChange)
browser.omnibox.setDefaultSuggestion({
	description: "Type in the alias of the website.",
})
