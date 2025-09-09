import Progress from "@/ui/progress"
import { AVPlaybackStatus, Audio as AudioModule } from "expo-av"
import React, { useEffect, useState } from "react"
import { Pressable, Text, View } from "react-native"
import { ArrowPathIcon } from "react-native-heroicons/outline"
import {
	PauseIcon,
	PlayIcon,
	SpeakerWaveIcon,
	SpeakerXMarkIcon,
} from "react-native-heroicons/solid"

interface AudioProps {
	uri: string
	loopAble?: boolean
	onEnd?: () => void
}

const Audio = ({ uri, loopAble = false, onEnd }: AudioProps) => {
	const [audio, setAudio] = useState<AudioModule.Sound | null>(null)
	const [isPlaying, setIsPlaying] = useState<0 | 1 | -1>(-1)
	const [isMuted, setIsMuted] = useState<boolean>(false)
	const [isLooping, setIsLooping] = useState<boolean>(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)

	const togglePlay = async () => {
		if (isPlaying === 1) {
			await audio?.pauseAsync()
			setIsPlaying(0)
		} else {
			if (audio) {
				await audio.playAsync()
			} else {
				const { sound, status } = await AudioModule.Sound.createAsync(
					{ uri },
					{ progressUpdateIntervalMillis: 1, isMuted, isLooping }
				)

				if (!status.isLoaded) {
					return
				}

				sound.setIsMutedAsync(isMuted)
				sound.setIsLoopingAsync(isLooping)
				sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
				setAudio(sound)
				sound?.playAsync()
			}
			setIsPlaying(1)
		}
	}

	const toggleMute = () => {
		audio?.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
		audio?.setIsMutedAsync(!isMuted)
		setIsMuted(!isMuted)
	}

	const toggleLoop = () => {
		audio?.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
		audio?.setIsLoopingAsync(!isLooping)
		setIsLooping(!isLooping)
	}

	const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
		if (!status.isLoaded) {
			return
		}

		if (status.didJustFinish) {
			onEnd?.()
			if (!status.isLooping) {
				setIsPlaying(-1)
				setCurrentTime(0)
				await audio?.unloadAsync()
				setAudio(null)
				return
			} else {
				setIsPlaying(1)
				setCurrentTime(0)
				return
			}
		}

		setIsPlaying(status.isPlaying ? 1 : 0)
		setCurrentTime(status.positionMillis)
	}

	useEffect(() => {
		;(async () => {
			setIsLooping(false)
			const { sound, status } = await AudioModule.Sound.createAsync(
				{ uri },
				{
					progressUpdateIntervalMillis: 1,
					shouldPlay: true,
					isLooping,
				},
				onPlaybackStatusUpdate
			)

			if (!status.isLoaded) {
				return
			}

			sound.stopAsync()
			setDuration(status.durationMillis || 0)
			setAudio(sound)
		})()
	}, [uri])

	useEffect(() => {
		if (audio) {
			return () => {
				audio.unloadAsync()
			}
		}
	}, [audio])

	return (
		<View className="min-h-[55px] flex-1 flex-row items-center gap-4 rounded-full bg-neutral-200 p-4">
			<Pressable onPress={togglePlay}>
				{isPlaying === 1 ? (
					<PauseIcon size={24} color="black" />
				) : (
					<PlayIcon size={24} color="black" />
				)}
			</Pressable>
			<Text>{`${formatDuration(currentTime)} / ${formatDuration(duration)}`}</Text>
			<Progress
				className="h-1.5 flex-1 bg-neutral-300"
				value={(currentTime / duration) * 100}
				animationDuration={150}
			/>
			<Pressable onPress={toggleMute}>
				{isMuted ? (
					<SpeakerXMarkIcon size={24} color="black" />
				) : (
					<SpeakerWaveIcon size={24} color="black" />
				)}
			</Pressable>
			{loopAble && (
				<Pressable onPress={toggleLoop}>
					<ArrowPathIcon
						size={24}
						strokeWidth={2.5}
						color={isLooping ? "#3b82f6" : "black"}
					/>
				</Pressable>
			)}
		</View>
	)
}

export default Audio

const formatDuration = (milliseconds: number) => {
	const minutes = Math.floor(milliseconds / 1000 / 60) // Calculate minutes
	const seconds = Math.floor((milliseconds / 1000) % 60) // Calculate seconds

	// Format seconds and milliseconds for proper display
	const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`

	return `${minutes}:${formattedSeconds}`
}
