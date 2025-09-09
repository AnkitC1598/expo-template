import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
	Dimensions,
	type LayoutChangeEvent,
	type LayoutRectangle,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, {
	cancelAnimation,
	clamp,
	FadeInDown,
	interpolate,
	interpolateColor,
	LinearTransition,
	runOnJS,
	runOnUI,
	scrollTo,
	type SharedValue,
	useAnimatedReaction,
	useAnimatedRef,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";

const SPACING = 26;
const ANIMATION_DURATION = 300;

type HeaderLayout = { [key: number]: LayoutRectangle };

const { width } = Dimensions.get("window");

interface TabBarProps {
	tabNames: string[];
	activeHeader: SharedValue<number>;
	variant?: TabIndicatorVariant;
	onTabPress: (tabName: string) => void;
}

const TabBar = ({
	tabNames,
	activeHeader,
	variant = "pill",
	onTabPress,
}: TabBarProps) => {
	const [isVisible, setIsVisible] = useState(false);

	const headerLayout = useRef<HeaderLayout>({});
	const aRef = useAnimatedRef<Animated.ScrollView>();

	const animationId = useRef(0);

	const scrollToIndex = useCallback(async (index: number, animated = true) => {
		animationId.current += 1;
		const currentId = animationId.current;
		await new Promise((res) => setTimeout(res, ANIMATION_DURATION / 2));

		if (currentId !== animationId.current) {
			return;
		}
		activeHeader.value = index;

		runOnUI(scrollTo)(
			aRef,
			headerLayout.current[index]!.x +
				headerLayout.current[index]!.width / 2 -
				width / 2,
			0,
			animated,
		);
	}, []);

	useAnimatedReaction(
		() => activeHeader.value,
		(newIndex, prevIndex) => {
			if (newIndex !== prevIndex) {
				cancelAnimation(activeHeader);
				runOnJS(scrollToIndex)(newIndex, true);
			}
		},
		[scrollToIndex],
	);

	return (
		<>
			<View className="h-full flex-1 gap-4">
				<Animated.ScrollView
					ref={aRef}
					horizontal
					style={{ flexGrow: 0 }}
					contentContainerStyle={{
						paddingHorizontal: SPACING,
						paddingBottom:
							SPACING / 4 + (variant && variant === "pill" ? 8 : 4),
						paddingTop: SPACING / 4,
						// backgroundColor: "#f00",
					}}
					showsHorizontalScrollIndicator={false}
				>
					{tabNames.map((tabName, index) => (
						<TabBarItem
							key={tabName}
							tabName={tabName}
							index={index}
							activeHeader={activeHeader}
							onTabPress={onTabPress}
							onLayout={(event) => {
								headerLayout.current[index] = event.nativeEvent.layout;
								if (
									Object.keys(headerLayout.current).length ===
										tabNames.length &&
									!isVisible
								) {
									setIsVisible(true);
								}
							}}
						/>
					))}
					{isVisible && (
						<TabIndicator
							headerLayout={headerLayout.current}
							activeHeader={activeHeader}
							variant={variant}
						/>
					)}
				</Animated.ScrollView>
			</View>
		</>
	);
};

const MemoizedTabBar = React.memo(TabBar);

export default MemoizedTabBar;

interface TabBarItemProps {
	tabName: string;
	index: number;
	activeHeader: SharedValue<number>;
	onTabPress: (tabName: string) => void;
	onLayout: (event: LayoutChangeEvent) => void;
}

const TabBarItem = ({
	tabName,
	index,
	activeHeader,
	onTabPress,
	onLayout,
}: TabBarItemProps) => {
	return (
		<TouchableOpacity
			key={tabName}
			onPress={async () => {
				if (index === activeHeader.value) {
					return;
				}
				activeHeader.value = index;
				onTabPress(tabName);
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

				await new Promise((res) => {
					setTimeout(res, ANIMATION_DURATION / 2);
				});
			}}
			style={[
				{
					marginRight: SPACING,
				},
			]}
			onLayout={onLayout}
		>
			<View>
				<Text className="items-center justify-center font-medium capitalize">
					{tabName}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

type TabIndicatorVariant = "line" | "pill";

interface TabIndicatorProps {
	headerLayout: HeaderLayout;
	activeHeader: SharedValue<number>;
	variant?: TabIndicatorVariant;
}

const TabIndicator = ({
	headerLayout,
	activeHeader,
	variant,
}: TabIndicatorProps) => {
	const anim = useSharedValue(0);
	const isAnimating = useSharedValue(false);

	useAnimatedReaction(
		() => activeHeader.value,
		(v, oldV) => {
			if (typeof oldV !== "number" || isAnimating.value) {
				return;
			}

			isAnimating.value = true;
			anim.value = 0;
			anim.value = withDelay(
				0,
				withTiming(v > oldV ? 1 : -1, { duration: ANIMATION_DURATION }, () => {
					isAnimating.value = false;
				}),
			);
		},
		[activeHeader],
	);

	const animatedStyle = useAnimatedStyle(() => {
		const itemLayout = headerLayout[activeHeader.value]!;
		const width = clamp(itemLayout.width - SPACING, 20, itemLayout.width);
		const centerX = itemLayout.x + itemLayout.width / 2;
		const topY = itemLayout.y + itemLayout.height;

		switch (variant) {
			case "pill": {
				const horizontalPadding = 24;
				const verticalPadding = 12;

				return {
					position: "absolute",
					left: itemLayout.x - horizontalPadding / 2,
					top: itemLayout.y - verticalPadding / 2,
					width: itemLayout.width + horizontalPadding,
					height: itemLayout.height + verticalPadding,
					backgroundColor: interpolateColor(
						Math.abs(anim.value),
						[0, 0.3, 0.7, 1],
						["#e5e5e580", "#d4d4d480", "#d4d4d480", "#e5e5e580"],
					),
					transform: [
						{
							scaleX: interpolate(
								Math.abs(anim.value),
								[0, 0.95, 1],
								[1, 1.05, 1],
							),
						},
						{
							scaleY: interpolate(
								Math.abs(anim.value),
								[0, 0.95, 1],
								[1, 0.95, 1],
							),
						},
					],
					borderRadius: 100,
					zIndex: -1,
				};
			}
			case "line":
			default:
				return {
					position: "absolute",
					left: centerX - width / 2,
					top: topY + SPACING / 4,
					width,
					height: 4,
					borderRadius: 2,
					backgroundColor: interpolateColor(
						Math.abs(anim.value),
						[0, 0.3, 0.7, 1],
						["#333", "#999", "#999", "#333"],
					),
					transform: [
						{
							scaleX: interpolate(
								Math.abs(anim.value),
								[0, 0.5, 1],
								[1, 2.2, 1],
							),
						},
						{
							scaleY: interpolate(
								Math.abs(anim.value),
								[0, 0.5, 1],
								[1, 0.5, 1],
							),
						},
					],
				};
		}
	}, [activeHeader, headerLayout, variant]);

	return (
		<Animated.View
			layout={LinearTransition}
			entering={FadeInDown.duration(ANIMATION_DURATION)}
			style={animatedStyle}
		/>
	);
};
