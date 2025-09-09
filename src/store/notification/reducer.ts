import { initialNotificationStore } from "@/constants/store";
import { NotificationStoreState } from "@/types/store";
import { produce } from "immer";

export const reducer = (
	state: NotificationStoreState,
	{ type, payload }: { type: string; payload?: unknown }
) => {
	switch (type) {
		case "SET_STATE":
			return produce(state, draft => {
				Object.assign(draft, payload)
			})
		case "SET_DEVICE_ID":
			return produce(state, draft => {
				draft.deviceId = payload as NotificationStoreState["deviceId"]
			})
		case "SET_EXPO_PUSH_TOKEN":
			return produce(state, draft => {
				draft.expoPushToken =
					payload as NotificationStoreState["expoPushToken"]
			})
		case "SET_NOTIFICATION":
			return produce(state, draft => {
				draft.notification =
					payload as NotificationStoreState["notification"]
				draft.response = null
			})
		case "SET_RESPONSE":
			return produce(state, draft => {
				draft.response = payload as NotificationStoreState["response"]
			})
		case "SET_ERROR":
			return produce(state, draft => {
				draft.error = payload as NotificationStoreState["error"]
			})
		case "RESET": {
			const {
				expoPushToken: _,
				deviceId: __,
				...restInitialNotificationStore
			} = initialNotificationStore
			return produce(state, draft => {
				Object.assign(draft, {
					expoPushToken: draft.expoPushToken,
					deviceId: draft.deviceId,
					...restInitialNotificationStore,
				})
			})
		}
		default:
			return state
	}
}
