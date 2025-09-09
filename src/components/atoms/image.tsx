import { blurhash } from "@/constants/image"
import { cn } from "@/lib/utils"
import {
	Image as ExpoImage,
	type ImageProps as ExpoImageProps,
	type ImageSource,
	useImage,
} from "expo-image"
import type React from "react"
import { useEffect, useState } from "react"
import { Platform, Image as RNImage, View, type ViewProps } from "react-native"

export interface ImageProps extends ExpoImageProps {
	source?: ImageSource | number | string
	grayScale?: boolean | number
	withAspectRatio?: boolean
	withBlurhash?: boolean
	className?: string
	children?: React.ReactNode
	imageStyle?: ExpoImageProps["style"]
	containerStyle?: ViewProps["style"]
	webImageStyle?: React.CSSProperties
}

const Image = (props: ImageProps) => {
	if (!props.source) {
		return <FallbackImage />
	}

	if (typeof props.source === "number") {
		const image = RNImage.resolveAssetSource(props.source)
		return <NativeImage {...props} source={image} />
	}

	if (Platform.OS === "web") {
		return <WebImage {...props} />
	}

	return <NativeImage {...props} />
}

export default Image

const NativeImage = ({
	source,
	alt,
	contentFit = "contain",
	imageStyle = {},
	containerStyle = {},
	grayScale = false,
	withAspectRatio = false,
	withBlurhash = false,
	className = "",
	transition = 300,
	children = null,
	...props
}: ImageProps) => {
	const image = useImage(source as ImageSource)

	const renderImage = () => (
		<>
			<ExpoImage
				source={image}
				alt={alt}
				style={[
					{ flex: 1, width: "100%", borderRadius: 12 },
					grayScale ? { tintColor: "gray" } : {},
					imageStyle,
				]}
				contentFit={contentFit}
				transition={transition}
				{...(withBlurhash ? { placeholder: { blurhash } } : {})}
				{...props}
			/>
			{grayScale && (
				<ExpoImage
					source={image}
					alt={alt}
					style={[
						{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							opacity:
								typeof grayScale === "boolean"
									? 0.2
									: grayScale,
						},
						imageStyle,
					]}
					contentFit={contentFit}
					transition={transition}
					{...(withBlurhash ? { placeholder: { blurhash } } : {})}
				/>
			)}
		</>
	)

	const aspectRatio =
		withAspectRatio && image?.width && image?.height
			? image.width / image.height
			: undefined

	return withAspectRatio && aspectRatio ? (
		<View
			style={[{ aspectRatio }, containerStyle as ViewProps["style"]]}
			className={cn(className, aspectRatio > 1 ? "w-full" : "flex-1")}
		>
			{renderImage()}
			{children}
		</View>
	) : (
		renderImage()
	)
}

const WebImage = ({
	source,
	alt,
	webImageStyle = {},
	containerStyle = {},
	grayScale = false,
	withAspectRatio = false,
	className = "",
	children = null,
}: ImageProps) => {
	const [aspectRatio, setAspectRatio] = useState<number | null>(null)

	const uri =
		typeof source === "string" ? source : (source as ImageSource)?.uri

	useEffect(() => {
		if (!withAspectRatio || !uri || typeof window === "undefined") {
			return
		}

		const img = new window.Image()
		img.onload = () => {
			if (img.width && img.height) {
				setAspectRatio(img.width / img.height)
			}
		}
		img.src = uri
	}, [uri, withAspectRatio])

	const style: React.CSSProperties = {
		width: "100%",
		height: "100%",
		borderRadius: 12,
		objectFit: "contain",
		filter:
			grayScale !== false
				? `grayscale(${typeof grayScale === "number" ? grayScale : 1})`
				: undefined,
		...(webImageStyle as React.CSSProperties),
	}

	const imgElement = (
		<img src={uri} alt={alt} style={style} className={className} />
	)

	return withAspectRatio && aspectRatio ? (
		<View
			style={[{ aspectRatio }, containerStyle]}
			className={cn(className, aspectRatio > 1 ? "w-full" : "flex-1")}
		>
			{imgElement}
			{children}
		</View>
	) : (
		imgElement
	)
}

const FallbackImage = () => {
	const fallbackUri =
		"https://lucdn.letsupgrade.net/assets/icon_9021539b17.png"

	return (
		<View
			className="h-full w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-purple-50 dark:bg-purple-950/30"
			style={{ borderRadius: 12 }}
		>
			<View className="relative h-10 w-10 opacity-20">
				{Platform.OS === "web" ? (
					<img
						src={fallbackUri}
						alt="Fallback Image"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "contain",
						}}
					/>
				) : (
					<ExpoImage
						source={{ uri: fallbackUri }}
						style={{ width: "100%", height: "100%" }}
						contentFit="contain"
					/>
				)}
			</View>
		</View>
	)
}
