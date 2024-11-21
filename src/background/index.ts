import browser from "webextension-polyfill"
import { FireAlias } from "@core/fire-alias"

const fireAlias = new FireAlias()

browser.omnibox.onInputChanged.addListener(fireAlias.inputChangeListener)
browser.omnibox.onInputEntered.addListener(fireAlias.inputEnteredListener)
browser.storage.onChanged.addListener(fireAlias.storageChangeListener)
browser.omnibox.setDefaultSuggestion({
	description: "Type in the alias of the website.",
})
