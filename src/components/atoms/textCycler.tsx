import { cn } from "@/lib/utils"
import { AnimatePresence, MotiView } from "moti"
import React, { useEffect, useState } from "react"
import { Text, View } from "react-native"

const flipVariants = {
	hidden: {
		rotateX: "90deg",
		opacity: 0,
		translateY: 22,
	},
	visible: {
		rotateX: "0deg",
		opacity: 1,
		translateY: 0,
	},
	exit: {
		rotateX: "-90deg",
		opacity: 0,
		translateY: -22,
	},
}

const TextCycler = ({
	elements = ["Animate Text Flip", "With Moti", "And React Native"],
	delay = 2000,
	containerHeight = 40,
	containerClassName = "",
	textClassName = "",
}: {
	elements?: string[] | React.ReactNode[]
	delay?: number
	containerHeight?: number
	containerClassName?: string
	textClassName?: string
}) => {
	const [currentIdx, setCurrentIdx] = useState<number>(0)

	useEffect(() => {
		if (elements.length === 1) {
			return
		}

		const interval = setInterval(() => {
			setCurrentIdx(prev => (prev + 1) % elements.length)
		}, delay)

		return () => {
			setCurrentIdx(0)
			clearInterval(interval)
		}
	}, [delay, elements.length])

	return (
		<View
			style={[
				{
					height: containerHeight,
				},
			]}
			className={cn(
				"w-full items-center justify-center overflow-hidden",
				containerClassName
			)}
		>
			<AnimatePresence>
				<MotiView
					key={currentIdx}
					from={flipVariants.hidden}
					animate={flipVariants.visible}
					exit={flipVariants.exit}
					transition={{
						type: "timing",
						duration: 500,
					}}
					style={[
						{
							height: containerHeight,
						},
					]}
					className="absolute items-center justify-center"
				>
					<Text
						className={cn(
							"text-center font-medium text-xs",
							textClassName
						)}
					>
						{elements[currentIdx]}
					</Text>
				</MotiView>
			</AnimatePresence>
		</View>
	)
}

export default TextCycler
