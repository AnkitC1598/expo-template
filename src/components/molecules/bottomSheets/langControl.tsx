import { LANGS } from "@/constants/lang";
import Storage from "@/services/storage";
import useAppStore from "@/store";
import { Sheet, useSheetRef } from "@/ui/sheet";
import { BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { useTranslation } from "react-i18next";
import {
	Platform,
	Pressable,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { CheckIcon } from "react-native-heroicons/solid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LangControlSheetProps {
	trigger?: any;
	type: "app" | "content";
}

const LangControlSheet = ({ trigger, type = "app" }: LangControlSheetProps) => {
	const { i18n, t } = useTranslation();

	const inset = useSafeAreaInsets();
	const bottomSheetModalRef = useSheetRef();

	const selectedLang = useAppStore((store) => store.lang[type]);
	const dispatch = useAppStore((store) => store.dispatch);

	const onPress = (lang: string) => {
		dispatch({ type: "SET_LANG", payload: { [type]: lang } });
		Storage.setItem(`${type}Lang`, lang);
		if (type === "app") {
			i18n.changeLanguage(lang);
		}
		bottomSheetModalRef.current?.dismiss();
	};

	const _renderItem = ({
		item: lang,
	}: {
		item: { name: string; langCode: string; locale: string };
	}) => {
		const isSelected = selectedLang === lang.locale;

		return (
			<Pressable
				key={lang.langCode}
				className="flex-row gap-4 border-neutral-100 border-b p-4"
				onPress={onPress.bind(null, lang.locale)}
			>
				{isSelected ? (
					<CheckIcon size={24} color="black" />
				) : (
					<View className="h-6 w-6" />
				)}
				<Text>{lang.name}</Text>
			</Pressable>
		);
	};

	return (
		<>
			{trigger ? (
				React.cloneElement(trigger, {
					onPress: () => bottomSheetModalRef.current?.present(),
				})
			) : (
				<TouchableOpacity
					onPress={() => bottomSheetModalRef.current?.present()}
				>
					<Text>Open</Text>
				</TouchableOpacity>
			)}

			<Sheet
				ref={bottomSheetModalRef}
				snapPoints={["50%"]}
				enableHandlePanningGesture
				enableContentPanningGesture={false}
			>
				<BottomSheetView
					style={{
						padding: 16,
						gap: 16,
						height: "100%",
						paddingBottom:
							inset.bottom + 16 + Platform.select({ web: 90, default: 0 }),
					}}
				>
					<Text className="font-semibold text-xl">{t("langScreen.title")}</Text>
					<BottomSheetFlatList
						data={LANGS}
						keyExtractor={(item) => item.langCode}
						renderItem={_renderItem}
					/>
				</BottomSheetView>
			</Sheet>
		</>
	);
};

export default LangControlSheet;
