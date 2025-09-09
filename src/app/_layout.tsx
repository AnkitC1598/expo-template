import "@/../global.css";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import Constants from "expo-constants";
import "expo-dev-client";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Alert, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from "react-native-reanimated";

import { DEBUG_ENABLED } from "@/config/constants";
import {
	useColorScheme,
	useInitialAndroidBarSync,
} from "@/hooks/useColorScheme";
import "@/i18n";
import { initLogger } from "@/loggers";
import DevTools from "@/organisms/devtools";
import QueryProvider from "@/providers/query";
import QueryParamsProvider from "@/providers/queryParams";
import UpdateProvider from "@/providers/update";
import { getToken } from "@/services/token";
import useAppStore from "@/store";
import useNotificationStore from "@/store/notification";
import { NAV_THEME } from "@/theme";
import { ActivityIndicator } from "@/ui/activity-indicator";
import { KeyboardProvider } from "react-native-keyboard-controller";

export { ErrorBoundary } from "expo-router";

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false, // Reanimated runs in strict mode by default
});

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

initLogger();

const RootLayout = () => {
	useColorScheme();
	useInitialAndroidBarSync();

	const hasHydrated = useAppStore.persist.hasHydrated();
	const dispatchToApp = useAppStore((store) => store.dispatch);
	const dispatchToNotification = useNotificationStore(
		(store) => store.dispatch,
	);

	useEffect(() => {
		const validateAuth = async () => {
			const bat = await getToken("basicAccess");

			if (!bat) {
				dispatchToApp({
					type: "RESET",
				});
			}
		};

		validateAuth();

		if (DEBUG_ENABLED && Platform.OS !== "web") {
			Alert.alert(
				"🐞 Debug Mode Enabled",
				`\n${[Constants?.expoConfig?.scheme ?? "unknown"].flat().join(", ")}\n\n For development purposes, this app is running in debug mode.`,
			);
			activateKeepAwakeAsync();

			return () => {
				deactivateKeepAwake();
			};
		}

		return () => {
			dispatchToNotification({ type: "RESET" });
		};
	}, []);

	return (
		<>
			<StatusBar key="root-status-bar-dark" style="dark" />
			<View className="flex-1 items-center justify-center bg-white web:sm:p-4">
				<View
					id="window"
					className="w-full max-w-md flex-1 web:sm:overflow-hidden web:sm:rounded-xl web:sm:border web:sm:border-neutral-500"
				>
					<QueryParamsProvider />
					<QueryProvider>
						<GestureHandlerRootView style={{ flex: 1 }}>
							<BottomSheetModalProvider>
								<ActionSheetProvider>
									<NavThemeProvider value={NAV_THEME["light"]}>
										<KeyboardProvider>
											<UpdateProvider>
												{hasHydrated ? (
													<Stack
														screenOptions={{
															animation: "ios_from_right",
															headerShown: false,
														}}
													>
														<Stack.Screen name="index" />
													</Stack>
												) : (
													<View className="flex-1 items-center justify-center">
														<ActivityIndicator size="large" />
													</View>
												)}
											</UpdateProvider>
											{DEBUG_ENABLED && <DevTools />}
										</KeyboardProvider>
									</NavThemeProvider>
								</ActionSheetProvider>
							</BottomSheetModalProvider>
						</GestureHandlerRootView>
					</QueryProvider>
				</View>
			</View>
		</>
	);
};

export default RootLayout;
