import { useEffect, useState } from "react"
import { Dimensions, Platform } from "react-native"

type DimensionsResult = {
	width: number
	height: number
}

const usePlatformDimensions = ({
	selector = "#window",
	safe = true,
} = {}): DimensionsResult => {
	const getNativeDimensions = () => Dimensions.get("window")

	const getWebDimensions = (): DimensionsResult => {
		if (!selector) {
			return {
				width: window.innerWidth,
				height: window.innerHeight,
			}
		}

		const el = document.querySelector(selector)
		if (!el || !(el instanceof HTMLElement)) {
			return { width: 0, height: 0 }
		}

		const rect = el.getBoundingClientRect()
		return {
			width: rect.width,
			height: rect.height,
		}
	}

	const getDimensions = (): DimensionsResult =>
		Platform.OS === "web" ? getWebDimensions() : getNativeDimensions()

	const [dimensions, setDimensions] =
		useState<DimensionsResult>(getDimensions)

	useEffect(() => {
		const update = () => {
			setDimensions(getDimensions())
		}

		if (Platform.OS === "web") {
			window.addEventListener("resize", update)
			update() // ensure fresh value
			return () => {
				window.removeEventListener("resize", update)
			}
		} else {
			const subscription = Dimensions.addEventListener("change", update)
			return () => {
				subscription.remove()
			}
		}
	}, [selector])

	return {
		width: Math.max(0, dimensions.width - (safe ? 32 : 0)),
		height: dimensions.height,
	}
}

export default usePlatformDimensions
