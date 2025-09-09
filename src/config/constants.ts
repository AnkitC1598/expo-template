import { isRunningInExpoGo } from "expo"
import Constants from "expo-constants"
import { Platform } from "react-native"

export const DEBUG_ENABLED = ["preview", "dev"].some(env => {
	const scheme = Constants?.expoConfig?.scheme
	return typeof scheme === "string" && scheme.includes(env)
})

export const ENV = isRunningInExpoGo()
	? "expo-go"
	: typeof Constants.expoConfig?.scheme === "string"
		? Constants.expoConfig.scheme.includes("-")
			? Constants.expoConfig.scheme.replace("expo-template-", "")
			: "production"
		: "unknown"

export const APP_INFO = {
	version: Constants.expoConfig?.version ?? "0.0.0",
	appName: Constants.expoConfig?.name ?? "expo-template",
	scheme: Constants.expoConfig?.scheme ?? "expo-template",
	identifier: Platform.select({
		android: Constants.expoConfig?.android?.package ?? "app.expo.template",
		ios: Constants.expoConfig?.ios?.bundleIdentifier ?? "app.expo.template",
		default: "app.expo.template",
	}),
}
