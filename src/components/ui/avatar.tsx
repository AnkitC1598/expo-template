import { forwardRef, useState } from "react"
import { View } from "react-native"

import Image from "@/atoms/image"
import { cn } from "@/lib/utils"
import { Image as ExpoImage } from "expo-image"

const Avatar = forwardRef<
	React.ElementRef<typeof View>,
	React.ComponentPropsWithoutRef<typeof View> & {
		squared: boolean
		borderLess: boolean
	}
>(({ className, squared = false, borderLess = false, ...props }, ref) => (
	<View
		ref={ref}
		className={cn(
			"relative flex shrink-0 overflow-hidden",
			squared ? "rounded-md" : "rounded-full",
			borderLess ? "" : "border border-neutral-300/50",
			className
		)}
		{...props}
	/>
))
Avatar.displayName = "Avatar"

const AvatarImage = forwardRef<
	React.ElementRef<typeof ExpoImage>,
	React.ComponentPropsWithoutRef<typeof ExpoImage> & {
		squared: boolean
	}
>(({ className, squared = false, ...props }, ref) => {
	const [hasError, setHasError] = useState(false)

	if (hasError || !props.source) {
		return null
	}
	return (
		<ExpoImage
			ref={ref}
			onError={() => setHasError(true)}
			className={cn("aspect-square h-full w-full", className)}
			// placeholder={{ blurhash }}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 10,
				borderRadius: squared ? 6 : squared ? 6 : 999,
			}}
			{...props}
		/>
	)
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = forwardRef<
	React.ElementRef<typeof View>,
	React.ComponentPropsWithoutRef<typeof View> & {
		alt: string
		squared: boolean
	}
>(({ className, alt, squared = false, ...props }, ref) => (
	<View
		ref={ref}
		className={cn(
			"flex h-full w-full items-center justify-center",
			className
		)}
		{...props}
	>
		<Image
			source={`https://api.dicebear.com/9.x/glass/png?seed=${alt}`}
			alt={alt}
			contentFit="cover"
			style={{ borderRadius: squared ? 6 : 99 }}
		/>
	</View>
))
AvatarFallback.displayName = "AvatarFallback"

export { AvatarFallback, AvatarImage, Avatar as default }
