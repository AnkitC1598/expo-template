import { Audio } from "expo-av"
import { useState } from "react"
import { Alert } from "react-native"

const formatDuration = (milliseconds: number) => {
	const minutes = Math.floor(milliseconds / 1000 / 60) // Calculate minutes
	const seconds = Math.floor((milliseconds / 1000) % 60) // Calculate seconds

	// Format seconds and milliseconds for proper display
	const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`

	return `${minutes}:${formattedSeconds}`
}

type AudioData<TResponse> = {
	uri: string
	sound: Audio.Sound
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

const useAudioRecorder = <TRequest, TResponse, TMeta>({
	upload = false,
}: {
	upload?: UploadConfig<TRequest, TResponse, TMeta>
} = {}) => {
	const [recording, setRecording] = useState<Audio.Recording | null>(null)
	const [isRecording, setIsRecording] = useState<boolean>(false)
	const [isUploading, setIsUploading] = useState<boolean>(false)
	const [currentTime, setCurrentTime] = useState<number>(0)
	const [audio, setAudio] = useState<AudioData<TResponse> | null>(null)

	const [permissionResponse, requestPermission] = Audio.usePermissions()

	const reset = () => {
		setAudio(null)
		setRecording(null)
		setIsRecording(false)
		setIsUploading(false)
		setCurrentTime(0)
	}

	const onRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
		if (status.canRecord) {
			setIsRecording(status.isRecording)
			setCurrentTime(status.durationMillis)
		} else if (status.isDoneRecording) {
			setIsRecording(false)
			setCurrentTime(status.durationMillis)
		}
	}

	const record = async () => {
		setAudio(null)
		try {
			if (permissionResponse?.status !== "granted") {
				const permission = await requestPermission()
				if (permission.status !== "granted") {
					Alert.alert(
						"Cannot record audio, please provide permission"
					)
					return
				}
			}
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			})

			const { recording } = await Audio.Recording.createAsync(
				Audio.RecordingOptionsPresets.HIGH_QUALITY,
				onRecordingStatusUpdate,
				1000
			)
			setRecording(recording)
			return recording
		} catch (err) {
			console.error("Failed to start recording", err)
		}
	}

	const recordForDuration = async (duration: number, onEnd?: () => void) => {
		const rec = await record()
		setTimeout(async () => {
			await stop(rec)
			onEnd?.()
		}, duration * 1000)
	}

	const handleStopError = (err: unknown) => {
		const error = err as {
			code: string
			name: string
			message: string
		}
		if (error.code === "E_AUDIO_NODATA") {
			Alert.alert(
				`Stop was called too quickly, no data has yet been received (${error.message})`
			)
		} else {
			console.log("STOP ERROR: ", error.code, error.name, error.message)
		}
	}

	const handleUpload = async (
		upload: UploadConfig<TRequest, TResponse, TMeta>,
		recordingUri: string,
		recordingSound: Audio.Sound,
		duration: number
	) => {
		if (upload === false) {
			return
		}

		setIsUploading(true)
		const formData = new FormData()
		formData.append(upload.name || "audio", {
			uri: recordingUri,
			name: "audio.m4a",
			type: "audio/m4a",
		} as unknown as Blob)

		const url = (await upload.uploader({
			meta: upload.meta,
			body: formData,
		} as TRequest)) as TResponse

		setAudio({
			uri: recordingUri,
			sound: recordingSound,
			url,
			duration,
		})
		setIsUploading(false)
	}

	const handleSetAudio = (
		recordingUri: string,
		recordingSound: Audio.Sound,
		duration: number
	) => {
		setAudio({
			uri: recordingUri,
			sound: recordingSound,
			duration,
		})
	}

	const stop = async (rec?: Audio.Recording) => {
		if (!isRecording) {
			return
		}
		const recordingToUse = rec ?? recording

		if (!recordingToUse) {
			return
		}

		setRecording(null)
		try {
			await recordingToUse.stopAndUnloadAsync()
		} catch (err) {
			handleStopError(err)
		}
		await Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
		})
		const recordingUri = recordingToUse.getURI()

		if (!recordingUri) {
			return
		}

		const { sound: recordingSound } =
			await recordingToUse.createNewLoadedSoundAsync()
		const status = await recordingSound.getStatusAsync()
		const duration = status.isLoaded
			? parseFloat(((status.durationMillis ?? 0) / 1000).toFixed(2))
			: 0

		if (upload) {
			await handleUpload(upload, recordingUri, recordingSound, duration)
		} else {
			handleSetAudio(recordingUri, recordingSound, duration)
		}
	}

	const verifyPermission = async () => {
		if (permissionResponse?.status !== "granted") {
			await requestPermission()
		}
	}

	return {
		isRecording,
		isUploading,
		currentTime,
		formattedCurrentTime: formatDuration(currentTime),
		audio,
		verifyPermission,
		record,
		recordForDuration,
		stop,
		reset,
	}
}

export default useAudioRecorder
