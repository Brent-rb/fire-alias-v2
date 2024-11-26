// eslint-disable-next-line @typescript-eslint/no-unused-vars
import browser from "webextension-polyfill"
import { useCallback, useRef } from "react"
import { FireAlias } from "@core/models/fire-alias"
import { useObservableValue } from "../hooks/rxjs-hooks"
import { AliasTable } from "./AliasTable"
import { EntryBox } from "./EntryBox"
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuPortal,
} from "./ui/dropdown-menu"
import { EllipsisVerticalIcon } from "lucide-react"
import { Button } from "./ui/button"

const App = () => {
	const fireAliasRef = useRef<FireAlias>(new FireAlias())
	const aliases = useObservableValue(
		fireAliasRef.current.observeAliases(),
		[],
	)

	const addAlias = useCallback((alias: string, link: string) => {
		fireAliasRef.current.addAlias(alias, link)
	}, [])

	const removeAlias = useCallback((alias: string) => {
		fireAliasRef.current.removeAlias(alias)
	}, [])

	const updateAlias = useCallback(
		(oldAlias: string, newAlias: string, newLink: string) => {
			fireAliasRef.current.updateAlias(oldAlias, newAlias, newLink)
		},
		[],
	)

	const exportJson = useCallback(() => {
		fireAliasRef.current.export("json")
	}, [])

	const exportCsv = useCallback(() => {
		fireAliasRef.current.export("csv")
	}, [])

	return (
		<div className="w-[640] h-640 overflow-y-auto flex flex-col bg">
			<AliasTable
				aliases={aliases}
				menu={
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<EllipsisVerticalIcon />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56">
							<DropdownMenuLabel>Options</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										Export
									</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											<DropdownMenuItem
												onClick={exportCsv}>
												as csv
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={exportJson}>
												as json
											</DropdownMenuItem>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				}
				onAliasRemoved={removeAlias}
				onAliasUpdated={updateAlias}
			/>
			<EntryBox autoClear onEntryAdded={addAlias} />
		</div>
	)
}

export default App
