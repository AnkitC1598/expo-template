import { tailwindToHex } from "@/lib/tailwind"
import { cn } from "@/lib/utils"
import { SetState } from "@/types"
import { FontAwesome } from "@expo/vector-icons"
import React, { createContext, useContext, useEffect, useState } from "react"
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native"
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated"

interface AccordionContextType {
	type: "single" | "multiple"
	expandedItem: string | string[] | null
	setExpandedItem: SetState<string | string[] | null>
}

const AccordionContext = createContext<AccordionContextType | undefined>(
	undefined
)

export const Accordion: React.FC<
	React.ComponentProps<typeof View> & {
		defaultValue?: string
		type?: "single" | "multiple"
		className?: string
	}
> = ({ children, defaultValue, type = "single", className, ...props }) => {
	const [expandedItem, setExpandedItem] = useState<
		AccordionContextType["expandedItem"]
	>(defaultValue ?? null)
	return (
		<AccordionContext.Provider
			value={{ type, expandedItem, setExpandedItem }}
		>
			<View className={cn("gap-4", className)} {...props}>
				{children}
			</View>
		</AccordionContext.Provider>
	)
}

export const useAccordion = ({
	id,
}: {
	id: string
}): AccordionContextType & { isExpanded: boolean } => {
	const context = useContext(AccordionContext)

	if (!context) {
		throw new Error("useAccordion must be used within an AccordionProvider")
	}
	const isExpanded = context.expandedItem
		? context.type === "single"
			? context.expandedItem === id
			: context.expandedItem.includes(id)
		: false

	return { ...context, isExpanded }
}

export const AccordionItem: React.FC<
	React.ComponentProps<typeof View> & {
		id: string
		className?: string
	}
> = ({ children, id, className, ...props }) => {
	return (
		<View
			className={cn(
				"rounded-md border border-neutral-200 shadow-md dark:border-neutral-800",
				className
			)}
			{...props}
		>
			{children}
		</View>
	)
}

export const AccordionTrigger: React.FC<
	React.ComponentProps<typeof View> & {
		id: string
		className?: string
	}
> = ({ id, children, className, ...props }) => {
	const { isExpanded, setExpandedItem, type } = useAccordion({ id })

	const rotation = useSharedValue(0)

	const handlePress = () => {
		setExpandedItem((prev: AccordionContextType["expandedItem"]) => {
			if (type === "single") {
				return isExpanded ? null : id
			}

			if (!Array.isArray(prev)) {
				return [id]
			}

			return prev.includes(id)
				? prev.filter(item => item !== id)
				: [...prev, id]
		})
	}

	useEffect(() => {
		rotation.value = withSpring(isExpanded ? 1 : 0, {
			damping: 50,
			stiffness: 100,
		})
	}, [isExpanded])

	const animatedIconStyle = useAnimatedStyle(() => {
		return {
			transform: [{ rotate: `${rotation.value * 180}deg` }],
		}
	})

	return (
		<TouchableOpacity onPress={handlePress} activeOpacity={1}>
			<Animated.View
				className="flex-row items-center justify-between gap-4 p-4"
				{...props}
			>
				{children}
				<Animated.View style={[animatedIconStyle]}>
					<FontAwesome
						name="chevron-down"
						size={16}
						opacity={0.75}
						color={tailwindToHex(
							"text-neutral-900 dark:text-neutral-200"
						)}
					/>
				</Animated.View>
			</Animated.View>
		</TouchableOpacity>
	)
}

export const AccordionContent: React.FC<
	React.ComponentProps<typeof View> & {
		id: string
		className?: string
	}
> = ({ id, children, className, ...props }) => {
	const { isExpanded } = useAccordion({ id })
	const [height, setHeight] = useState(0)
	const animatedHeight = useSharedValue(0)
	const paddingTop = useSharedValue(0)

	const onLayout = (event: LayoutChangeEvent) => {
		const onLayoutHeight = event.nativeEvent.layout.height
		if (onLayoutHeight > 0 && height !== onLayoutHeight) {
			setHeight(onLayoutHeight)
		}
	}

	useEffect(() => {
		animatedHeight.value = withSpring(isExpanded ? height : 0, {
			damping: 50,
			stiffness: 100,
		})
		paddingTop.value = withSpring(isExpanded ? 16 : 0, {
			damping: 50,
			stiffness: 100,
		})
	}, [height, isExpanded])

	const collapsibleStyle = useAnimatedStyle(() => {
		return {
			height: animatedHeight.value,
			paddingTop: paddingTop.value,
		}
	})

	return (
		<Animated.View style={[collapsibleStyle, { overflow: "hidden" }]}>
			<View
				className={cn(
					"absolute right-0 left-0 flex-1 gap-4 px-4 pb-4",
					className
				)}
				onLayout={onLayout}
				{...props}
			>
				{children}
			</View>
		</Animated.View>
	)
}
