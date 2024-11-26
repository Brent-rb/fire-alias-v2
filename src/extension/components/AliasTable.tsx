import { ReactElement, useCallback, useMemo, useState } from "react"
import { Button } from "./ui/button"
import { PencilIcon, SaveIcon, TrashIcon, XIcon } from "lucide-react"
import { Input } from "./ui/input"
import { replaceParameters } from "@core/utils/parameter-utils"

interface AliasTableProps {
	aliases: [string, string][]
	menu?: ReactElement

	onAliasRemoved?: (alias: string) => void
	onAliasUpdated?: (
		oldAlias: string,
		newAlias: string,
		newLink: string,
	) => void
}

interface AliasRowProps {
	alias: string
	link: string

	divider?: boolean
	onAliasRemoved?: (alias: string) => void
	onAliasUpdated?: (
		oldAlias: string,
		newAlias: string,
		newLink: string,
	) => void
}

const AliasRow = ({
	alias,
	link,
	onAliasRemoved,
	onAliasUpdated,
}: AliasRowProps) => {
	console.log(`[AliasRow][render]`)
	const [isEditable, setEditable] = useState(false)
	const [newAlias, setNewAlias] = useState(alias)
	const [newLink, setNewLink] = useState(link)

	const onDeletePressed = useCallback(() => {
		onAliasRemoved?.(alias)
	}, [onAliasRemoved, alias])

	const onUpdatePressed = useCallback(() => {
		setEditable(true)
	}, [])

	const onSavePressed = useCallback(() => {
		if (newAlias === "" || newLink === "") {
			setNewAlias(alias)
			setNewLink(link)
			setEditable(false)
			return
		}

		onAliasUpdated?.(alias, newAlias, newLink)
		setEditable(false)
	}, [alias, newAlias, newLink])

	const onAbortUpdate = useCallback(() => {
		setEditable(false)
		setNewAlias(alias)
		setNewLink(link)
	}, [])

	const imageSource = useMemo(() => {
		try {
			const replacedLink = replaceParameters(alias, link, "")
			const fixedLink = link.startsWith("http")
				? replacedLink
				: `https://${replacedLink}`
			const url = new URL(fixedLink)
			console.log(`https://${url.host}/favicon_32x32.ico`)
			return `https://${url.host}/favicon.ico`
		} catch (error) {
			console.warn(error)
		}
		return ""
	}, [link])

	return (
		<>
			<div className="w-full px-4 py-2 flex flex-row items-center gap-2">
				<div className="w-[32]">
					<img
						className="w-[32] h-[32] rounded-full"
						src={`${imageSource}`}
					/>
				</div>
				<div className="w-[100]">
					<Input
						onChange={(event) => setNewAlias(event.target.value)}
						value={newAlias}
						disabled={!isEditable}
					/>
				</div>
				<div className="flex-grow">
					<Input
						onChange={(event) => setNewLink(event.target.value)}
						value={newLink}
						disabled={!isEditable}
					/>
				</div>
				<div className="flex flex-row gap-2">
					{!isEditable && (
						<>
							<Button
								className="rounded-full"
								variant="outline"
								onClick={onUpdatePressed}>
								<PencilIcon />
							</Button>
							<Button
								className="rounded-full"
								variant="outline"
								onClick={onDeletePressed}>
								<TrashIcon />
							</Button>
						</>
					)}
					{isEditable && (
						<>
							<Button
								className="rounded-full"
								variant="outline"
								onClick={onSavePressed}>
								<SaveIcon />
							</Button>
							<Button
								className="rounded-full"
								variant="outline"
								onClick={onAbortUpdate}>
								<XIcon />
							</Button>
						</>
					)}
				</div>
			</div>
		</>
	)
}

export const AliasTable = ({
	aliases,
	onAliasRemoved,
	onAliasUpdated,
}: AliasTableProps) => {
	console.log(`[AliasTable][render]`)
	const rows = useMemo(() => {
		return aliases.map(([alias, link], index) => {
			return (
				<AliasRow
					key={alias}
					alias={alias}
					link={link}
					onAliasRemoved={onAliasRemoved}
					onAliasUpdated={onAliasUpdated}
					divider={index !== alias.length - 1}
				/>
			)
		})
	}, [aliases])

	return (
		<div className="flex-grow flex flex-col">
			<div
				className="px-6 pl-[60] py-2 w-full flex flex-row bg-slate-100 rounded-sm gap-2"
				style={{
					filter: "drop-shadow(0px 2px 2px #acacac)",
				}}>
				<div className="w-[100] font-bold">Alias</div>
				<div className="flex-grow font-bold">Link</div>
			</div>
			<div className="flex-col gap-1 mt-4">{rows}</div>
		</div>
	)
}
