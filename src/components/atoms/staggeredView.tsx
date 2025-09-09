import type { ViewProps } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const StaggeredView = ({
	index,
	children,
	...props
}: {
	index: number;
} & ViewProps) => {
	return (
		<Animated.View
			entering={FadeInUp.delay(100 * index).duration(300)}
			{...props}
		>
			{children}
		</Animated.View>
	);
};

export default StaggeredView;
