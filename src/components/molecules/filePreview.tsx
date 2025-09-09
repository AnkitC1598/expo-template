import Audio from "@/atoms/audio"
import Image from "@/atoms/image"
import Video from "@/atoms/video"
import useFileType from "@/hooks/useFileType"
import useWarmUpBrowser from "@/hooks/useWarmpUpBrowser"
import { ActivityIndicator } from "@/ui/activity-indicator"
import Button from "@/ui/button"
import * as WebBrowser from "expo-web-browser"
import React, { useState } from "react"
import { Platform, Text, View } from "react-native"
import { WebView as ExpoWebView } from "react-native-webview"

const FilePreview = ({ url, ext }: { url: string; ext?: string }) => {
	const [errored, setErrored] = useState(false)
	const { isImage, isAudio, isDocument, isVideo, isPDF, isLink } =
		useFileType({
			ext,
		})

	const renderImage = () => (
		<Image source={{ uri: url }} contentFit="contain" />
	)

	const renderAudio = () => (
		<View className="flex-1 flex-row items-center justify-center p-4">
			<Audio uri={url} />
		</View>
	)

	const renderWebView = () => {
		const isWeb = Platform.OS === "web"
		const src = isLink
			? url
			: isPDF
				? isWeb
					? url
					: `https://docs.google.com/gview?url=${url}&embedded=true`
				: `https://view.officeapps.live.com/op/embed.aspx?src=${url}`
		return isWeb ? (
			<View className="flex-1">
				<WebViewLoader />
				<iframe
					src={src}
					className="z-10 h-full w-full"
					onError={() => setErrored(true)}
				/>
			</View>
		) : (
			<WebView source={src} onError={() => setErrored(true)} />
		)
	}

	const renderVideo = () => (
		<Video
			src={url}
			videoStyle={{ borderRadius: 0 }}
			contentFit="contain"
			fullscreen
		/>
	)

	const renderContent = () => {
		if (errored) {
			return <FallbackPreview url={url} />
		}
		if (isImage) {
			return renderImage()
		}
		if (isAudio) {
			return renderAudio()
		}
		if (isDocument || isPDF || isLink) {
			return renderWebView()
		}
		if (isVideo) {
			return renderVideo()
		}
		return <FallbackPreview url={url} />
	}

	return <View className="w-full flex-1">{renderContent()}</View>
}

export default FilePreview

const FallbackPreview = ({ url }: { url: string }) => {
	useWarmUpBrowser()

	return (
		<View className="flex-1 items-center justify-center gap-4">
			<Text className="text-center text-gray-500">
				Cannot preview this file type.
			</Text>
			<Button
				onPress={() => {
					WebBrowser.openBrowserAsync(url, {
						presentationStyle:
							WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
					})
				}}
			>
				<Text>Open File</Text>
			</Button>
		</View>
	)
}

const WebViewLoader = () => {
	return (
		<>
			<View className="absolute inset-0 h-full w-full items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		</>
	)
}

const WebView = ({
	source,
	onError,
}: {
	source: string
	onError: () => void
}) => {
	// useWarmUpBrowser()

	return (
		<View className="flex-1">
			{/* <View className="p-1 px-4">
				<Button
					onPress={() => {
						WebBrowser.openBrowserAsync(
							source as unknown as string,
							{
								presentationStyle:
									WebBrowser.WebBrowserPresentationStyle
										.FORM_SHEET,
							}
						)
					}}
				>
					Open in Browser
				</Button>
			</View> */}
			<ExpoWebView
				source={{ uri: source }}
				startInLoadingState
				renderLoading={() => <WebViewLoader />}
				onError={onError}
			/>
		</View>
	)
}
