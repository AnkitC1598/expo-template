import { produce } from "immer"
import { AnimatePresence, MotiView } from "moti"
import React, { useEffect } from "react"
import { Text, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import {
	BellIcon,
	CheckCircleIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from "react-native-heroicons/solid"
import Animated, {
	LinearTransition,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { create } from "zustand"

export type ToastType = "success" | "info" | "warning" | "error" | "default"

export interface ToastT {
	id: string
	message: string
	type: ToastType
	duration?: number
	onClose?: () => void
	autoClose?: boolean
	removing?: boolean
}

export interface ToasterProps {
	duration?: number
	maxToast?: number
	animateAppearance?: boolean
}

const Toaster = ({
	duration = 4000,
	maxToast = 1,
	animateAppearance = false,
}: ToasterProps) => {
	const insets = useSafeAreaInsets()
	const { toasts, setConfig } = useToast()

	useEffect(() => {
		setConfig({ duration, maxToast })
	}, [duration, maxToast])

	console.log(JSON.stringify(toasts, null, 4))

	return (
		<View
			className="absolute inset-0 h-screen w-screen"
			style={[
				{
					paddingTop: insets.top,
					paddingBottom: insets.bottom,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				},
			]}
		>
			<View className="h-full w-full gap-4 p-4">
				<AnimatePresence>
					{toasts.map(
						toast =>
							!toast.removing && (
								<ToastItem
									key={toast.id}
									toast={toast}
									animateAppearance={animateAppearance}
								/>
							)
					)}
				</AnimatePresence>
			</View>
		</View>
	)
}

export default Toaster

const getToastConfig = (type: ToastType) => {
	const configMap = {
		success: {
			containerStyle: {
				backgroundColor: "#e6fcef",
				borderColor: "#baf6d0",
			},
			textStyle: { color: "#007a2f" },
			icon: <CheckCircleIcon size={24} color="#007a2f" />,
		},
		info: {
			containerStyle: {
				backgroundColor: "#f0f8ff",
				borderColor: "#d7e3fc",
			},
			textStyle: { color: "#0077cc" },
			icon: <InformationCircleIcon size={24} color="#0077cc" />,
		},
		warning: {
			containerStyle: {
				backgroundColor: "#fffee0",
				borderColor: "#f7e9b8",
			},
			textStyle: { color: "#b85000" },
			icon: <ExclamationTriangleIcon size={24} color="#b85000" />,
		},
		error: {
			containerStyle: {
				backgroundColor: "#ffeff0",
				borderColor: "#ffdadc",
			},
			textStyle: { color: "#ff2e2e" },
			icon: <ExclamationCircleIcon size={24} color="#ff2e2e" />,
		},
		default: {
			containerStyle: {
				backgroundColor: "#ffffff",
				borderColor: "#0f172a14",
			},
			textStyle: { color: "#000000" },
			icon: <BellIcon size={24} color="#000000" />,
		},
	}

	return configMap[type] || configMap.default
}

const ToastItem = ({
	toast,
	animateAppearance,
}: {
	toast: ToastT
	animateAppearance: boolean
}) => {
	const removeToast = useToast(store => store.removeToast)

	const { containerStyle, textStyle, icon: Icon } = getToastConfig(toast.type)

	const translateX = useSharedValue(0)

	const swipeGesture = Gesture.Pan()
		.onUpdate(event => {
			translateX.value = event.translationX
		})
		.onEnd(event => {
			if (Math.abs(event.translationX) > 100) {
				translateX.value = withSpring(
					500 * Math.sign(event.translationX),
					{},
					() => {
						runOnJS(removeToast)(toast.id)
					}
				)
			} else {
				translateX.value = withSpring(0)
			}
		})

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}))

	return (
		<GestureDetector gesture={swipeGesture}>
			<Animated.View style={animatedStyle}>
				<MotiView
					layout={LinearTransition.springify()
						.damping(15)
						.stiffness(200)}
					from={{ opacity: 0, scale: 0 }}
					animate={{ opacity: 1, scale: 1 }}
					{...(animateAppearance && {
						exit: { opacity: 0, scale: 0 },
					})}
					transition={{ type: "spring", damping: 15, stiffness: 200 }}
					style={[{ transformOrigin: "top center" }]}
					className="self-center"
				>
					<MotiView
						{...(animateAppearance && {
							from: { borderRadius: 50 },
							exit: { borderRadius: 50 },
							transition: {
								delay: 500,
								type: "spring",
								damping: 15,
							},
						})}
						animate={{ borderRadius: 12 }}
						className="w-full flex-row items-center gap-4 overflow-hidden border p-4"
						style={containerStyle}
					>
						{Icon}

						<MotiView
							{...(animateAppearance && {
								from: { opacity: 0, position: "absolute" },
								transition: {
									delay: 500,
									type: "spring",
									damping: 15,
									stiffness: 200,
								},
							})}
							animate={{ opacity: 1, position: "relative" }}
							style={{ overflow: "hidden", flex: 1 }}
						>
							<Text style={textStyle}>{toast.message}</Text>
						</MotiView>
					</MotiView>
				</MotiView>
			</Animated.View>
		</GestureDetector>
	)
}

interface ToastStore {
	toasts: ToastT[]
	duration: number
	maxToast: number
	setConfig: (config: Partial<ToasterProps>) => void
	addToast: (args: {
		id?: string
		message: string
		type: ToastType
		duration?: number
		onClose?: () => void
		autoClose?: boolean
	}) => void
	removeToast: (id: string) => void
}

export const useToast = create<ToastStore>((set, get) => ({
	toasts: [],
	duration: 4000,
	maxToast: 1,
	setConfig: (config: Partial<ToasterProps>) =>
		set(
			produce((store: ToastStore) => {
				Object.assign(store, config)
			})
		),
	addToast: ({ message, type, duration, onClose, autoClose = true }) =>
		set(
			produce((store: ToastStore) => {
				const id = Date.now().toString()

				if (store.toasts.length >= store.maxToast) {
					store.toasts.shift()
				}

				const toastDuration = duration ?? get().duration

				store.toasts.push({
					id,
					message,
					type,
					duration: toastDuration,
					onClose,
					autoClose,
					removing: false,
				})

				if (autoClose) {
					setTimeout(() => {
						get().removeToast(id)
					}, toastDuration)
				}
			})
		),
	removeToast: (id: string) =>
		set(
			produce((store: ToastStore) => {
				const toastIndex = store.toasts.findIndex(
					toast => toast.id === id
				)

				if (toastIndex !== -1) {
					const toast = store.toasts[toastIndex]
					toast.removing = true
					toast.onClose?.()
					setTimeout(() => {
						set(
							produce((newStore: ToastStore) => {
								const indexToRemove = newStore.toasts.findIndex(
									t => t.id === id
								)
								if (indexToRemove !== -1) {
									newStore.toasts.splice(indexToRemove, 1)
								}
							})
						)
					}, 1000)
				}
			})
		),
}))
