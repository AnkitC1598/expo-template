import { cn } from "@/lib/utils"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import * as Haptics from "expo-haptics"
import { Fragment } from "react"
import { Pressable, Text, View } from "react-native"

const BottomTabBar = ({
	state,
	descriptors,
	navigation,
	onTabPress,
}: BottomTabBarProps & {
	onTabPress?: ({ name }: { name: string }) => void
}) => {
	return (
		<View className="flex-row items-center justify-evenly overflow-hidden border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key]

				const additionalOptions =
					(route?.params as { props: any })?.props ?? {}

				if (additionalOptions.hide) {
					return null
				}

				const label = (
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
							? options.title
							: route.name
				) as string
				const icon = (
					options.tabBarIcon ? options.tabBarIcon : () => Fragment
				) as (props: any) => React.ReactNode

				const isSelected = state.index === index

				const onPress = () => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					})

					if (!isSelected && !event.defaultPrevented) {
						onTabPress?.({ name: route.name })
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
						navigation.navigate(route.name, route.params)
					}
				}

				const onLongPress = () => {
					navigation.emit({
						type: "tabLongPress",
						target: route.key,
					})
				}

				return (
					<TabBarItem
						key={route.name}
						{...{
							isSelected,
							onPress,
							onLongPress,
							icon,
							label,
							tabBarShowLabel: options.tabBarShowLabel ?? true,
							options,
						}}
					/>
				)
			})}
		</View>
	)
}

export default BottomTabBar

const TabBarItem = ({
	isSelected,
	tabBarShowLabel,
	onPress,
	onLongPress,
	icon,
	label,
}: {
	isSelected: boolean
	tabBarShowLabel: boolean
	onPress: () => void
	onLongPress: () => void
	icon: (props: any) => React.ReactNode
	label: string
}) => {
	return (
		<Pressable
			onPress={onPress}
			onLongPress={onLongPress}
			className="flex-1 items-center justify-center gap-2 bg-white p-4 dark:bg-neutral-950"
		>
			{icon({
				color: "#000",
				size: 24,
				isSelected,
			})}
			{tabBarShowLabel && (
				<Text
					className={cn(
						"text-xs",
						isSelected
							? "font-bold text-purple-500"
							: "text-neutral-900 dark:text-neutral-200"
					)}
				>
					{label}
				</Text>
			)}
		</Pressable>
	)
}
