import { renderJSON } from "@/lib/renderers/json"
import { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import * as Notifications from "expo-notifications"
import React, { useEffect, useState } from "react"
import { Alert, Text, View } from "react-native"

const NotificationsViewer = () => {
	const [notifications, setNotifications] = useState<Record<string, unknown>>(
		{}
	)

	useEffect(() => {
		;(async () => {
			try {
				const notifications: Notifications.NotificationRequest[] =
					await Notifications.getAllScheduledNotificationsAsync()

				const staticNotifications = notifications.filter(
					notification => notification.content.data.type === "static"
				)
				const dynamicNotifications = notifications.filter(
					notification => notification.content.data.type === "dynamic"
				)

				setNotifications({
					Static: staticNotifications,
					Dynamic: dynamicNotifications,
				})
			} catch (error) {
				console.error("Error fetching notifications:", error)
				Alert.alert("Error", "Failed to fetch notifications.")
			}
		})()
	}, [])

	return (
		<>
			<>
				<Text className="text-center font-semibold text-xl">
					Scheduled Notifications DevTools
				</Text>
				<BottomSheetScrollView
					className="flex-1"
					contentContainerClassName="gap-2"
				>
					{notifications ? (
						renderJSON(notifications)
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

export default NotificationsViewer
