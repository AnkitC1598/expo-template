import Button from "@/ui/button"
import * as Haptics from "expo-haptics"
import { MotiView } from "moti"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { Keyboard, TextInput, View } from "react-native"
import { XMarkIcon } from "react-native-heroicons/solid"
import { useDebounce } from "use-debounce"

export interface SearchRef {
	clear: () => void
}

const Search = forwardRef(
	(
		{
			searchQuery,
			setSearchQuery,
		}: {
			searchQuery?: string
			setSearchQuery?: React.Dispatch<React.SetStateAction<string>>
		},
		ref
	) => {
		const [isFocused, setIsFocused] = useState(false)
		const [query, setQuery] = useState(searchQuery || "")
		const [debouncedValue] = useDebounce(query, 300)

		useImperativeHandle(ref, () => ({
			clear: () => {
				setQuery("")
				setIsFocused(false)
			},
		}))

		const cancelSearch = () => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
			Keyboard.dismiss()
			setQuery("")
			setIsFocused(false)
		}

		useEffect(() => {
			setSearchQuery?.(debouncedValue)
		}, [debouncedValue, setSearchQuery])

		useEffect(() => {
			setQuery(searchQuery || "")
		}, [searchQuery])

		return (
			<View className="flex-row items-center justify-start gap-2">
				<MotiView
					from={{ width: "100%" }}
					animate={{ width: isFocused ? "85%" : "100%" }}
					transition={{ type: "spring", damping: 10 }}
					className="h-12"
				>
					<View className="flex-1 flex-row items-center gap-1.5 rounded-full bg-neutral-100 px-6 dark:border-neutral-800 dark:bg-neutral-900">
						{/* <FontAwesome
						name="search"
						size={16}
						color={tailwindToHex("text-neutral-400")}
					/> */}
						<TextInput
							className="h-12 flex-1 text-base leading-5 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
							placeholder="Search"
							value={query}
							onChangeText={setQuery}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
						/>
					</View>
				</MotiView>
				<MotiView
					from={{ opacity: 0, scale: 0 }}
					animate={{
						opacity: isFocused ? 1 : 0,
						scale: isFocused ? 1 : 0,
					}}
					transition={{ type: "spring", damping: 10 }}
				>
					<Button
						variant="outline"
						size="icon"
						onPress={cancelSearch}
					>
						<XMarkIcon size={16} color="black" />
					</Button>
				</MotiView>
			</View>
		)
	}
)

export default Search
