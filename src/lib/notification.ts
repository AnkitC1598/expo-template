import type {
	DynamicNotification,
	ScheduledNotification,
	StaticNotification,
} from "@/types/notifications";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const initScheduledNotificationChannel = async ({
	name = "Reminder",
}: {
	name?: string;
} = {}): Promise<void> => {
	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync(name, {
			name,
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#9810fa7C",
		});
	}
};

export const getFormattedNotifications = async (): Promise<
	ScheduledNotification[]
> => {
	const allNotifications =
		await Notifications.getAllScheduledNotificationsAsync();

	return allNotifications.map(
		(notification) =>
			({
				identifier: notification.identifier,

				content: {
					title: notification.content.title,
					body: notification.content.body,
					...(notification.content.data && {
						data: notification.content.data,
					}),
				},

				trigger: notification.trigger,
			}) as ScheduledNotification,
	);
};

export const categorizeNotifications = ({
	notificationsToSync,
	existing,
}: {
	notificationsToSync: (StaticNotification | DynamicNotification)[];
	existing: ScheduledNotification[];
}): {
	toSkip: ScheduledNotification[];
	toSchedule: (StaticNotification | DynamicNotification)[];
	toCancel: ScheduledNotification[];
} => {
	const notificationsToSkip: ScheduledNotification[] = [];
	const notificationsToSchedule: (StaticNotification | DynamicNotification)[] =
		[];
	const notificationsToCancel: ScheduledNotification[] = [];

	const existingHashMap = new Map<string, ScheduledNotification>();
	const syncHashMap = new Map<
		string,
		StaticNotification | DynamicNotification
	>();

	existing.forEach((notification) => {
		existingHashMap.set(notification.content.data.hash, notification);
	});

	notificationsToSync.forEach((notification) => {
		syncHashMap.set(notification.content.data.hash, notification);
	});

	notificationsToSync.forEach((notification) => {
		const hash = notification.content.data.hash;
		if (existingHashMap.has(hash)) {
			notificationsToSkip.push(existingHashMap.get(hash)!);
		} else {
			notificationsToSchedule.push(notification);
		}
	});

	existing.forEach((notification) => {
		const hash = notification.content.data.hash;
		if (!syncHashMap.has(hash)) {
			notificationsToCancel.push(notification);
		}
	});

	return {
		toSkip: notificationsToSkip,
		toSchedule: notificationsToSchedule,
		toCancel: notificationsToCancel,
	};
};

export const processNotifications = async ({
	toSchedule,
	toCancel,
}: {
	toSchedule: (StaticNotification | DynamicNotification)[];
	toCancel: ScheduledNotification[];
}): Promise<void> => {
	for (const notification of toSchedule) {
		try {
			await Notifications.scheduleNotificationAsync(notification);
		} catch {
			// Silent error handling to prevent breaking
		}
	}

	for (const notification of toCancel) {
		try {
			await Notifications.cancelScheduledNotificationAsync(
				notification.identifier,
			);
		} catch {
			// Silent error handling to prevent breaking
		}
	}
};

export const syncNotificationGroup = async ({
	existing,
	notificationsToSync,
}: {
	existing: ScheduledNotification[];
	notificationsToSync: (StaticNotification | DynamicNotification)[];
}): Promise<void> => {
	const {
		// toSkip,
		toSchedule,
		toCancel,
	} = categorizeNotifications({
		notificationsToSync,
		existing,
	});

	// console.log({
	// 	total: notificationsToSync.length,
	// 	existing: existing.length,
	// 	skip: toSkip.length,
	// 	schedule: toSchedule.length,
	// 	cancel: toCancel.length,
	// })

	await processNotifications({
		toSchedule,
		toCancel,
	});
};
