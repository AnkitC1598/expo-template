import { tailwindToHex } from "@/lib/tailwind"
import { cn } from "@/lib/utils"
import { Feather } from "@expo/vector-icons"
import React, { cloneElement, createContext, useContext, useState } from "react"
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native"

interface DropDownContextType {
	open: boolean
	setOpen: (open: boolean) => void
	selected?: string
	onSelect?: (value: string) => void
	align?: "start" | "center" | "end"
	side?: "top" | "bottom" | "left" | "right"
}

const DropDownContext = createContext<DropDownContextType | undefined>(
	undefined
)

const useDropdown = () => {
	const context = useContext(DropDownContext)
	if (!context) {
		throw new Error("useDropdown must be used within a DropdownProvider")
	}
	return context
}

interface DropDownProps {
	children: React.ReactNode
	selected?: string
	onSelect?: (item: any) => void
	align?: "start" | "center" | "end"
	side?: "top" | "bottom" | "left" | "right"
}

const DropDown = ({
	children,
	selected,
	onSelect,
	side = "bottom",
	align = "start",
}: DropDownProps) => {
	const [open, setOpen] = useState<boolean>(false)

	return (
		<DropDownContext.Provider
			value={{ open, setOpen, selected, onSelect, align, side }}
		>
			<View>{children}</View>

			{open && (
				<Pressable
					onPress={() => setOpen(false)}
					style={[
						{
							height: Dimensions.get("window").height,
							margin: -16,
						},
						StyleSheet.absoluteFill,
					]}
				/>
			)}
		</DropDownContext.Provider>
	)
}

const DropDownTrigger = ({ children }: any) => {
	const { open, setOpen } = useDropdown()

	return cloneElement(children, {
		onPress: () => setOpen(!open),
	})
}

type DropDownContentTypes = {
	className?: string
	children: React.ReactNode
}

const DropDownContent = ({ className, children }: DropDownContentTypes) => {
	const { open, side, align } = useDropdown()

	return (
		open && (
			<>
				<View
					className={cn(
						"absolute z-50 max-h-96 min-w-[8rem] flex-1 gap-4 rounded-md border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-950",
						side === "top" && "bottom-full mb-2",
						side === "bottom" && "top-10 mt-2",
						side === "left" && "top-0 right-10 mr-2",
						side === "right" && "top-0 left-10 ml-2",
						align === "start" && "self-start",
						align === "center" && "self-center",
						align === "end" && "self-end",
						className
					)}
				>
					{children}
				</View>
			</>
		)
	)
}

type DropDownGroupProps = {
	label: string
	children: React.ReactNode
}

const DropDownGroup = ({ label, children }: DropDownGroupProps) => {
	return (
		<>
			<View className="flex-1">
				<DropDownLabel label={label} />
				{children}
			</View>
		</>
	)
}

type DropDownLabelProps = {
	label: string
}

const DropDownLabel = ({ label }: DropDownLabelProps) => {
	if (!label) {
		return null
	}
	return (
		<Text className="px-2 font-semibold text-neutral-500 text-sm">
			{label}
		</Text>
	)
}

type DropDownItemProps = {
	children: React.ReactNode | any
	disabled?: boolean
	className?: string
	value: string
}

const DropDownItem = ({
	children,
	disabled,
	value,
	className,
}: DropDownItemProps) => {
	const { selected, onSelect, open, setOpen } = useDropdown()

	return (
		<View
			className={cn(
				"cursor-default select-none flex-row items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-neutral-100 focus:text-neutral-900 dark:focus:bg-neutral-800 dark:focus:text-neutral-50",
				disabled && "cursor-not-allowed opacity-50",
				className
			)}
		>
			<Pressable
				className="flex-1 flex-row items-center gap-2"
				onPress={() => {
					onSelect?.(value)
					setOpen(!open)
				}}
			>
				{selected === value ? (
					<Feather
						name="check"
						size={16}
						color={tailwindToHex(
							"fill-neutral-900 dark:fill-neutral-200"
						)}
					/>
				) : (
					<View className="h-4 w-4" />
				)}
				{children}
			</Pressable>
		</View>
	)
}

const DropDownItemSeparator = () => {
	return <View className="h-px bg-neutral-300 dark:bg-neutral-700" />
}

export {
	DropDown,
	DropDownContent,
	DropDownGroup,
	DropDownItem,
	DropDownItemSeparator,
	DropDownLabel,
	DropDownTrigger,
	useDropdown,
}
