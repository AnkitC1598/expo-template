import { tailwindToHex } from "@/lib/tailwind"
import { cn } from "@/lib/utils"
import { ActivityIndicator } from "@/ui/activity-indicator"
import Badge from "@/ui/badge"
import Button from "@/ui/button"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import {
	CameraMode,
	CameraRecordingOptions,
	CameraType,
	CameraView,
	CameraViewProps,
	FlashMode,
	useCameraPermissions,
	useMicrophonePermissions,
} from "expo-camera"
import { LinearGradient, LinearGradientProps } from "expo-linear-gradient"
import React from "react"
import { Pressable, Text, View } from "react-native"
import {
	CameraIcon,
	ExclamationTriangleIcon,
	StopCircleIcon,
	VideoCameraIcon,
} from "react-native-heroicons/solid"
import { create } from "zustand"

const formatDuration = (duration: number) => {
	const minutes = Math.floor(duration / 60) // Calculate minutes
	const seconds = Math.floor(duration % 60) // Calculate seconds

	// Format seconds for proper display
	const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`

	return `${minutes}:${formattedSeconds}`
}

type CameraStore = {
	cameraMode: CameraMode
	facingMode: CameraType
	flashMode: FlashMode | "fill"
	torchMode: boolean
	isRecording: boolean
	isUploading: boolean
	currentTime: number
	error: boolean
	media: MediaData<any> | null
	setCameraMode: (mode: CameraMode) => void
	setFacingMode: (facing: CameraType) => void
	setFlashMode: (flashMode: FlashMode | "fill") => void
	setTorchMode: (torchMode: boolean) => void
	setIsRecording: (isRecording: boolean) => void
	setIsUploading: (isUploading: boolean) => void
	setCurrentTime: (time: number) => void
	setMedia: (media: MediaData<any> | null) => void
	reset: (error?: boolean) => void
	incrementCurrentTime: () => void
	toggleCameraMode: () => void
	toggleFacingMode: () => void
	toggleFlashMode: () => void
}

export const useCameraStore = create<CameraStore>(set => ({
	cameraMode: "video",
	facingMode: "front",
	flashMode: "auto",
	torchMode: false,
	isRecording: false,
	isUploading: false,
	currentTime: 0,
	media: null,
	error: false,
	setCameraMode: mode => set({ cameraMode: mode }),
	setFacingMode: facing => set({ facingMode: facing }),
	setFlashMode: flashMode => set({ flashMode }),
	setTorchMode: torchMode => set({ torchMode }),
	setIsRecording: isRecording => set({ isRecording }),
	setIsUploading: isUploading => set({ isUploading }),
	setCurrentTime: time => set({ currentTime: time }),
	setMedia: media => set({ media }),
	reset: (error: boolean = false) =>
		set({
			media: null,
			isRecording: false,
			isUploading: false,
			currentTime: 0,
			error,
		}),
	incrementCurrentTime: () =>
		set(store => ({
			currentTime: store.currentTime + 1,
		})),
	toggleCameraMode: () =>
		set(store => ({
			cameraMode: store.cameraMode === "video" ? "picture" : "video",
		})),
	toggleFacingMode: () =>
		set(store => ({
			facingMode: store.facingMode === "back" ? "front" : "back",
		})),
	toggleFlashMode: () =>
		set(store => {
			const nextFlashMode = {
				on: "off",
				off: "fill",
				fill: "auto",
				auto: "on",
			}
			return {
				flashMode: nextFlashMode[store.flashMode] as FlashMode | "fill",
				torchMode: nextFlashMode[store.flashMode] === "fill",
			}
		}),
}))

export interface CameraRef {
	record: () => Promise<void>
	stop: () => Promise<void>
}

type ControlOption = "cameraMode" | "facingMode"

type ControlledOption = boolean | ControlOption | ControlOption[]

export interface CameraProps<TRequest, TResponse, TMeta>
	extends CameraViewProps {
	controlled?: ControlledOption
	maxDuration?: CameraRecordingOptions["maxDuration"]
	maxFileSize?: CameraRecordingOptions["maxFileSize"]
	upload?: UploadConfig<TRequest, TResponse, TMeta>
}

type MediaData<TResponse> = {
	uri: string
	url?: TResponse
	duration: number
}

type UploadConfig<TRequest, TResponse, TMeta> =
	| false
	| {
			uploader: (args: TRequest) => Promise<TResponse>
			name?: string
			meta: TMeta
	  }

let timer: ReturnType<typeof setInterval>

const Camera = <TRequest, TResponse, TMeta>({
	controlled = false,
	maxDuration,
	maxFileSize,
	upload,
	...cameraProps
}: CameraProps<TRequest, TResponse, TMeta> = {}) => {
	const cameraRef = React.useRef<CameraView>(null)

	const {
		cameraMode,
		facingMode,
		flashMode,
		torchMode,
		isRecording,
		setIsRecording,
		setIsUploading,
		setCurrentTime,
		incrementCurrentTime,
		setMedia,
		reset,
	} = useCameraStore()

	const [cameraPermission, requestCameraPermission] = useCameraPermissions()
	const [microphonePermission, requestMicrophonePermission] =
		useMicrophonePermissions()

	const capture = async () => {
		const camera = cameraRef.current
		if (camera) {
			const picture = await camera.takePictureAsync({
				imageType: "jpg",
				quality: 1,
			})

			const uri = picture?.uri

			if (uri) {
				if (upload) {
					setIsUploading(true)
					const formData = new FormData()
					formData.append(upload.name || "image", {
						uri: uri,
						name: "image.jpg",
						type: "image/jpg",
					} as unknown as Blob)

					const url = (await upload.uploader({
						meta: upload.meta,
						body: formData,
					} as TRequest)) as TResponse

					setMedia({ uri, url, duration: 0 })
					setIsUploading(false)
				} else {
					setMedia({ uri, duration: 0 })
				}
			}
		}
	}

	const record = async () => {
		const camera = cameraRef.current
		if (camera) {
			setIsRecording(true)
			setCurrentTime(0)

			clearInterval(timer)
			timer = setInterval(() => {
				incrementCurrentTime()
			}, 1 * 1000)

			try {
				const recording = await camera.recordAsync({
					maxDuration,
					maxFileSize,
				})

				clearInterval(timer)
				const uri = recording?.uri

				if (uri) {
					const duration = useCameraStore.getState().currentTime

					if (upload) {
						setIsUploading(true)
						const formData = new FormData()
						formData.append(upload.name || "video", {
							uri: uri,
							name: "video.mp4",
							type: "video/mp4",
						} as unknown as Blob)

						const url = (await upload.uploader({
							meta: upload.meta,
							body: formData,
						} as TRequest)) as TResponse

						setIsUploading(false)
						setMedia({ uri, url, duration })
					} else {
						setMedia({ uri, duration })
					}
				}
			} catch {
				reset(true)
			}
		}
	}

	const stop = async () => {
		const camera = cameraRef.current
		if (camera) {
			setIsRecording(false)
			camera.stopRecording()

			clearInterval(timer)
		}
	}

	const toggleRecord = () => {
		isRecording ? stop() : record()
	}

	if (!cameraPermission || !microphonePermission) {
		return (
			<View className="h-full w-full flex-1 items-center justify-center gap-4">
				<ActivityIndicator />
			</View>
		)
	}

	const requestPermissions = async () => {
		if (!cameraPermission.granted) {
			requestCameraPermission()
		}
		if (!microphonePermission.granted) {
			requestMicrophonePermission()
		}
	}

	if (!cameraPermission.granted || !microphonePermission.granted) {
		return (
			<View className="h-full w-full flex-1 items-center justify-center gap-4 px-4">
				<Text className="text-center">
					We need access to your camera and microphone to continue
				</Text>
				<Button onPress={requestPermissions}>
					Request Permissions
				</Button>
			</View>
		)
	}

	return (
		<View className="relative h-full w-full flex-1 items-center gap-4 overflow-hidden rounded-xl">
			<CameraView
				ref={cameraRef}
				style={{
					flex: 1,
					width: "100%",
					height: "100%",
					borderRadius: 12,
				}}
				mode={cameraMode}
				facing={facingMode}
				flash={flashMode === "fill" ? "on" : flashMode}
				enableTorch={torchMode || flashMode === "fill"}
				autofocus="on"
				{...cameraProps}
			/>
			<CameraScreen
				{...{
					controlled,
					toggleRecord,
					capture,
				}}
			/>
		</View>
	)
}

export default Camera

interface CameraScreenProps {
	controlled: ControlledOption
	toggleRecord: () => void
	capture: () => Promise<void>
}

const FlashModeIcon: Record<
	FlashMode | "fill",
	"flash-on" | "flash-off" | "flashlight-on" | "flash-auto"
> = {
	on: "flash-on",
	off: "flash-off",
	fill: "flashlight-on",
	auto: "flash-auto",
}

const CameraScreen = ({
	controlled,
	toggleRecord,
	capture,
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignore this complexity
}: CameraScreenProps) => {
	const {
		cameraMode,
		facingMode,
		flashMode,
		isRecording,
		currentTime,
		error,
		toggleCameraMode,
		toggleFacingMode,
		toggleFlashMode,
	} = useCameraStore()

	const camTriggerColorMap = {
		idle: [
			tailwindToHex("bg-neutral-600"),
			tailwindToHex("bg-neutral-900"),
		],
		recording: [tailwindToHex("bg-red-500"), tailwindToHex("bg-red-800")],
		error: [
			tailwindToHex("bg-neutral-600"),
			tailwindToHex("bg-neutral-900"),
		],
	} as {
		[key in "idle" | "recording" | "error"]: LinearGradientProps["colors"]
	}

	const isControlEnabled = (controlName: ControlOption): boolean => {
		if (isRecording || error) {
			return false
		}
		if (typeof controlled === "boolean") {
			return controlled
		}
		if (typeof controlled === "string") {
			return controlled === controlName
		}
		if (Array.isArray(controlled)) {
			return (controlled as readonly string[]).includes(controlName)
		}
		return false
	}

	return (
		<>
			<View className="absolute inset-0 w-full flex-1 justify-between gap-4 rounded-xl p-4">
				{/* <Text className="text-white">
					{JSON.stringify(
						{
							isRecording,
							facingMode,
							cameraMode,
							flashMode,
							currentTime,
						},
						null,
						4
					)}
				</Text> */}
				<View className="w-full flex-row items-center justify-between gap-4">
					<View className="flex-1 flex-row justify-center"></View>
					<View className="flex-1 items-center">
						{isRecording && (
							<Badge
								variant="red"
								label={formatDuration(currentTime)}
							/>
						)}
					</View>
					<View className="flex-1 flex-row justify-center">
						{isControlEnabled("cameraMode") && (
							<Button
								size="icon"
								variant="ghost"
								onPress={toggleCameraMode}
								asChild
							>
								{cameraMode === "video" ? (
									<VideoCameraIcon size={24} color="white" />
								) : (
									<CameraIcon size={24} color="white" />
								)}
							</Button>
						)}
					</View>
				</View>
				<View className="w-full flex-row items-center justify-between gap-4">
					<View className="flex-1 flex-row justify-center">
						{facingMode === "back" && !isRecording && (
							<Button
								size="icon"
								variant="ghost"
								onPress={toggleFlashMode}
								asChild
							>
								<MaterialIcons
									name={FlashModeIcon[flashMode]}
									size={24}
									color="white"
								/>
							</Button>
						)}
					</View>
					<View className="flex-1 flex-row items-center justify-center">
						<Pressable
							className="relative overflow-hidden rounded-full"
							disabled={error}
							onPress={
								cameraMode === "picture"
									? capture
									: toggleRecord
							}
						>
							<LinearGradient
								colors={
									camTriggerColorMap[
										error
											? "error"
											: isRecording
												? "recording"
												: "idle"
									]
								}
								className={cn(
									"items-center justify-center rounded-full"
								)}
								style={{
									padding: isRecording ? 16 : 24,
								}}
							>
								{error ? (
									<ExclamationTriangleIcon
										size={24}
										color="red"
									/>
								) : isRecording ? (
									<StopCircleIcon size={36} color="white" />
								) : cameraMode === "video" ? (
									<VideoCameraIcon size={24} color="white" />
								) : (
									<CameraIcon size={24} color="white" />
								)}
							</LinearGradient>
						</Pressable>
					</View>
					<View className="flex-1 flex-row justify-center">
						{isControlEnabled("facingMode") && (
							<Button
								size="icon"
								variant="ghost"
								onPress={toggleFacingMode}
								asChild
							>
								<MaterialCommunityIcons
									name="camera-flip"
									size={24}
									color="white"
								/>
							</Button>
						)}
					</View>
				</View>
			</View>
		</>
	)
}
