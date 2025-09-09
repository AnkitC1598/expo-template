import React from "react"
import { View, ViewProps } from "react-native"
import { useKeyboardHandler } from "react-native-keyboard-controller"
import Animated, {
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated"

type KeyboardAvoidingViewProps = {
	children: React.ReactNode
	offset?: number
} & ViewProps

const KeyboardAvoidingView = ({
	children,
	offset = 0,
	...props
}: KeyboardAvoidingViewProps) => {
	const { keyboardPadding } = useKeyboardSpacer({ offset: offset })
	return (
		<>
			<View {...props}>
				{children}
				<Animated.View style={keyboardPadding} />
			</View>
		</>
	)
}

export default KeyboardAvoidingView

interface UseKeyboardSpacerProps {
	offset: number
}

export const useKeyboardSpacer = ({ offset }: UseKeyboardSpacerProps) => {
	const height = useSharedValue(0)

	useKeyboardHandler(
		{
			onMove: e => {
				"worklet"
				height.value = e.height > 0 ? e.height + offset : 0
			},
		},
		[offset]
	)

	const keyboardPadding = useAnimatedStyle(() => {
		return {
			height: height.value,
		}
	}, [])

	return { height, keyboardPadding }
}
