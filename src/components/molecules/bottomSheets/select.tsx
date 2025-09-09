import { cn } from "@/lib/utils"
import Button from "@/ui/button"
import { Sheet, useSheetRef } from "@/ui/sheet"
import { BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet"
import * as Haptics from "expo-haptics"
import React from "react"
import {
	Keyboard,
	Platform,
	Text,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
} from "react-native"
import { CheckIcon, ChevronDownIcon } from "react-native-heroicons/outline"
import { XCircleIcon } from "react-native-heroicons/solid"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface Option {
	label: string
	value: unknown
}

interface SelectSheetProps {
	trigger?: any
	label: string
	value: Option["value"]
	placeholder?: string
	placeholderClassName?: string
	onChange: (option: Option) => void
	triggerProps?: TouchableOpacityProps
	options?: Option[]
	renderItem?: ({
		item,
		index,
		onPress,
	}: {
		item: Option
		index: number
		onPress: (option: Option) => void
	}) => React.ReactElement
}

const SelectSheet = ({
	trigger,
	triggerProps = {},
	label = "Select an option",
	value,
	placeholder = "Select an option",
	placeholderClassName = "",
	onChange,
	options = [],
	renderItem,
}: SelectSheetProps) => {
	const bottomSheetModalRef = useSheetRef()
	const inset = useSafeAreaInsets()

	const onPress = (option: Option) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		onChange(option)
		bottomSheetModalRef.current?.dismiss()
	}

	const selectedValue = options.find(option => option.value === value)

	const closeSheet = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		bottomSheetModalRef.current?.dismiss()
	}

	const _renderItem = ({ item, index }: { item: Option; index: number }) => {
		if (renderItem) {
			return renderItem({ item, index, onPress })
		} else {
			const isSelected =
				options.findIndex(option => option.value === value) === index

			return (
				<TouchableOpacity
					key={`${item.value}-${index}`}
					className={cn(
						"mb-2 w-full flex-row items-center gap-4 rounded-xl border bg-neutral-100 p-4",
						isSelected ? "" : "border-transparent"
					)}
					onPress={() => onPress(item)}
				>
					<View className="flex-1 flex-row items-center gap-4">
						<Text className="flex-1">{item.label}</Text>
					</View>
					{isSelected ? (
						<CheckIcon size={24} color="black" />
					) : (
						<View className="h-6 w-6" />
					)}
				</TouchableOpacity>
			)
		}
	}

	return (
		<>
			{trigger ? (
				React.cloneElement(trigger, {
					onPress: () => bottomSheetModalRef.current?.present(),
				})
			) : (
				<TouchableOpacity
					{...triggerProps}
					style={[
						{
							paddingVertical: 10,
							paddingHorizontal: 20,
						},
						triggerProps?.style,
					]}
					className={cn(
						"h-12 w-full flex-row items-center justify-center rounded-full border-0 bg-neutral-100 text-base text-black",
						triggerProps?.className
					)}
					onPress={e => {
						if (Keyboard.isVisible()) {
							Keyboard.dismiss()
						}
						triggerProps?.onPress?.(e)
						bottomSheetModalRef.current?.present()
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
					}}
				>
					<Text
						numberOfLines={1}
						className={cn(
							"flex-1",
							selectedValue?.label !== undefined
								? ""
								: cn(
										"text-neutral-400 text-sm",
										placeholderClassName
									)
						)}
					>
						{selectedValue?.label !== undefined
							? selectedValue?.label
							: placeholder}
					</Text>
					<ChevronDownIcon size={14} color="#525252" />
				</TouchableOpacity>
			)}

			<Sheet
				ref={bottomSheetModalRef}
				snapPoints={["60%"]}
				hideHandle
				enableDynamicSizing={false}
				enableHandlePanningGesture={false}
				enableContentPanningGesture={false}
				topInset={inset.top + 16}
			>
				<BottomSheetView
					style={{
						padding: 16,
						gap: 16,
						height: "100%",
						paddingBottom:
							inset.bottom +
							16 +
							Platform.select({ web: 90, default: 0 }),
					}}
				>
					<Button
						className="absolute top-2 right-2 z-50"
						variant="ghost"
						size="icon"
						onPress={closeSheet}
					>
						<XCircleIcon color="#d4d4d4" />
					</Button>
					<Text className="pr-8 font-semibold text-xl">{label}</Text>

					<BottomSheetFlatList
						data={options}
						keyExtractor={item => `${item.value}`}
						renderItem={_renderItem}
					/>
				</BottomSheetView>
			</Sheet>
		</>
	)
}

export default SelectSheet
