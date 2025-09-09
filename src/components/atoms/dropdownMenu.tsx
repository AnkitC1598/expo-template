import { cn } from "@/lib/utils"
import { FlatList, Text, View } from "react-native"
import {
	DropDown,
	DropDownContent,
	DropDownGroup,
	DropDownItem,
	DropDownItemSeparator,
	DropDownTrigger,
} from "../ui/dropdown"

interface DropdownItem {
	label: string
	value: string
}

interface DropdownGroupItem {
	label: string
	items: DropdownItem[]
}

interface DropdownMenuProps {
	align?: "start" | "center" | "end"
	side?: "top" | "bottom" | "left" | "right"
	trigger: React.ReactNode
	items: DropdownGroupItem[] | DropdownItem[]
	onSelect?: (value: string) => void
	selected?: string
}

const DropdownMenu = ({
	align,
	side,
	trigger,
	items,
	onSelect,
	selected,
}: DropdownMenuProps) => {
	const isGroup = "items" in items[0]

	return (
		<DropDown
			selected={selected}
			onSelect={onSelect}
			align={align}
			side={side}
		>
			<DropDownTrigger asChild>{trigger}</DropDownTrigger>
			<DropDownContent>
				<FlatList
					data={items as Record<string, any>[]}
					renderItem={({ item, index }) => (
						<View
							className={cn(
								isGroup ? cn("gap-2", index && "pt-2") : ""
							)}
						>
							{isGroup && index ? (
								<DropDownItemSeparator />
							) : null}
							<DropdownItems
								isGroup={isGroup}
								item={item as DropdownItem | DropdownGroupItem}
							/>
						</View>
					)}
					keyExtractor={item => item.label}
				/>
			</DropDownContent>
		</DropDown>
	)
}

export default DropdownMenu

const DropdownItems = ({
	isGroup,
	item,
}: {
	isGroup: boolean
	item: DropdownItem | DropdownGroupItem
}) =>
	isGroup ? (
		<DropDownGroup label={item.label}>
			{(item as DropdownGroupItem).items.map(item => (
				<DropDownItem key={item.value} value={item.value}>
					<Text
						className="text-neutral-900 dark:text-neutral-200"
						style={{
							pointerEvents: "none",
						}}
					>
						{item.label}
					</Text>
				</DropDownItem>
			))}
		</DropDownGroup>
	) : (
		<DropDownItem
			key={(item as DropdownItem).value}
			value={(item as DropdownItem).value}
		>
			<Text
				className="text-neutral-900 dark:text-neutral-200"
				style={{
					pointerEvents: "none",
				}}
			>
				{item.label}
			</Text>
		</DropDownItem>
	)
