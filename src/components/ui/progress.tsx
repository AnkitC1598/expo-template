import { useEffect, useRef } from "react"
import { Animated, View } from "react-native"

import { cn } from "@/lib/utils"

const Progress = ({
	className,
	progressClassName,
	value,
	animated = true,
	animationDuration = 1500,
}: {
	className?: string
	progressClassName?: string
	value: number
	animated?: boolean
	animationDuration?: number
} & React.ComponentPropsWithoutRef<typeof View>) => {
	const widthAnim = useRef(new Animated.Value(0)).current

	useEffect(() => {
		if (value === 0) {
			widthAnim.setValue(0)
		} else {
			Animated.timing(widthAnim, {
				toValue: value,
				duration: animated ? animationDuration : 0,
				useNativeDriver: false,
			}).start()
		}
	}, [widthAnim, value, animated])

	return (
		<View
			className={cn(
				"h-4 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700",
				className
			)}
		>
			<Animated.View
				className={cn(
					"h-full rounded-full bg-black",
					progressClassName
				)}
				style={{
					width: widthAnim.interpolate({
						inputRange: [0, 100],
						outputRange: ["0%", "100%"],
					}),
				}}
			/>
		</View>
	)
}

export default Progress
