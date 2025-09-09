import Image from "@/atoms/image";
import { APP_INFO } from "@/config/constants";
import { tailwindToHex } from "@/lib/tailwind";
import { sleep } from "@/lib/utils";
import { ActivityIndicator } from "@/ui/activity-indicator";
import Button from "@/ui/button";
import Progress from "@/ui/progress";
import { Sheet, useSheetRef } from "@/ui/sheet";
import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { isRunningInExpoGo } from "expo";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import type React from "react";
import { useEffect, useState } from "react";
import {
	type EmitterSubscription,
	Keyboard,
	Platform,
	Text,
	View,
} from "react-native";
import { BoltIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UpdateProviderProps {
	children: React.ReactNode;
}

const IS_EXPO_GO =
	isRunningInExpoGo() || APP_INFO.scheme.includes("dev-server");

const waitForProgress = (
	getProgressValue: () => number,
	target = 100,
): Promise<void> =>
	new Promise((resolve) => {
		if (getProgressValue() >= target) {
			resolve();
			return;
		}
		const checkProgress = setInterval(() => {
			if (getProgressValue() >= target) {
				clearInterval(checkProgress);
				resolve();
			}
		}, 100);
	});

const UpdateProvider = ({ children }: UpdateProviderProps) => {
	const [updateStatus, setUpdateStatus] = useState<
		0 | 1 | 2 | 3 | -1 | -2 // 0: checking, 1: prompt, 2: downloading, 3: reloading, -1: no update -2: error
	>(0);
	const [progress, setProgress] = useState(50);

	const updateSheetModalRef = useSheetRef();
	const insets = useSafeAreaInsets();

	const IconColor = tailwindToHex("text-neutral-400");

	const fetchAndReload = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		try {
			setUpdateStatus(2);
			setProgress(0);

			let progressValue = 0;

			const maxProgressLimit = 70 + Math.round(Math.random() * 10); // 70–80

			const interval = setInterval(() => {
				progressValue = Math.min(
					maxProgressLimit,
					Math.round(progressValue + Math.random() * 5),
				);
				setProgress(progressValue);

				if (progressValue >= maxProgressLimit) {
					clearInterval(interval);
				}
			}, 100);

			await (IS_EXPO_GO
				? waitForProgress(() => progressValue, maxProgressLimit)
				: Updates.fetchUpdateAsync());

			progressValue = 100;
			setProgress(100);

			clearInterval(interval);

			await sleep(200);

			setUpdateStatus(3);

			await sleep(300);

			if (IS_EXPO_GO) {
				setUpdateStatus(-1);
				updateSheetModalRef.current?.dismiss();
				return;
			}
			await Updates.reloadAsync();
		} catch (e) {
			console.error("Update fetch error:", e);
			setUpdateStatus(-2);
			setProgress(0);
		}
	};

	useEffect(() => {
		const checkUpdate = async () => {
			try {
				if (IS_EXPO_GO || Platform.OS === "web") {
					setUpdateStatus(-1);
					// updateSheetModalRef.current?.present()
					return;
				}
				const update = await Updates.checkForUpdateAsync();
				if (update.isAvailable) {
					setUpdateStatus(1);
					updateSheetModalRef.current?.present();
				} else {
					setUpdateStatus(-1);
				}
			} catch (e) {
				console.error("Update check error:", e);
				setUpdateStatus(-2);
			}
		};

		checkUpdate();
	}, []);

	useEffect(() => {
		let keyboardDidShowListener: EmitterSubscription | null = null;

		if (updateStatus !== -1) {
			keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
				Keyboard.dismiss();
			});
		}

		return () => {
			if (keyboardDidShowListener) {
				keyboardDidShowListener.remove();
			}
		};
	}, [updateStatus]);

	return (
		<>
			{children}
			<Sheet
				ref={updateSheetModalRef}
				snapPoints={["60%"]}
				closable={updateStatus === -1}
			>
				<BottomSheetView>
					<BottomSheetScrollView>
						<View
							className="items-center gap-6 px-4 pt-10"
							style={{
								paddingBottom: insets.bottom + 300,
							}}
						>
							<View className="aspect-video h-56">
								<Image
									source="https://lucdn.letsupgrade.net/assets/app_update_e69b922185.png"
									alt="Update"
								/>
							</View>
							<View className="gap-1">
								<Text className="text-center font-bold text-xl">
									App Update Required!
								</Text>
								<Text className="text-center text-neutral-400">
									We have added new features and fixed some bugs to make your
									learning experience seamless
								</Text>
							</View>
							<View className="w-full gap-3">
								{[1, -2].includes(updateStatus) && (
									<Button className="w-full" onPress={fetchAndReload}>
										Update & Reload
									</Button>
								)}
								{updateStatus === -2 && (
									<Text className="text-center text-red-600">
										Update failed! Tap to try again
									</Text>
								)}
							</View>
							{updateStatus === 2 && (
								<View className="w-full gap-3">
									<View className="flex-row items-center justify-between">
										<View className="flex-row items-center gap-1">
											<BoltIcon size={16} color={IconColor} />
											<Text className="text-neutral-400 text-sm">
												Updating...
											</Text>
											<Text className="font-medium text-black text-sm">
												{progress}%
											</Text>
										</View>
									</View>
									<Progress
										className="h-1.5 w-full"
										value={progress}
										animationDuration={100}
									/>
								</View>
							)}
							{[0, 3].includes(updateStatus) && (
								<ActivityIndicator size="large" />
							)}
						</View>
					</BottomSheetScrollView>
				</BottomSheetView>
			</Sheet>
		</>
	);
};

export default UpdateProvider;
