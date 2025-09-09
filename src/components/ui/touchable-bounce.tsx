import React, { useCallback, useState } from "react"
import {
	Animated,
	StyleProp,
	TouchableWithoutFeedback,
	ViewStyle,
} from "react-native"

interface TouchableBounceProps {
	style?: StyleProp<ViewStyle>
	onPress?: () => void
	disabled?: boolean
	children: React.ReactNode
}

const TouchableBounce = ({
	style,
	onPress,
	disabled = false,
	children,
}: TouchableBounceProps) => {
	const [scale] = useState(new Animated.Value(1))

	const onPressIn = useCallback(() => {
		Animated.spring(scale, {
			toValue: 0.8,
			friction: 5,
			tension: 40,
			useNativeDriver: true,
		}).start()
	}, [])

	const onPressOut = useCallback(() => {
		Animated.spring(scale, {
			toValue: 1,
			friction: 3,
			tension: 40,
			useNativeDriver: true,
		}).start()

		onPress?.()
	}, [onPress])

	const animatedStyle = {
		transform: [{ scale }],
	}

	return (
		<TouchableWithoutFeedback
			style={style}
			onPress={disabled ? onPress : undefined}
			onPressIn={disabled ? undefined : onPressIn}
			onPressOut={disabled ? undefined : onPressOut}
		>
			<Animated.View style={animatedStyle}>{children}</Animated.View>
		</TouchableWithoutFeedback>
	)
}

export default TouchableBounce
