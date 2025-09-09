import { APP_INFO } from "@/config/constants"
import { renderJSON } from "@/lib/renderers/json"
import { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import * as Application from "expo-application"
import * as Device from "expo-device"
import * as Updates from "expo-updates"
import { useEffect, useState } from "react"
import { Alert, Text, View } from "react-native"

const excludeKeys = [
	"manifest",
	"localAssets",
	"UpdateInfoType",
	"UpdatesLogEntryLevel",
	"UpdatesLogEntryCode",
	"UpdatesCheckAutomaticallyValue",
	"UpdateCheckResultNotAvailableReason",
	"DeviceType",
	"ApplicationReleaseType",
]

const MiscViewer = () => {
	const [misc, setMisc] = useState<Record<string, unknown>>({})

	useEffect(() => {
		;(async () => {
			try {
				setMisc({
					APP_INFO,
					Updates: {
						...Object.fromEntries(
							Object.entries(Updates).filter(
								([key, value]) =>
									typeof value !== "function" &&
									!excludeKeys.includes(key)
							)
						),
					},
					Device: {
						...Object.fromEntries(
							Object.entries(Device).filter(
								([key, value]) =>
									typeof value !== "function" &&
									!excludeKeys.includes(key)
							)
						),
						deviceType: Device.DeviceType[
							Device.deviceType || 0
						] as keyof typeof Device.DeviceType,
					},
					Application: {
						...Object.fromEntries(
							Object.entries(Application).filter(
								([key, value]) =>
									typeof value !== "function" &&
									!excludeKeys.includes(key)
							)
						),
					},
				})
			} catch (error) {
				console.error("Error fetching misc:", error)
				Alert.alert("Error", "Failed to fetch misc.")
			}
		})()
	}, [])

	return (
		<>
			<>
				<Text className="text-center font-semibold text-xl">
					Misc DevTools
				</Text>
				<BottomSheetScrollView
					className="flex-1"
					contentContainerClassName="gap-2"
				>
					{misc ? (
						renderJSON(misc)
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

export default MiscViewer
