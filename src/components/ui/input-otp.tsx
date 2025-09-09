import { cn } from "@/lib/utils"
import React, {
	createContext,
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react"
import {
	Dimensions,
	Keyboard,
	NativeSyntheticEvent,
	Pressable,
	TextInput,
	TextInputKeyPressEventData,
	View,
} from "react-native"
import Animated, {
	FadeInDown,
	FadeOut,
	FadeOutDown,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated"

const { width: WIDTH } = Dimensions.get("window")

const DEFAULT_DIGITS = 6
const DEFAULT_GAP = 16
const DEFAULT_SIZE = 68

const getSize = (digits: number, gap: number, width: number = WIDTH) => {
	return (width - (digits - 1) * gap) / digits
}

interface InputOTPProps {
	digits?: number
	gap?: number
	size?: number
	containerWidth?: number
	containerClassName?: string
	inputClassName?: object
	textClassName?: string
	focusColor?: string
	autoFocus?: boolean
	disabled?: boolean
	segmented?: boolean
	enteringAnimated?: typeof FadeInDown
	exitingAnimated?: typeof FadeOut
	onCodeFilled?: (code: number) => void
	onCodeChanged?: (codes: number) => void
}

export interface InputOTPRef {
	reset: () => void
}

interface InputOtpContextType extends InputOTPProps {
	size: number
	digits: number
	inputRefs: React.RefObject<TextInput>[]
	otpValues: string[]
	handlePress: (index: number) => () => void
	onChangeText: (value: string) => void
	onKeyPress: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void
	setFocus: React.Dispatch<React.SetStateAction<number>>
	setOtpValues: React.Dispatch<React.SetStateAction<string[]>>
	focusIndex: number
}

const InputOtpContext = createContext<InputOtpContextType | null>(null)

const InputOTPSlot = ({ index }: { index: number }) => {
	const context = useContext(InputOtpContext) as InputOtpContextType

	const {
		size,
		digits,
		gap,
		inputRefs,
		otpValues,
		handlePress,
		onChangeText,
		onKeyPress,
		focusIndex,
		focusColor,
		disabled,
		enteringAnimated,
		exitingAnimated,
		inputClassName,
		textClassName,
		containerWidth,
	} = context

	const calculatedSize = getSize(
		digits as number,
		gap as number,
		containerWidth
	)
	const border = useSharedValue(focusIndex === index ? 1.5 : 0)

	const animatedBorderStyle = useAnimatedStyle(() => ({
		borderWidth: border.value,
	}))

	useEffect(() => {
		border.value = withTiming(focusIndex === index ? 1.5 : 0, {
			duration: 100,
		})
	}, [focusIndex])

	return (
		<View
			style={{
				height: Math.min(calculatedSize, size),
				width: Math.min(calculatedSize, size),
			}}
		>
			<TextInput
				key={otpValues[index] + index + "input"}
				className="absolute opacity-0"
				ref={inputRefs[index]}
				keyboardType="number-pad"
				value={otpValues[index]}
				onChangeText={onChangeText}
				onKeyPress={onKeyPress}
				caretHidden
				textContentType="oneTimeCode"
			/>
			<Pressable disabled={disabled} onPress={handlePress(index)}>
				<Animated.View
					className={cn(
						"h-full w-full items-center justify-center overflow-hidden rounded-full bg-neutral-100",
						inputClassName
					)}
					style={[animatedBorderStyle, { borderColor: focusColor }]}
				>
					{otpValues[index] && (
						<Animated.Text
							key={otpValues[index] + index + "text"}
							entering={enteringAnimated}
							exiting={exitingAnimated}
							className={cn(
								"text-center font-normal text-3xl text-black",
								textClassName
							)}
						>
							{otpValues[index]}
						</Animated.Text>
					)}
				</Animated.View>
			</Pressable>
		</View>
	)
}

const InputOTP = forwardRef(
	(
		{
			digits = DEFAULT_DIGITS,
			gap = DEFAULT_GAP,
			size = DEFAULT_SIZE,
			containerClassName,
			inputClassName,
			textClassName,
			focusColor = "#000",
			disabled = false,
			segmented = false,
			enteringAnimated = FadeInDown,
			exitingAnimated = FadeOutDown,
			onCodeFilled,
			onCodeChanged,
		}: InputOTPProps,
		ref: React.Ref<unknown>
	) => {
		const [focusIndex, setFocusIndex] = useState(0)
		const [otpValues, setOtpValues] = useState<string[]>(
			Array(digits).fill("")
		)

		// Create just one ref for non-segmented, or multiple refs for segmented mode
		const inputRefs = useRef(
			Array.from({ length: segmented ? digits : 1 }, () =>
				React.createRef<TextInput>()
			)
		)

		const [containerWidth, setContainerWidth] = useState<number>(0)

		const reset = () => {
			setOtpValues(Array(digits).fill(""))
			setFocusIndex(0)

			focus(0)
		}

		useImperativeHandle(ref, () => ({
			reset,
		}))

		const focus = (index: number) => {
			if (!segmented) {
				inputRefs.current[0]?.current?.focus()
				return
			}

			const input = inputRefs.current[index]?.current

			if (!input) {
				return
			}

			if (input.isFocused()) {
				if (!Keyboard.isVisible()) {
					input.blur()
					setTimeout(() => {
						input.focus()
					}, 500)
				}
			} else {
				input.focus()
			}
		}

		const handlePress = (index: number) => () => {
			if (!segmented) {
				inputRefs.current[0]?.current?.focus()
				return
			}

			let targetIndex = otpValues.findIndex(
				(value, i) => value === "" && i < index
			)
			if (targetIndex === -1) {
				targetIndex = otpValues.findIndex(value => value === "")
			}
			if (targetIndex === -1) {
				targetIndex = index
			}

			focus(targetIndex)
			setFocusIndex(targetIndex)
		}

		const onSingleInputChange = (value: string) => {
			// Filter non-numeric characters
			const numericValue = value.replace(/[^0-9]/g, "")

			// Limit to specified digits
			const limitedValue = numericValue.slice(0, digits)

			// Update otpValues array to reflect single input content
			const newOtpValues = Array(digits).fill("")
			limitedValue.split("").forEach((char, index) => {
				newOtpValues[index] = char
			})

			setOtpValues(newOtpValues)

			// Call callback functions
			const numValue = Number(limitedValue)
			onCodeChanged?.(numValue)

			if (limitedValue.length === digits) {
				onCodeFilled?.(numValue)
			}
		}

		const onChangeText = (value: string) => {
			if (!segmented) {
				onSingleInputChange(value)
				return
			}

			setTimeout(() => {
				const index = focusIndex
				if (value.length >= digits) {
					const finalValue = value.slice(-4)
					setOtpValues(finalValue.split(""))
					setFocusIndex(-1)
					onCodeChanged?.(Number(finalValue))
					onCodeFilled?.(Number(finalValue))
					return
				}
				otpValues[index] = value.split("").at(-1) || ""
				setOtpValues([...otpValues])

				const otp = Number(otpValues.join(""))

				if (value && index < digits - 1) {
					setFocusIndex(index + 1)
					focus(index + 1)
				} else if (index === digits - 1) {
					setFocusIndex(-1)
				}

				onCodeChanged?.(Number(otp))

				if (String(otp).length === digits) {
					onCodeFilled?.(Number(otp))
				}
			}, 0)
		}

		const onKeyPress = (
			e: NativeSyntheticEvent<TextInputKeyPressEventData>
		) => {
			if (!segmented) {
				return
			}

			const index = focusIndex
			const key = e.nativeEvent.key
			if (key === "Backspace" && index > 0) {
				if (otpValues[index] === "") {
					otpValues[index - 1] = ""
					setFocusIndex(index - 1)
					setTimeout(() => {
						focus(index - 1)
					}, 10)
				} else {
					setFocusIndex(index)
					setTimeout(() => {
						focus(index)
					}, 10)
				}
			}
		}

		useEffect(() => {
			setTimeout(() => {
				if (segmented) {
					focus(0)
				} else {
					inputRefs.current[0]?.current?.focus()
				}
			}, 500)
		}, [segmented])

		return (
			<InputOtpContext.Provider
				value={{
					size: size as number,
					digits: digits as number,
					inputRefs: inputRefs.current,
					otpValues,
					handlePress,
					onChangeText,
					onKeyPress,
					setFocus: setFocusIndex,
					setOtpValues,
					focusIndex,
					focusColor,
					disabled,
					enteringAnimated,
					exitingAnimated,
					inputClassName,
					textClassName,
					containerWidth,
					gap,
				}}
			>
				<View
					className={cn(
						"flex-row items-center justify-center",
						containerClassName
					)}
					style={{
						gap: gap,
					}}
					onLayout={event =>
						setContainerWidth(event.nativeEvent.layout.width)
					}
				>
					{segmented ? (
						Array.from({ length: digits }, (_, index) => (
							<InputOTPSlot key={index} index={index} />
						))
					) : (
						<TextInput
							ref={inputRefs.current[0]}
							className={cn(
								"h-14 w-full rounded-full border-0 bg-neutral-100 text-center text-base text-black",
								inputClassName
							)}
							style={{
								letterSpacing:
									otpValues.join("").length === 0 ? 0 : 16,
							}}
							textContentType="oneTimeCode"
							keyboardType="number-pad"
							onChangeText={onChangeText}
							maxLength={digits}
							editable={!disabled}
							value={otpValues.join("")}
						/>
					)}
				</View>
			</InputOtpContext.Provider>
		)
	}
)

export default InputOTP
