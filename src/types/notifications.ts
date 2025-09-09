import * as Notifications from "expo-notifications"

export interface StaticNotification {
	content: Notifications.NotificationContentInput & {
		data: { hash: string; type: "static" }
	}
	trigger: Notifications.DailyTriggerInput | Notifications.WeeklyTriggerInput
}

export interface DynamicNotification {
	content: Notifications.NotificationContentInput & {
		data: { hash: string; type: "dynamic" }
	}
	trigger: Notifications.DateTriggerInput
}

export interface ScheduledNotification {
	identifier: string
	content: (StaticNotification | DynamicNotification)["content"]
	trigger: (StaticNotification | DynamicNotification)["trigger"]
}
