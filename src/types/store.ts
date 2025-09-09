import type { SendOtp } from "@/actions/auth/useSendOtp";
import type * as Notifications from "expo-notifications";
import type { User } from "./user";

export interface AppStoreState {
	user: User | null;
	authId: string | null;
	authForm: SendOtp["body"] | null;
	isAuthenticated: boolean;
	lang: {
		app: string | null;
		content: string | null;
	};
	tokens: {
		access: string | null;
		refresh: string | null;
		basicAccess: string | null;
	};
	queryParams: Record<string, string>;
}

export interface NotificationStoreState {
	deviceId: string | null;
	expoPushToken: string | null;
	notification: Notifications.Notification | null;
	response: Notifications.NotificationResponse | null;
	error: Error | null;
}

export interface NavigationStoreState {
	[key: string]: Record<string, unknown>;
}
