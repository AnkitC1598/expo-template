import {
	getFormattedNotifications,
	initScheduledNotificationChannel,
	syncNotificationGroup,
} from "@/lib/notification"
import { DynamicNotification, StaticNotification } from "@/types/notifications"
import { EventSubscription } from "expo-modules-core"
import * as Notifications from "expo-notifications"
import hash from "object-hash"
import { useEffect, useRef } from "react"

const useScheduledNotifications = (): void => {
	const notificationListener = useRef<EventSubscription | null>(null)

	useEffect(() => {
		const initAndSyncNotifications = async () => {
			await initScheduledNotificationChannel()

			const existing = await getFormattedNotifications()
			// console.log(
			// 	JSON.stringify(
			// 		{
			// 			all: existing.length,
			// 			allStatic: existing.filter(
			// 				n => n.content.data.type === "static"
			// 			).length,
			// 			allDynamic: existing.filter(
			// 				n => n.content.data.type === "dynamic"
			// 			).length,
			// 			static: staticNotifications.length,
			// 			dynamic: dynamicNotifications.length,
			// 		},
			// 		null,
			// 		4
			// 	)
			// )

			await syncNotificationGroup({
				existing,
				notificationsToSync: [
					...staticNotifications,
					...dynamicNotifications,
				],
			})

			// const updated = await getFormattedNotifications()
			// console.log(
			// 	JSON.stringify(
			// 		{
			// 			all: updated.length,
			// 			allStatic: updated.filter(
			// 				n => n.content.data.type === "static"
			// 			).length,
			// 			allDynamic: updated.filter(
			// 				n => n.content.data.type === "dynamic"
			// 			).length,
			// 			static: staticNotifications.length,
			// 			dynamic: dynamicNotifications.length,
			// 		},
			// 		null,
			// 		4
			// 	)
			// )
			// await Notifications.cancelAllScheduledNotificationsAsync()
		}

		initAndSyncNotifications()

		notificationListener.current =
			Notifications.addNotificationReceivedListener(
				async notification => {
					if (
						notification.request.content?.data?.type === "dynamic"
					) {
						await Notifications.scheduleNotificationAsync({
							content: {
								title: notification.request.content.title,
								body: notification.request.content.body,
								data: notification.request.content.data,
							},
							trigger: {
								date: createRandomScheduledTime(true),
								type: Notifications.SchedulableTriggerInputTypes
									.DATE,
								channelId: "Reminder",
							},
						})
					}
				}
			)

		return () => {
			notificationListener.current?.remove()
		}
	}, [])
}

export default useScheduledNotifications

export const createRandomScheduledTime = (addNextDay = false) => {
	const date = new Date()

	if (addNextDay) {
		date.setDate(date.getDate() + 1) // add 1 day
	}

	date.setHours(
		Math.floor(Math.random() * (22 - 10 + 1)) + 10, // 10 to 22 (inclusive) random hours
		Math.floor(Math.random() * 60), // random minutes
		0, // seconds
		0 // milliseconds
	)

	return date
}

export const staticNotifications: StaticNotification[] = [
	{
		content: {
			title: "Sample Static Notification",
			body: "This is a static notification example.",
		},
		trigger: {
			hour: 8,
			minute: 0,
			type: Notifications.SchedulableTriggerInputTypes.DAILY,
			channelId: "Reminder",
		},
	},
].map(notification => ({
	content: {
		...notification.content,
		data: {
			hash: hash(notification),
			type: "static",
		},
	},
	trigger: notification.trigger as StaticNotification["trigger"],
}))

export const dynamicNotifications: DynamicNotification[] = [
	{
		content: {
			title: "Sample Dynamic Notification",
			body: "This is a dynamic notification example.",
		},
		trigger: {
			date: createRandomScheduledTime(),
			type: Notifications.SchedulableTriggerInputTypes.DATE,
			channelId: "Reminder",
		},
	},
].map(notification => ({
	content: {
		...notification.content,
		data: {
			hash: hash({
				content: notification.content,
				trigger: { channelId: notification.trigger.channelId },
			}),
			type: "dynamic",
		},
	},
	trigger: notification.trigger as DynamicNotification["trigger"],
}))
