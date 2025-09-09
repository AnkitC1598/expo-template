import LottieView from "lottie-react-native"
import React, { forwardRef, useImperativeHandle } from "react"
import { StyleSheet, View } from "react-native"

export interface ConfettiRef {
	fire: () => void
}

const Confetti = forwardRef<ConfettiRef>((_, ref) => {
	const confettiRef = React.useRef<LottieView>(null)

	const fire = () => {
		confettiRef.current?.play()
	}

	useImperativeHandle(ref, () => ({
		fire,
	}))

	return (
		<View
			style={[
				StyleSheet.absoluteFill,
				{
					zIndex: 1000,
					pointerEvents: "none",
				},
			]}
		>
			<LottieView
				ref={confettiRef}
				style={{
					width: "100%",
					height: "100%",
				}}
				source={require("@/assets/lottie/confetti.json")}
				autoPlay={false}
				loop={false}
				resizeMode="contain"
			/>
		</View>
	)
})

export default Confetti
