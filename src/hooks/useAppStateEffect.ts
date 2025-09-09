import { useEffect, useRef } from "react"
import { AppState, type AppStateStatus } from "react-native"

type UseAppStateEffectOptions = {
	onColdStart?: (from: "coldStart") => Promise<void> | void
	onForeground?: (from: "foreground") => Promise<void> | void
	onBackground?: (from: "background") => Promise<void> | void
	onError?: (error: unknown) => void
	onFinally?: () => void
}

export type AppStateTrigger = "coldStart" | "foreground" | "background"

const useAppStateEffect = ({
	onColdStart,
	onForeground,
	onBackground,
	onError,
	onFinally,
}: UseAppStateEffectOptions) => {
	const appState = useRef<AppStateStatus>(AppState.currentState)
	const hasRunOnStart = useRef(false)

	const safeRun = async <T extends AppStateTrigger>(
		trigger: T,
		handler?: (trigger: T) => Promise<void> | void
	) => {
		if (!handler) {
			return
		}

		try {
			await handler(trigger)
		} catch (error) {
			onError?.(error)
		} finally {
			onFinally?.()
		}
	}

	useEffect(() => {
		if (!hasRunOnStart.current) {
			hasRunOnStart.current = true
			safeRun("coldStart", onColdStart)
		}

		const handleAppStateChange = (nextAppState: AppStateStatus) => {
			const prevAppState = appState.current

			if (
				nextAppState === "active" &&
				(prevAppState === "background" || prevAppState === "inactive")
			) {
				safeRun("foreground", onForeground)
			}

			if (
				prevAppState === "active" &&
				(nextAppState === "background" || nextAppState === "inactive")
			) {
				safeRun("background", onBackground)
			}

			appState.current = nextAppState
		}

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange
		)

		return () => {
			subscription.remove()
		}
	}, [onColdStart, onForeground, onBackground, onError, onFinally])
}

export default useAppStateEffect
