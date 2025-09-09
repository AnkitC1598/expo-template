import { cn, getType } from "@/lib/utils"
import * as Clipboard from "expo-clipboard"
import React, { JSX } from "react"
import { Alert, ScrollView, Text, View } from "react-native"

const INDENT = 4

export const TypeColor = {
	string: "text-red-500",
	number: "text-green-600",
	boolean: "text-blue-700",
	undefined: "text-neutral-400",
	null: "text-neutral-700",
	object: "text-emerald-600",
	array: "text-sky-500",
	date: "text-violet-500",
	regexp: "text-amber-600",
	set: "text-orange-500",
} as const

type TypeColorKey = keyof typeof TypeColor

export const getSize = (
	value: unknown,
	prototypeType: TypeColorKey
): number | null =>
	Array.isArray(value)
		? value.length
		: value instanceof Map || value instanceof Set
			? value.size
			: prototypeType === "object" &&
					value !== null &&
					typeof value === "object"
				? Object.keys(value as object).length
				: null

export const copyToClipboard = async (key: string, value: unknown) => {
	const stringValue = JSON.stringify(value, null, 4)
	Alert.alert(key, stringValue, [
		{
			text: "Copy",
			onPress: async () => await Clipboard.setStringAsync(stringValue),
		},
		{ text: "OK" },
	])
}

export const renderPrimitive = (
	key: string,
	value: unknown,
	level: number,
	prototypeType: TypeColorKey
): JSX.Element => {
	const displayValue =
		key === "value" &&
		((typeof value === "string" && !isNaN(Date.parse(value))) ||
			(typeof value === "number" && !isNaN(new Date(value).getTime())))
			? new Date(value).toLocaleString()
			: value instanceof Date
				? value.toLocaleString()
				: value instanceof RegExp
					? value.toString()
					: String(value)

	return (
		<View
			key={key}
			className="flex-row items-start gap-1"
			style={{ marginLeft: level * INDENT }}
		>
			<View className="flex-row items-center gap-1">
				<Text
					className={cn(
						"text-neutral-800",
						level === 0
							? "font-extrabold text-base"
							: "font-bold text-xs"
					)}
				>
					{key}:
				</Text>
				<Text
					className={cn(
						"text-2xs leading-4",
						TypeColor[prototypeType]
					)}
				>
					{prototypeType}
				</Text>
			</View>
			<Text
				className="text-neutral-600 text-xs"
				onPress={() => copyToClipboard(key, displayValue)}
			>
				{displayValue}
			</Text>
		</View>
	)
}

export const renderObject = (
	key: string,
	value: unknown,
	level: number,
	prototypeType: TypeColorKey,
	renderJSON: (data: Record<string, unknown>, level?: number) => JSX.Element[]
): JSX.Element => {
	let processedValue: Record<string, unknown>

	if (value instanceof Map) {
		processedValue = Object.fromEntries(value)
	} else if (value instanceof Set) {
		processedValue = Object.fromEntries(
			Array.from(value).map((v, i) => [i.toString(), v])
		)
	} else if (value !== null && typeof value === "object") {
		processedValue = value as Record<string, unknown>
	} else {
		processedValue = {}
	}

	const prototypeSize = getSize(value, prototypeType)

	return (
		<ScrollView
			horizontal
			key={key}
			contentContainerClassName="flex flex-col"
			style={{ marginLeft: level * INDENT }}
		>
			<View className="flex-row items-center gap-1">
				<Text
					className={cn(
						"text-neutral-800",
						level === 0
							? "font-extrabold text-base"
							: "font-bold text-xs"
					)}
					onPress={() => copyToClipboard(key, value)}
				>
					{key}
				</Text>
				<Text
					className={cn(
						"text-2xs leading-4",
						TypeColor[prototypeType]
					)}
				>
					{prototypeType} {prototypeSize && `[${prototypeSize}]`}
				</Text>
			</View>
			{renderJSON(processedValue, level + 1)}
		</ScrollView>
	)
}

export const renderJSON = (
	data: Record<string, unknown>,
	level: number = 0
): JSX.Element[] => {
	if (!data) {
		return []
	}

	return Object.entries(data).map(([key, value]) => {
		const prototypeType = getType(value) as TypeColorKey

		return ["object", "array", "set"].includes(prototypeType) &&
			value !== null
			? renderObject(key, value, level, prototypeType, renderJSON)
			: renderPrimitive(key, value, level, prototypeType)
	})
}
