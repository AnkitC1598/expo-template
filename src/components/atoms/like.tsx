import { tailwindToHex } from "@/lib/tailwind"
import { cn } from "@/lib/utils"
import React, { useEffect } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { HeartIcon as HeartOutlineIcon } from "react-native-heroicons/outline"
import { HeartIcon as HeartSolidIcon } from "react-native-heroicons/solid"
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated"

interface LikeProps {
	size?: number
	likes: number
	liked: boolean
	disabled?: boolean
	onLike?: (liked: boolean) => void
	className?: string
}

const Like = ({
	size = 28,
	likes = 0,
	liked = false,
	disabled = false,
	onLike,
	className,
}: LikeProps) => {
	const isLiked = useSharedValue(liked ? 1 : 0)

	const outlineStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: interpolate(
						isLiked.value,
						[0, 2, 1],
						[1, 0],
						Extrapolation.EXTEND
					),
				},
			],
		}
	})

	const fillStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: isLiked.value,
				},
			],
			opacity: isLiked.value,
		}
	})

	const handlePress = () => {
		const newValue = isLiked.value ? 0 : 1

		isLiked.value = withSpring(newValue, {
			damping: 10,
			stiffness: 200,
		})

		onLike?.(!!newValue)
	}

	useEffect(() => {
		isLiked.value = liked ? 1 : 0
	}, [liked])

	return (
		<Pressable
			onPress={handlePress}
			disabled={disabled}
			className={cn("items-center justify-center gap-1", className)}
		>
			<View
				style={{
					height: size,
					width: size,
				}}
			>
				<Animated.View
					className="items-center justify-center"
					style={[StyleSheet.absoluteFillObject, outlineStyle]}
				>
					<HeartOutlineIcon
						size={size}
						color="white"
						strokeWidth={2}
					/>
				</Animated.View>

				<Animated.View
					className="items-center justify-center"
					style={[StyleSheet.absoluteFillObject, fillStyle]}
				>
					<HeartSolidIcon
						size={size}
						color={tailwindToHex("bg-rose-600")}
					/>
				</Animated.View>
			</View>
			<Text className="text-2xs text-neutral-50">{likes}</Text>
		</Pressable>
	)
}

export default Like
