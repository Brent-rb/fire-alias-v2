import { useCallback, useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { PlusIcon } from "lucide-react"

interface EntryBoxProps {
	autoClear?: boolean
	onEntryAdded?: (alias: string, link: string) => void
}

export const EntryBox = ({ autoClear, onEntryAdded }: EntryBoxProps) => {
	console.log(`[EntryBox][render]`)
	const [alias, setAlias] = useState("")
	const [link, setLink] = useState("")

	const clear = useCallback(() => {
		setAlias("")
		setLink("")
	}, [setAlias, setLink])

	const onAddPressed = useCallback(() => {
		onEntryAdded?.(alias, link)

		if (autoClear) {
			clear()
		}
	}, [alias, link, autoClear])

	const onAliasChanged = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setAlias(event.target.value)
		},
		[setAlias],
	)

	const onLinkChanged = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setLink(event.target.value)
		},
		[setLink],
	)

	return (
		<div className="flex flex-row p-4 gap-2">
			<Input
				className="w-[100]"
				id="alias"
				placeholder="Alias"
				onChange={onAliasChanged}
				value={alias}
			/>
			<Input
				id="link"
				placeholder="Link"
				onChange={onLinkChanged}
				value={link}
			/>
			<Button
				className="rounded-full"
				aria-label="Add Alias"
				variant="outline"
				onClick={onAddPressed}>
				<PlusIcon />
			</Button>
		</div>
	)
}
