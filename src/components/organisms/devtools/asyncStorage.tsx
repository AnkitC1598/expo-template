import { renderJSON } from "@/lib/renderers/json"
import { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { useEffect, useState } from "react"
import { Alert, Text, View } from "react-native"

const AsyncStorageViewer = () => {
	const [storageItems, setStorageItems] = useState<Record<string, unknown>>(
		{}
	)

	useEffect(() => {
		;(async () => {
			try {
				let keys = await AsyncStorage.getAllKeys()
				keys = keys.filter(key => key !== "REACT_QUERY_OFFLINE_CACHE")

				if (!keys.length) {
					setStorageItems({})
					return
				}

				const stores = await AsyncStorage.multiGet(keys)

				const parsedStores = stores.reduce<Record<string, unknown>>(
					(acc, [key, value]) => {
						if (!key) {
							return acc
						}

						try {
							acc[key] = value ? JSON.parse(value) : null
						} catch {
							acc[key] = value
						}

						return acc
					},
					{}
				)

				setStorageItems(parsedStores)
			} catch (error) {
				console.error("Error fetching AsyncStorage data:", error)
				Alert.alert("Error", "Failed to fetch AsyncStorage data.")
			}
		})()
	}, [])

	return (
		<>
			<>
				<Text className="text-center font-semibold text-xl">
					AsyncStorage DevTools
				</Text>
				<BottomSheetScrollView
					className="flex-1"
					contentContainerClassName="gap-2"
				>
					{storageItems ? (
						renderJSON(storageItems)
					) : (
						<View className="items-center">
							<Text>NO DATA</Text>
						</View>
					)}
				</BottomSheetScrollView>
			</>
		</>
	)
}

export default AsyncStorageViewer
