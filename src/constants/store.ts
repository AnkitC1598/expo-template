import type {
	AppStoreState,
	NavigationStoreState,
	NotificationStoreState,
} from "@/types/store";

export const initialAppState: AppStoreState = {
	user: null,
	authId: null,
	authForm: null,
	isAuthenticated: false,
	tokens: {
		access: null,
		refresh: null,
		basicAccess: null,
	},
	lang: {
		app: null,
		content: null,
	},
};

export const initialNotificationStore: NotificationStoreState = {
	deviceId: null,
	expoPushToken: null,
	notification: null,
	response: null,
	error: null,
};

export const initialNavigationState: NavigationStoreState = {};
