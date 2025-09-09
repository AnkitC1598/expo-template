import { useEffect, useRef } from "react"
import { Animated, Easing, View } from "react-native"

import { cn } from "@/lib/utils"

const Skeleton = ({
	className,
	...props
}: { className?: string } & React.ComponentPropsWithoutRef<typeof View>) => {
	const fadeAnim = useRef(new Animated.Value(0.5)).current

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 1000,
					easing: Easing.bezier(0.4, 0, 0.6, 1),
					useNativeDriver: true,
				}),
				Animated.timing(fadeAnim, {
					toValue: 0.5,
					duration: 1000,
					easing: Easing.bezier(0.4, 0, 0.6, 1),
					useNativeDriver: true,
				}),
			])
		).start()
	}, [fadeAnim])

	return (
		<Animated.View
			className={cn(
				"h-4 rounded-full bg-neutral-200 dark:bg-neutral-800",
				className
			)}
			style={[{ opacity: fadeAnim }]}
			{...props}
		/>
	)
}

export default Skeleton
