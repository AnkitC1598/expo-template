import { Picker as RNPicker } from "@react-native-picker/picker"
import { View } from "react-native"

import { useColorScheme } from "@/hooks/useColorScheme"
import { cn } from "@/lib/utils"

export function Picker<T>({
	mode = "dropdown",
	style,
	dropdownIconColor,
	dropdownIconRippleColor,
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof RNPicker<T>>) {
	const { colors } = useColorScheme()
	return (
		<View
			className={cn(
				"rounded-md border border-background bg-background ios:shadow-black/5 ios:shadow-sm",
				className
			)}
		>
			<RNPicker
				mode={mode}
				style={
					style ?? {
						backgroundColor: colors.root,
						borderRadius: 8,
					}
				}
				dropdownIconColor={dropdownIconColor ?? colors.foreground}
				dropdownIconRippleColor={
					dropdownIconRippleColor ?? colors.foreground
				}
				{...props}
			/>
		</View>
	)
}

export const PickerItem = RNPicker.Item
