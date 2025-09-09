import type { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_DEV_SERVER = process.env.APP_VARIANT === "development-server";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";
const ENV = IS_DEV
	? "dev"
	: IS_DEV_SERVER
		? "devServer"
		: IS_PREVIEW
			? "preview"
			: "prod";

const envConfig = {
	devServer: {
		appName: "expo-template (Dev Server)",
		scheme: "expo-template-dev-server",
		identifier: "app.expo.template.devServer",
	},
	dev: {
		appName: "expo-template (Dev)",
		scheme: "expo-template-dev",
		identifier: "app.expo.template.dev",
	},
	preview: {
		appName: "expo-template (Preview)",
		scheme: "expo-template-preview",
		identifier: "app.expo.template.preview",
	},
	prod: {
		appName: "expo-template",
		scheme: "expo-template",
		identifier: "app.expo.template",
	},
}[ENV];

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: envConfig.appName,
	slug: "expo-template",
	version: "0.0.0",
	scheme: envConfig.scheme,
	web: {
		bundler: "metro",
		output: "static",
		favicon: "./assets/favicon.png",
	},
	plugins: [
		"expo-router",
		"expo-localization",
		"expo-tracking-transparency",
		[
			"expo-video",
			{
				supportsBackgroundPlayback: true,
				supportsPictureInPicture: true,
			},
		],
		[
			"expo-av",
			{
				microphonePermission:
					"Allow $(PRODUCT_NAME) to access your microphone.",
			},
		],
		[
			"expo-camera",
			{
				cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
				microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
				recordAudioAndroid: true,
			},
		],
		[
			"expo-notifications",
			{
				icon: "./assets/notification_icon.png",
				color: "#000000",
				enableBackgroundRemoteNotifications: false,
			},
		],
	],
	experiments: {
		typedRoutes: true,
		tsconfigPaths: true,
	},
	orientation: "portrait",
	icon: "./assets/icon.png",
	userInterfaceStyle: "light",
	splash: {
		image: "./assets/splash.png",
		resizeMode: "contain",
		backgroundColor: "#ffffff",
	},
	assetBundlePatterns: ["**/*"],
	ios: {
		supportsTablet: true,
		requireFullScreen: true,
		icon: {
			dark: "./assets/ios-dark.png",
			light: "./assets/ios-light.png",
			tinted: "./assets/ios-tinted.png",
		},
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
			NSUserTrackingUsageDescription:
				"We use Tracking to fix bugs and improve your experience.",
		},
		bundleIdentifier: envConfig.identifier,
	},
	android: {
		adaptiveIcon: {
			foregroundImage: "./assets/adaptive-icon.png",
			backgroundColor: "#ffffff",
		},
		permissions: [
			"android.permission.RECORD_AUDIO",
			"android.permission.MODIFY_AUDIO_SETTINGS",
			"android.permission.CAMERA",
			"com.google.android.gms.permission.AD_ID",
		],
		edgeToEdgeEnabled: true,
		package: envConfig.identifier,
	},
	extra: {
		router: {
			origin: false,
		},
	},
	runtimeVersion: {
		policy: "appVersion",
	},
});
