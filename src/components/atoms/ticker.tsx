import { cn } from "@/lib/utils"
import { MotiView } from "moti"
import { useEffect, useMemo, useRef, useState } from "react"
import { Text, TextProps, View } from "react-native"

const placeholders = ({
	incrementor = 48,
}: {
	incrementor: 48 | 65 | 97
}) =>
	[
		...Array(incrementor === 48 ? 10 : 26).keys(),
		incrementor !== 48 ? 32 - incrementor : null,
	]
		.filter(v => v !== null)
		.map(k => String.fromCharCode(k + incrementor))

// incrementor !== 48 ? " " : null,

const usePrevious = (value: unknown) => {
	const ref = useRef<unknown>(undefined)

	useEffect(() => {
		ref.current = value
	}, [value])
	return ref.current
}

type TickProps = {
	fontSize: number
} & TextProps

interface TickerListProps {
	val: string
	type: "number" | "lowercase" | "uppercase"
	className?: string
	index: number
	fontSize: number
}

interface TickerProps {
	value: number | string
	type?: "number" | "lowercase" | "uppercase"
	className?: string
	fontSize: number
}

const Tick = ({ children, fontSize, style, ...rest }: TickProps) => {
	return (
		<Text
			{...rest}
			style={[
				style,
				{
					height: fontSize,
					fontSize: fontSize,
					lineHeight: fontSize * 1.1,
					fontVariant: ["tabular-nums"],
				},
			]}
		>
			{children}
		</Text>
	)
}

const TickerList = ({
	val,
	type,
	className,
	fontSize,
	index,
}: TickerListProps) => {
	const prevVal = usePrevious(val)

	const incrementor = type === "number" ? 48 : type === "uppercase" ? 65 : 97
	const modifier = type === "number" ? 0 : type === "uppercase" ? 32 : 0
	const position =
		String(val) === " "
			? 27
			: Math.abs(String(val).charCodeAt(0)) - incrementor - modifier

	return (
		<MotiView
			className="items-center overflow-hidden"
			style={{ height: fontSize }}
		>
			<MotiView
				from={{
					translateY:
						-fontSize * (typeof prevVal === "number" ? prevVal : 0),
				}}
				animate={{
					translateY: -fontSize * position,
				}}
				transition={{
					type: "timing",
					duration: 500,
					delay: 80 * index,
				}}
			>
				{placeholders({ incrementor }).map((placeholder, index) => {
					return (
						<Tick
							key={index}
							className={cn("text-center", className)}
							fontSize={fontSize}
						>
							{placeholder}
						</Tick>
					)
				})}
			</MotiView>
		</MotiView>
	)
}

const Ticker = ({
	value,
	type = "number",
	className,
	fontSize,
}: TickerProps) => {
	const valArr = useMemo(() => String(value).split(""), [value])
	const [_adjustedFontSize, setAdjustedFontSize] = useState<number>(fontSize)

	return (
		<View style={{ height: fontSize }}>
			<Tick
				fontSize={fontSize}
				numberOfLines={1}
				adjustsFontSizeToFit
				onTextLayout={e => {
					const ascender = e.nativeEvent.lines?.[0]?.ascender
					if (ascender !== undefined) {
						setAdjustedFontSize(ascender)
					}
				}}
				style={{
					position: "absolute",
					top: 100000,
					left: 100000,
				}}
			>
				{value}
			</Tick>
			<View className="flex-1 flex-row flex-wrap items-center overflow-hidden">
				{valArr.map((val, index) => {
					return (
						<TickerList
							key={`split-${index}`}
							val={val}
							type={type}
							index={index}
							fontSize={fontSize}
							className={className}
						/>
					)
				})}
			</View>
		</View>
	)
}

export default Ticker
