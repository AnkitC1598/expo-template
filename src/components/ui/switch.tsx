import { COLORS } from "@/theme/colors"
import { Switch as NativeSwitch, useColorScheme } from "react-native"

const Switch = ({
	trackColor,
	thumbColor,
	ios_backgroundColor,
	...props
}: React.ComponentPropsWithoutRef<typeof NativeSwitch>) => {
	const isDark = useColorScheme() === "dark"

	const currentTheme = isDark ? theme.dark : theme.light

	const trackColorProps = {
		false: trackColor?.false || currentTheme.background,
		true: trackColor?.true || currentTheme.foreground,
	}
	const thumbColorProps = thumbColor || currentTheme.foreground
	const iosBackgroundColorProps = ios_backgroundColor || trackColorProps.false

	return (
		<NativeSwitch
			trackColor={trackColorProps}
			thumbColor={thumbColorProps}
			ios_backgroundColor={iosBackgroundColorProps}
			{...props}
		/>
	)
}

export default Switch

// Use global theming or fallback to inline themes
const theme = {
	light: {
		background: COLORS?.light?.grey || "#737373",
		foreground: COLORS?.light?.primary || "#ffffff",
	},
	dark: {
		background: COLORS?.dark?.grey || "#737373",
		foreground: COLORS?.dark?.primary || "#ffffff",
	},
}
