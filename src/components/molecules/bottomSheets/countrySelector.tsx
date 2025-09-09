import CountryCodes, { type CountryCode } from "@/constants/countryCodes"
import { cn } from "@/lib/utils"
import Button from "@/ui/button"
import { Sheet, useSheetRef } from "@/ui/sheet"
import {
	BottomSheetFlatList,
	BottomSheetTextInput,
	BottomSheetView,
} from "@gorhom/bottom-sheet"
import * as Haptics from "expo-haptics"
import React from "react"
import {
	Keyboard,
	Platform,
	Pressable,
	Text,
	TouchableOpacity,
	type TouchableOpacityProps,
	View,
} from "react-native"
import { CheckIcon, XCircleIcon } from "react-native-heroicons/solid"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface CountrySelectorSheetProps {
	trigger?: any
	value: CountryCode["dial_code"]
	onChange: (value: CountryCode) => void
	triggerProps?: TouchableOpacityProps
}

const CountrySelectorSheet = ({
	trigger,
	triggerProps = {},
	value,
	onChange,
}: CountrySelectorSheetProps) => {
	const bottomSheetModalRef = useSheetRef()
	const inset = useSafeAreaInsets()

	const [query, setQuery] = React.useState("")

	const filteredCountryCodes = CountryCodes.filter(
		code =>
			code.dial_code.includes(query) ||
			code.name.toLowerCase().includes(query.toLowerCase()) ||
			code.code.toLowerCase().includes(query.toLowerCase())
	)

	const onPress = (code: CountryCode) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		onChange(code)
		setQuery("")
		bottomSheetModalRef.current?.dismiss()
	}

	const closeSheet = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		bottomSheetModalRef.current?.dismiss()
	}

	const _renderItem = ({ item: code }: { item: CountryCode }) => {
		const isSelected = code.dial_code === value
		return (
			<TouchableOpacity
				key={code.code}
				className={cn(
					"mb-2 w-full flex-row items-center gap-4 rounded-xl border bg-neutral-100 p-4",
					isSelected ? "" : "border-transparent"
				)}
				onPress={onPress.bind(null, code)}
			>
				<View className="flex-1 flex-row items-center gap-4">
					<Text className="text-xl">{code.flag}</Text>
					<Text className="tabular-nums">{code.dial_code}</Text>
					<Text className="flex-1">{code.name}</Text>
				</View>
				{isSelected ? (
					<CheckIcon size={24} color="black" />
				) : (
					<View className="h-6 w-6" />
				)}
			</TouchableOpacity>
		)
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
					onPress={e => {
						if (Keyboard.isVisible()) {
							Keyboard.dismiss()
						}
						triggerProps?.onPress?.(e)
						bottomSheetModalRef.current?.present()
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
					}}
				>
					<Text className="">{value}</Text>
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
					<Text className="pr-8 font-semibold text-xl">
						Select Country Code
					</Text>
					<BottomSheetTextInput
						className="h-12 w-full shrink-0 rounded-xl border border-neutral-200 bg-neutral-100 px-6 text-base leading-5 placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:placeholder:text-neutral-400"
						placeholder="Search"
						value={query}
						onChangeText={setQuery}
					/>
					<BottomSheetFlatList
						data={filteredCountryCodes}
						keyExtractor={item => item.code}
						renderItem={_renderItem}
						ListEmptyComponent={
							<Pressable
								className="h-full items-center justify-center"
								onPress={() => {
									bottomSheetModalRef.current?.snapToIndex(0)
									Keyboard.dismiss()
								}}
							>
								<Text className="text-neutral-400">
									No results found
								</Text>
							</Pressable>
						}
					/>
				</BottomSheetView>
			</Sheet>
		</>
	)
}

export default CountrySelectorSheet
