import { useCallback, useRef } from "react"
import { FireAlias } from "@core/fire-alias"
import { useObservableValue } from "../hooks/rxjs-hooks"
import { AliasTable } from "./AliasTable"
import { EntryBox } from "./EntryBox"

const App = () => {
	const fireAliasRef = useRef<FireAlias>(new FireAlias())
	const aliases = useObservableValue(
		fireAliasRef.current.observeAliases(),
		[],
	)

	const addAlias = useCallback((alias: string, link: string) => {
		fireAliasRef.current.addItem(alias, link)
	}, [])

	const removeAlias = useCallback((alias: string) => {
		fireAliasRef.current.removeItem(alias)
	}, [])

	const updateAlias = useCallback(
		(oldAlias: string, newAlias: string, newLink: string) => {
			fireAliasRef.current.updateItem(oldAlias, newAlias, newLink)
		},
		[],
	)

	return (
		<div className="w-[640] h-640 overflow-y-auto flex flex-col bg">
			<AliasTable
				aliases={aliases}
				onAliasRemoved={removeAlias}
				onAliasUpdated={updateAlias}
			/>
			<EntryBox autoClear onEntryAdded={addAlias} />
		</div>
	)
}

export default App
