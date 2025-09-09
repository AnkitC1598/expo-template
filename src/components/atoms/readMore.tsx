import { cn } from "@/lib/utils"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { type LayoutChangeEvent, Text, View } from "react-native"
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated"

interface ReadMoreProps {
	numberOfLines: number
	text: string
	className?: string
	alignClass?: string
	onReady?: () => void
	renderTruncatedFooter?: (handlePress: () => void) => React.ReactNode
	renderRevealedFooter?: (handlePress: () => void) => React.ReactNode
}

const ReadMore: React.FC<ReadMoreProps> = ({
	numberOfLines,
	text,
	alignClass,
	className,
	onReady,
	renderTruncatedFooter,
	renderRevealedFooter,
}) => {
	const [isMeasured, setIsMeasured] = useState(false)
	const [shouldShowReadMore, setShouldShowReadMore] = useState(false)
	const [isTextExpanded, setIsTextExpanded] = useState(false)
	const textComponentRef = useRef<Text>(null)
	const isComponentMounted = useRef(true)
	const fullHeight = useRef(0)

	const animatedHeight = useSharedValue(0)

	useEffect(() => {
		const measureText = async () => {
			if (!isComponentMounted.current) {
				return
			}

			// Wait for the next frame to ensure the text is rendered
			await nextFrameAsync()

			if (!isComponentMounted.current) {
				return
			}

			// Measure the full height of the text without any numberOfLines restriction
			const fullHeightValue = await measureHeightAsync(
				textComponentRef.current!
			)
			fullHeight.current = fullHeightValue

			setIsMeasured(true)
			// Wait for the next frame to re-render with numberOfLines restriction
			await nextFrameAsync()

			if (!isComponentMounted.current) {
				return
			}

			// Measure the height with numberOfLines restriction
			const restrictedHeight = await measureHeightAsync(
				textComponentRef.current!
			)

			if (fullHeight.current > restrictedHeight) {
				setShouldShowReadMore(true)
			} else {
				setShouldShowReadMore(false)
				animatedHeight.value = withTiming(fullHeight.current, {
					duration: 300,
				})
			}

			if (onReady) {
				onReady()
			}

			animatedHeight.value = withTiming(restrictedHeight, {
				duration: 300,
			})
		}

		measureText()

		return () => {
			isComponentMounted.current = false
		}
	}, [onReady, animatedHeight])

	const expandText = () => {
		setIsTextExpanded(true)
		animatedHeight.value = withTiming(fullHeight.current, { duration: 300 })
	}

	const collapseText = () => {
		setIsTextExpanded(false)
		animatedHeight.value = withTiming(numberOfLines * 18, { duration: 300 }) // Assuming average 18 px per line height
	}

	const renderReadMoreOrLessButton = () => {
		if (shouldShowReadMore && !isTextExpanded) {
			if (renderTruncatedFooter) {
				return renderTruncatedFooter(expandText)
			}

			return (
				<Text
					className={cn("text-orange-400 text-xs", alignClass)}
					onPress={expandText}
				>
					Read more
				</Text>
			)
		} else if (shouldShowReadMore && isTextExpanded) {
			if (renderRevealedFooter) {
				return renderRevealedFooter(collapseText)
			}

			return (
				<Text
					className={cn("text-orange-400 text-xs", alignClass)}
					onPress={collapseText}
				>
					Read less
				</Text>
			)
		}
	}

	const _animatedStyle = useAnimatedStyle(() => {
		return {
			height: animatedHeight.value,
		}
	})

	// console.log(
	// 	JSON.stringify(
	// 		{
	// 			isMeasured,
	// 			isTextExpanded,
	// 			numberOfLines,
	// 			text,
	// 			no: isMeasured && !isTextExpanded ? numberOfLines : 0,
	// 			animatedHeight: animatedHeight.value,
	// 			h: numberOfLines * 18,
	// 			fullHeight: fullHeight.current,
	// 		},
	// 		null,
	// 		4
	// 	)
	// )

	return (
		<View className="gap-1">
			<Animated.View style={[{ overflow: "hidden" }]}>
				<Text
					numberOfLines={
						isMeasured && !isTextExpanded
							? numberOfLines
							: undefined
					}
					ref={textComponentRef}
					onLayout={handleLayoutChange}
					className={className}
				>
					{text}
				</Text>
			</Animated.View>
			{renderReadMoreOrLessButton()}
		</View>
	)
}

const measureHeightAsync = (component: Text) => {
	return new Promise<number>(resolve => {
		component.measure((_x, _y, _w, h) => {
			resolve(h)
		})
	})
}

const nextFrameAsync = () => {
	return new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

const handleLayoutChange = (event: LayoutChangeEvent) => {
	const { height } = event.nativeEvent.layout
	return height
}

export default ReadMore
