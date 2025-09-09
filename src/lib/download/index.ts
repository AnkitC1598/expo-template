import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { Platform } from "react-native"
import Share, { ShareSingleOptions, Social } from "react-native-share"

export const download = async ({
	url,
	fileName,
}: {
	url: string
	fileName: string
}): Promise<boolean> => {
	if (Platform.OS === "web" && typeof window !== "undefined") {
		const a = document.createElement("a")
		a.href = url
		a.download = fileName
		a.target = "_blank"
		a.click()
		return true
	}

	try {
		const { uri, headers } = await FileSystem.downloadAsync(
			url,
			FileSystem.documentDirectory + fileName
		)

		const mimeType = headers["content-type"] || "application/octet-stream"

		if (!headers["content-type"]) {
			console.warn(
				"No MIME type found for the downloaded file. Using default 'application/octet-stream'."
			)
		}

		if (Platform.OS === "android") {
			const permission =
				await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()

			if (permission.granted) {
				const base64 = await FileSystem.readAsStringAsync(uri, {
					encoding: FileSystem.EncodingType.Base64,
				})

				const destUri =
					await FileSystem.StorageAccessFramework.createFileAsync(
						permission.directoryUri,
						fileName,
						mimeType
					)

				await FileSystem.writeAsStringAsync(destUri, base64, {
					encoding: FileSystem.EncodingType.Base64,
				})

				return true
			}
		}

		return await share({
			uri,
			mimeType,
			fileName,
			dialogTitle: `Download ${fileName}`,
		})
	} catch (error) {
		console.error("Download failed:", error)
		return false
	}
}

export const share = async ({
	url,
	uri,
	mimeType,
	fileName,
	dialogTitle,
	whatsapp,
}: {
	url?: string
	uri?: string
	mimeType?: string
	fileName: string
	dialogTitle?: string
	whatsapp?: {
		title?: string
		message: string
	}
}): Promise<boolean> => {
	if (!uri && !url) {
		console.error("Either 'url' or 'uri' must be provided for sharing.")
		return false
	}

	if (Platform.OS === "web" && typeof window !== "undefined") {
		return await webShare({
			dialogTitle,
			fileName,
			message: whatsapp?.message,
			url,
		})
	}

	if (whatsapp) {
		return await whatsappShare({
			title: whatsapp.title || fileName,
			url,
			message: whatsapp.message,
		})
	}

	if (!(await Sharing.isAvailableAsync())) {
		console.warn("Sharing is not available on this device.")
		return false
	}

	try {
		if (!uri && url) {
			const result = await FileSystem.downloadAsync(
				url,
				FileSystem.documentDirectory + fileName
			)

			uri = result.uri
			mimeType =
				result.headers["content-type"] || "application/octet-stream"
		}

		await Sharing.shareAsync(uri!, {
			mimeType: mimeType || "application/octet-stream",
			dialogTitle: dialogTitle || `Share ${fileName}`,
		})

		return true
	} catch (error) {
		console.error("Sharing failed:", error)
		return false
	}
}

const webShare = async ({
	dialogTitle,
	fileName,
	message,
	url,
}: {
	dialogTitle?: string
	fileName: string
	message?: string
	url?: string
}): Promise<boolean> => {
	if (navigator.share && url) {
		await navigator.share({
			title: dialogTitle || `Share ${fileName}`,
			text: message,
			url,
		})
		return true
	}
	return false
}

const whatsappShare = async ({
	title,
	url,
	message,
}: {
	title: string
	url?: string
	message: string
}): Promise<boolean> => {
	const options: ShareSingleOptions = {
		title,
		message,
		url,
		social: Social.Whatsapp,
	}

	try {
		const { success } = await Share.shareSingle(options)
		return success
	} catch (error) {
		console.error("WhatsApp sharing failed:", error)
		return false
	}
}
