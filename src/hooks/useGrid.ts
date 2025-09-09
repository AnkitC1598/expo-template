import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { Platform } from "react-native"
import usePlatformDimensions from "./usePlatformDimensions"

interface UseGridOptions {
	width?: number
	cols?: number
	gap?: number
	debug?: boolean
}

interface GridItemStyleOptions {
	colspan?: number
}

export interface GridAPI {
	width: number
	cols: number
	gap: number
	itemBaseSize: number
	getItemStyle:
		| (() => { style: {}; classname: string })
		| (({ colspan }?: GridItemStyleOptions) => {
				style: {
					borderColor?: string | undefined
					borderWidth?: number | undefined
					width: number
					minWidth: number
					maxWidth: number
				}
				classname: string
		  })
	getItemWidthOnly: (colspan?: number) => number
}

const useGrid = (props: UseGridOptions = {}): GridAPI => {
	const { width: platformWidth } = usePlatformDimensions()

	const {
		width = platformWidth,
		cols = 2,
		gap = 16,
		debug = false,
	} = props ?? {}

	// Validations
	if (cols <= 0 || !Number.isInteger(cols)) {
		throw new Error("`cols` must be a positive integer.")
	}
	if (gap < 0) {
		throw new Error("`gap` cannot be negative.")
	}
	if (width <= 0 && Platform.OS !== "web") {
		throw new Error("`width` must be a positive number.")
	}

	const totalGapSize = gap * (cols - 1)
	const itemBaseSize = (width - totalGapSize) / cols

	const getItemStyle = useMemo(() => {
		if (Platform.OS === "web") {
			return () => ({
				style: {},
				classname: "",
			})
		}
		return ({ colspan = 1 }: GridItemStyleOptions = {}) => {
			if (!Number.isInteger(colspan) || colspan <= 0) {
				throw new Error("`colspan` must be a positive integer.")
			}

			const safeColspan = Math.min(cols, colspan)
			const widthWithGaps =
				itemBaseSize * safeColspan + gap * (safeColspan - 1)

			return {
				style: {
					width: widthWithGaps,
					minWidth: widthWithGaps,
					maxWidth: widthWithGaps,
					...(debug ? { borderColor: "red", borderWidth: 1 } : {}),
				},
				classname: cn(
					"items-center justify-center text-center",
					debug ? "border border-hairline border-red-500" : ""
				),
			}
		}
	}, [itemBaseSize, cols, gap, debug])

	const getItemWidthOnly = (colspan = 1): number => {
		if (!Number.isInteger(colspan) || colspan <= 0) {
			throw new Error("`colspan` must be a positive integer.")
		}
		const safeColspan = Math.min(cols, colspan)
		return itemBaseSize * safeColspan + gap * (safeColspan - 1)
	}

	return {
		width,
		cols,
		gap,
		itemBaseSize,
		getItemStyle,
		getItemWidthOnly,
	}
}

export default useGrid
