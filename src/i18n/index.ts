import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Localization from "expo-localization"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Locale imports
import en_US from "./locales/en_US/translation.json"
import gu_IN from "./locales/gu_IN/translation.json"
import hi_IN from "./locales/hi_IN/translation.json"
import mr_IN from "./locales/mr_IN/translation.json"
import pa_IN from "./locales/pa_IN/translation.json"
import te_IN from "./locales/te_IN/translation.json"

// Resources object
const resources = {
	en_US: { translation: en_US },
	gu_IN: { translation: gu_IN },
	hi_IN: { translation: hi_IN },
	mr_IN: { translation: mr_IN },
	pa_IN: { translation: pa_IN },
	te_IN: { translation: te_IN },
}

const initI18n = async () => {
	let lng = await AsyncStorage.getItem("appLang")

	if (!lng) {
		lng = Localization.getLocales()[0].languageTag.replaceAll("-", "_")
	}

	i18n.use(initReactI18next).init({
		resources,
		lng,
		fallbackLng: "en-US",
		interpolation: {
			escapeValue: false,
		},
	})
}

initI18n()

export default i18n
