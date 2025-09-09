import { cn } from "@/lib/utils"
import MaskedView from "@react-native-masked-view/masked-view"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useMemo, useState } from "react"
import { type LayoutChangeEvent, Text, View } from "react-native"
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated"

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const repeatColors = (
	colors: string[],
	times = 3,
	reverse = false
): [string, string, ...string[]] => {
	if (colors.length < 2) {
		throw new Error("Must contain at least two colors.")
	}

	const result: string[] = []

	for (let i = 0; i < times; i++) {
		const segment = reverse && i % 2 === 1 ? [...colors].reverse() : colors
		result.push(...segment)
	}

	return result as [string, string, ...string[]]
}

interface GradientTextProps {
	colors?: [string, string, ...string[]]
	text: string
	className?: string
	duration?: number
	animated?: boolean
	mirrorColorsOnRepeat?: boolean
	repeatCount?: number
}

const GradientText = ({
	text,
	className,
	colors = ["#FF0080", "#7928CA", "#FF0080"],
	duration = 3000,
	animated = false,
	mirrorColorsOnRepeat = false,
	repeatCount = 3,
}: GradientTextProps) => {
	const [layout, setLayout] = useState<{
		width: number
		height: number
	} | null>(null)
	const translateX = useSharedValue(0)

	const onLayout = (event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout
		setLayout({ width, height })

		if (animated) {
			translateX.value = withRepeat(
				withTiming(-width, { duration }),
				-1,
				true
			)
		}
	}

	const animatedStyles = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}))

	const gradientColors = useMemo(() => {
		return repeatColors(
			[...new Set(colors)],
			repeatCount,
			mirrorColorsOnRepeat
		)
	}, [colors, mirrorColorsOnRepeat])

	useEffect(() => {
		return () => {
			setLayout(null)
			translateX.value = 0
		}
	}, [])

	if (!layout) {
		return (
			<Text
				className={cn("font-medium opacity-0", className)}
				onLayout={onLayout}
			>
				{text}
			</Text>
		)
	}

	return (
		<MaskedView
			style={{ width: layout.width, height: layout.height }}
			maskElement={
				<View
					style={{ height: layout.height, justifyContent: "center" }}
				>
					<Text className={cn("font-medium", className)}>{text}</Text>
				</View>
			}
		>
			{animated ? (
				<Animated.View
					style={[
						{
							width: layout.width * repeatCount,
							height: layout.height,
						},
						animatedStyles,
					]}
				>
					<AnimatedLinearGradient
						colors={gradientColors}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={{ width: "100%", height: "100%" }}
					/>
				</Animated.View>
			) : (
				<LinearGradient
					colors={gradientColors}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={{ width: layout.width, height: layout.height }}
				/>
			)}
		</MaskedView>
	)
}

export default GradientText
