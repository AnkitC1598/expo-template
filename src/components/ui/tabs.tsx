import * as Haptics from "expo-haptics"
import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import {
	Dimensions,
	FlatList,
	LayoutRectangle,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import Animated, {
	FadeInDown,
	LinearTransition,
	SharedValue,
	interpolate,
	interpolateColor,
	runOnJS,
	runOnUI,
	scrollTo,
	useAnimatedReaction,
	useAnimatedRef,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated"

const SPACING = 26

type HeaderLayout = { [key: number]: LayoutRectangle }
type TabIndicatorVariant = "line" | "pill"

interface TabsProps {
	tabs: Record<string, ReactNode>
	initialIndex?: number
	animationDuration?: number
	onIndexChange?: (index: number) => void
	variant?: TabIndicatorVariant
}

const clamp = (n: number, min: number, max: number) => {
	"worklet"
	return Math.max(Math.min(n, max), min)
}

const TabIndicator = ({
	headerLayout,
	activeHeader,
	animationDuration = 300,
	variant,
}: {
	headerLayout: HeaderLayout
	activeHeader: SharedValue<number>
	animationDuration?: number
	variant?: TabIndicatorVariant
}) => {
	const anim = useSharedValue(0)

	useAnimatedReaction(
		() => activeHeader.value,
		(v, oldV) => {
			if (typeof oldV !== "number") {
				return
			}
			anim.value = 0
			anim.value = withDelay(
				0,
				withTiming(v > oldV ? 1 : -1, { duration: animationDuration })
			)
		},
		[activeHeader]
	)

	const animatedStyle = useAnimatedStyle(() => {
		const itemLayout = headerLayout[activeHeader.value]!
		const width = clamp(itemLayout.width - SPACING, 20, itemLayout.width)
		const centerX = itemLayout.x + itemLayout.width / 2
		const topY = itemLayout.y + itemLayout.height

		switch (variant) {
			case "pill": {
				const horizontalPadding = 24
				const verticalPadding = 12

				return {
					position: "absolute",
					left: itemLayout.x - horizontalPadding / 2,
					top: itemLayout.y - verticalPadding / 2,
					width: itemLayout.width + horizontalPadding,
					height: itemLayout.height + verticalPadding,
					backgroundColor: interpolateColor(
						Math.abs(anim.value),
						[0, 0.3, 0.7, 1],
						["#e5e5e580", "#d4d4d480", "#d4d4d480", "#e5e5e580"]
					),
					transform: [
						{
							scaleX: interpolate(
								Math.abs(anim.value),
								[0, 0.95, 1],
								[1, 1.05, 1]
							),
						},
						{
							scaleY: interpolate(
								Math.abs(anim.value),
								[0, 0.95, 1],
								[1, 0.95, 1]
							),
						},
					],
					borderRadius: 100,
					zIndex: -1,
				}
			}
			case "line":
			default:
				return {
					position: "absolute",
					left: centerX - width / 2,
					top: topY + SPACING / 4,
					width,
					height: 4,
					borderRadius: 2,
					backgroundColor: interpolateColor(
						Math.abs(anim.value),
						[0, 0.3, 0.7, 1],
						["#333", "#999", "#999", "#333"]
					),
					transform: [
						{
							scaleX: interpolate(
								Math.abs(anim.value),
								[0, 0.5, 1],
								[1, 2.2, 1]
							),
						},
						{
							scaleY: interpolate(
								Math.abs(anim.value),
								[0, 0.5, 1],
								[1, 0.5, 1]
							),
						},
					],
				}
		}
	})

	return (
		<Animated.View
			layout={LinearTransition}
			entering={FadeInDown.duration(animationDuration)}
			style={animatedStyle}
		/>
	)
}

const TabHeader = ({
	width,
	labels,
	onChange,
	activeHeader,
	animationDuration = 300,
	variant,
}: {
	width: number
	labels: string[]
	onChange: (index: number) => void
	activeHeader: SharedValue<number>
	animationDuration?: number
	variant?: TabIndicatorVariant
}) => {
	const headerLayout = useRef<HeaderLayout>({})
	const [isVisible, setIsVisible] = useState(false)
	const aRef = useAnimatedRef<Animated.ScrollView>()

	const scrollToIndex = useCallback(
		async (index: number, animated = true) => {
			await new Promise(res => setTimeout(res, animationDuration / 2))
			activeHeader.value = index

			runOnUI(scrollTo)(
				aRef,
				headerLayout.current[index]!.x +
					headerLayout.current[index]!.width / 2 -
					width / 2,
				0,
				animated
			)
		},
		[]
	)

	useAnimatedReaction(
		() => activeHeader.value,
		(newIndex, prevIndex) => {
			if (newIndex !== prevIndex) {
				runOnJS(scrollToIndex)(newIndex, true)
			}
		},
		[scrollToIndex]
	)

	return (
		<Animated.ScrollView
			ref={aRef}
			horizontal
			style={{ flexGrow: 0 }}
			contentContainerStyle={{
				paddingHorizontal: SPACING,
				paddingBottom:
					SPACING / 4 + (variant && variant === "pill" ? 0 : 4),
				paddingTop: SPACING / 4,
				// backgroundColor: "#f00",
			}}
			showsHorizontalScrollIndicator={false}
		>
			{labels.map((label, index) => (
				<TouchableOpacity
					key={label}
					onPress={async () => {
						if (index === activeHeader.value) {
							return
						}
						activeHeader.value = index
						onChange(index)
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

						await new Promise(res => {
							setTimeout(res, animationDuration / 2)
						})
					}}
					style={{
						marginRight: SPACING,
					}}
					onLayout={ev => {
						headerLayout.current[index] = ev.nativeEvent.layout
						if (
							Object.keys(headerLayout.current).length ===
								labels.length &&
							!isVisible
						) {
							setIsVisible(true)
						}
					}}
				>
					<View>
						<Text className="font-medium capitalize">
							{label.replaceAll("_", " ")}
						</Text>
					</View>
				</TouchableOpacity>
			))}
			{isVisible && (
				<TabIndicator
					headerLayout={headerLayout.current}
					activeHeader={activeHeader}
					animationDuration={animationDuration}
					variant={variant}
				/>
			)}
		</Animated.ScrollView>
	)
}

const Tabs = ({
	tabs,
	initialIndex = 0,
	animationDuration = 300,
	onIndexChange,
	variant = "line",
}: TabsProps) => {
	const labels = Object.keys(tabs)
	const screens = Object.values(tabs)
	const activeHeader = useSharedValue(initialIndex)
	const ref = useRef<FlatList>(null)
	const [width, setWidth] = useState(Dimensions.get("window").width)
	const [layoutReady, setLayoutReady] = useState(false)

	useEffect(() => {
		if (layoutReady && ref.current) {
			setTimeout(() => {
				ref.current?.scrollToIndex({
					index: initialIndex,
					animated: false,
				})
			}, 0)
		}
	}, [layoutReady, initialIndex])

	return (
		<View
			className="h-full flex-1 gap-4"
			onLayout={e => {
				setWidth(e.nativeEvent.layout.width)
				setLayoutReady(true)
			}}
		>
			<TabHeader
				width={width}
				labels={labels}
				activeHeader={activeHeader}
				onChange={index => {
					onIndexChange?.(index)
					ref.current?.scrollToIndex({ index, animated: true })
				}}
				animationDuration={animationDuration}
				variant={variant}
			/>

			<FlatList
				ref={ref}
				data={screens}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				keyExtractor={(_, i) => `screen_${i}`}
				onMomentumScrollEnd={ev => {
					const index = Math.round(
						ev.nativeEvent.contentOffset.x / width
					)
					activeHeader.value = index
					onIndexChange?.(index)
				}}
				getItemLayout={(_, index) => ({
					length: width,
					offset: index * width,
					index,
				})}
				renderItem={({ item: screen }) => (
					<View style={{ width, flex: 1 }}>
						<ScrollView
							style={{ flex: 1 }}
							contentContainerStyle={{ minHeight: "100%" }}
							showsVerticalScrollIndicator={false}
							nestedScrollEnabled
							keyboardShouldPersistTaps="handled"
						>
							{screen}
						</ScrollView>
					</View>
				)}
			/>
		</View>
	)
}

export default Tabs
