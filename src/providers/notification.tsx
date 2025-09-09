import {
	type RegisterPushToken,
	useRegisterPushToken,
} from "@/actions/user/useRegisterPushToken"
import useNotificationStore from "@/store/notification"
import * as Application from "expo-application"
import Constants from "expo-constants"
import * as Device from "expo-device"
import type { EventSubscription } from "expo-modules-core"
import * as Notifications from "expo-notifications"
import { useEffect, useRef } from "react"
import { Platform } from "react-native"
import { v4 as uuidv4 } from "uuid"

const excludeDeviceInfoKeys = [
	"osBuildFingerprint",
	"supportedCpuArchitectures",
	"DeviceType",
]

const NotificationProvider = () => {
	const deviceId = useNotificationStore(store => store.deviceId)
	const expoPushToken = useNotificationStore(store => store.expoPushToken)
	const dispatch = useNotificationStore(store => store.dispatch)

	const notificationListener = useRef<EventSubscription | null>(null)
	const responseListener = useRef<EventSubscription | null>(null)

	const { mutateAsync: registerPushToken } = useRegisterPushToken({
		onSuccess: ({ token, deviceId }) => {
			dispatch({ type: "SET_STATE", payload: { token, deviceId } })
		},
	})

	const getUniqueId = async () => {
		if (Platform.OS === "android") {
			return Application.getAndroidId()
		}

		if (Platform.OS === "ios") {
			const idfv = await Application.getIosIdForVendorAsync()
			if (idfv) {
				return idfv
			}
		}

		return deviceId || uuidv4()
	}

	useEffect(() => {
		const registerPushNotificationToken = async () => {
			const { token, error } = await registerForPushNotificationsAsync()
			if (error) {
				dispatch({ type: "SET_ERROR", payload: error })
			} else if (token) {
				const uniqueId = await getUniqueId()
				// console.log(JSON.stringify(body, null, 4))
				if (token !== expoPushToken || deviceId !== uniqueId) {
					const deviceType = Device.DeviceType[
						Device.deviceType || 0
					] as keyof typeof Device.DeviceType

					const body = {
						deviceOs: Platform.OS,
						deviceId: uniqueId,
						deviceType,
						token,
						device: {
							...Object.fromEntries(
								Object.entries(Device).filter(
									([key, value]) =>
										typeof value !== "function" &&
										!excludeDeviceInfoKeys.includes(key)
								)
							),
							deviceType,
						} as RegisterPushToken["body"]["device"],
					}
					await registerPushToken({ body })
				}
			}
		}

		registerPushNotificationToken()

		notificationListener.current =
			Notifications.addNotificationReceivedListener(notification => {
				dispatch({ type: "SET_NOTIFICATION", payload: notification })
			})

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener(response => {
				dispatch({ type: "SET_RESPONSE", payload: response })
			})

		return () => {
			notificationListener.current?.remove()
			responseListener.current?.remove()
		}
	}, [])

	return null
}

export default NotificationProvider

interface RegisterSuccess {
	token: string
	error: undefined
}

interface RegisterError {
	token: undefined
	error: string
}

type RegisterResult = RegisterSuccess | RegisterError

export const registerForPushNotificationsAsync =
	async (): Promise<RegisterResult> => {
		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#9810fa7C",
			})
		}

		if (!Device.isDevice) {
			return {
				token: undefined,
				error: "Must use physical device for push notifications",
			}
		}

		const { status: existingStatus } =
			await Notifications.getPermissionsAsync()
		const finalStatus =
			existingStatus === "granted"
				? existingStatus
				: (await Notifications.requestPermissionsAsync()).status

		if (finalStatus !== "granted") {
			return {
				token: undefined,
				error: "Failed to get push token for push notification!",
			}
		}

		const projectId =
			Constants?.expoConfig?.extra?.eas?.projectId ??
			Constants?.easConfig?.projectId
		if (!projectId) {
			return { token: undefined, error: "Project ID not found" }
		}

		try {
			const { data: pushTokenString } =
				await Notifications.getExpoPushTokenAsync({ projectId })
			return { token: pushTokenString, error: undefined }
		} catch (e: unknown) {
			return { token: undefined, error: `Error getting push token: ${e}` }
		}
	}
