import { tailwindToHex } from "@/lib/tailwind"
import { cn } from "@/lib/utils"
import { AntDesign } from "@expo/vector-icons"
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated"

interface ColorProps {
	bg: string
	text: string
	border: string
}

// checked
// 	? "border-purple-900/40 bg-purple-200/40 text-purple-900 dark:border-purple-600/20 dark:bg-purple-400/10 dark:text-purple-400"
// 	: "border-neutral-300 bg-neutral-200/40 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"

type CheckboxProps = {
	label: string
	checked: boolean
	className?: string
	onPress?: () => void
	colors?: {
		active: ColorProps
		inactive: ColorProps
	}
	showCheck?: boolean
}

const TimingConfig = {
	duration: 150,
}

export const Checkbox: React.FC<CheckboxProps> = ({
	label,
	checked,
	className,
	onPress,
	colors,
	showCheck = true,
}) => {
	const DEFAULT_COLORS = {
		active: {
			bg: tailwindToHex("bg-purple-200/40 dark:bg-purple-400/10"),
			text: tailwindToHex("text-purple-900 dark:text-purple-400"),
			border: tailwindToHex(
				"border-purple-900/40 dark:border-purple-600/20"
			),
		},
		inactive: {
			bg: tailwindToHex("bg-neutral-200/40 dark:bg-neutral-900"),
			text: tailwindToHex("text-neutral-700 dark:text-neutral-200"),
			border: tailwindToHex("border-neutral-300 dark:border-neutral-800"),
		},
	}
	const colorProps = Object.assign({}, DEFAULT_COLORS, colors)

	const animatedContainerStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: withTiming(
				checked ? colorProps.active.bg : colorProps.inactive.bg,
				TimingConfig
			),
			borderColor: withTiming(
				checked ? colorProps.active.border : colorProps.inactive.border,
				TimingConfig
			),
			paddingLeft: 16,
			paddingRight: checked && showCheck ? 10 : 16,
		}
	}, [checked])

	const animatedLabelStyle = useAnimatedStyle(() => {
		return {
			color: withTiming(
				checked ? colorProps.active.text : colorProps.inactive.text,
				TimingConfig
			),
		}
	}, [checked])

	return (
		<Animated.View
			layout={LinearTransition.springify().mass(0.8)}
			className={cn(
				"w-fit flex-row items-center gap-2 rounded-md border py-2",
				className
			)}
			style={[animatedContainerStyle]}
			onTouchEnd={onPress}
		>
			<Animated.Text style={[animatedLabelStyle]} className="text-sm">
				{label}
			</Animated.Text>
			{checked && showCheck && (
				<Animated.View
					entering={FadeIn.duration(350)}
					exiting={FadeOut}
					className="flex-row items-center justify-center"
				>
					<AntDesign
						name="checkcircle"
						size={16}
						color={colorProps.active.text}
					/>
				</Animated.View>
			)}
		</Animated.View>
	)
}
