import { getCachedFile } from "@/lib/cache"
import { ActivityIndicator } from "@/ui/activity-indicator"
import Progress from "@/ui/progress"
import { useEvent, useEventListener } from "expo"
import { BlurView } from "expo-blur"
import {
	VideoPlayer,
	VideoView,
	VideoViewProps,
	useVideoPlayer,
} from "expo-video"
import { MotiView } from "moti"
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react"
import { Pressable, StyleSheet, View, ViewStyle } from "react-native"
import { ArrowsPointingOutIcon, PlayIcon } from "react-native-heroicons/solid"

interface VideoProps {
	src: string
	cache?: boolean
	loop?: boolean
	autoPlay?: boolean
	muted?: boolean
	showProgress?: boolean
	threshold?: number
	onThreshold?: (args: { currentTime: number; duration: number }) => void
	fullscreen?: boolean
	contentFit?: "cover" | "contain"
	videoProps?: VideoViewProps
	videoStyle?: ViewStyle
	onPlay?: () => void
	onPause?: () => void
	onStop?: () => void
	onEnd?: () => void
}

export interface VideoPlayerHandle {
	play: () => void
	pause: () => void
	stop: () => void
	togglePlay: () => void
	toggleMute: () => boolean
}

const Video = forwardRef(
	(
		{
			src,
			cache = true,
			loop = false,
			autoPlay = false,
			muted = false,
			showProgress = true,
			fullscreen = false,
			contentFit = "cover",
			threshold,
			onThreshold,
			videoProps,
			videoStyle = {},
			onPlay,
			onPause,
			onStop,
			onEnd,
		}: VideoProps,
		ref
	) => {
		const [source, setSource] = useState<string | null>(null)

		useEffect(() => {
			if (!cache || src.endsWith(".m3u8")) {
				setSource(src)
				return
			}
			;(async () => {
				const videoUri = await getCachedFile(src)
				setSource(videoUri)
			})()
		}, [cache, src])

		return (
			<View
				className="h-full w-full flex-1 overflow-hidden"
				style={[
					{
						borderRadius: 12,
					},
					videoStyle,
				]}
			>
				{!source ? (
					<ActivityIndicator style={[StyleSheet.absoluteFill]} />
				) : (
					<VideoPlayerComponent
						ref={ref}
						src={source}
						loop={loop}
						autoPlay={autoPlay}
						muted={muted}
						showProgress={showProgress}
						fullscreen={fullscreen}
						contentFit={contentFit}
						videoProps={videoProps}
						threshold={threshold}
						onThreshold={onThreshold}
						onPlay={onPlay}
						onPause={onPause}
						onStop={onStop}
						onEnd={onEnd}
					/>
				)}
			</View>
		)
	}
)

export default Video

const VideoPlayerComponent = forwardRef(
	(
		{
			src,
			loop = false,
			autoPlay = false,
			muted = false,
			showProgress = true,
			fullscreen = false,
			contentFit = "cover",
			videoProps,
			threshold,
			onThreshold,
			onPlay,
			onPause,
			onStop,
			onEnd,
		}: VideoProps,
		ref
	) => {
		const player = useVideoPlayer({
			uri: src,
			contentType: src.endsWith(".m3u8") ? "hls" : "auto",
		})

		const [isFullscreen, setIsFullscreen] = useState(false)
		const videoRef = useRef<VideoView>(null)
		const hasTriggeredThreshold = useRef(false)

		const handlePlay = () => {
			if (!player) {
				return
			}

			if (loop || showProgress) {
				player.timeUpdateEventInterval = 0.1
			}

			player.play()
			onPlay?.()
		}
		const handlePause = () => {
			if (!player) {
				return
			}

			player.timeUpdateEventInterval = 0
			player.pause()
			onPause?.()
		}
		const handleStop = () => {
			if (!player) {
				return
			}

			player.currentTime = 0
			player.timeUpdateEventInterval = 0
			player.pause()
			onStop?.()
		}
		const handleToggleMute = () => {
			if (!player) {
				return
			}

			player.muted = !player.muted
			return !player.muted
		}
		const handleTogglePlay = () => {
			if (!player) {
				return
			}

			if (player.playing) {
				handlePause()
			} else {
				handlePlay()
			}
		}

		// Expose player control methods to parent component
		useImperativeHandle(ref, () => ({
			play: handlePlay,
			pause: handlePause,
			stop: handleStop,
			togglePlay: handleTogglePlay,
			toggleMute: handleToggleMute,
		}))

		const { isPlaying } = useEvent(player, "playingChange", {
			isPlaying: player.playing,
		})
		const { status } = useEvent(player, "statusChange", {
			status: player.status,
		})
		useEventListener(player, "timeUpdate", ({ currentTime }) => {
			if (
				!hasTriggeredThreshold.current &&
				threshold !== undefined &&
				currentTime >=
					player.duration * Math.max(0, Math.min(1, threshold))
			) {
				hasTriggeredThreshold.current = true
				onThreshold?.({ currentTime, duration: player.duration })
			}

			if (currentTime >= player.duration) {
				onEnd?.()

				if (loop) {
					player.replay?.()
					hasTriggeredThreshold.current = false // reset for next loop
				} else {
					handleStop?.()
				}
			}
		})

		useEffect(() => {
			if (!player) {
				return
			}

			player.muted = muted
		}, [player, muted])

		useEffect(() => {
			if (autoPlay) {
				handlePlay()
			}
		}, [autoPlay])

		return (
			<>
				<VideoView
					ref={videoRef}
					style={[StyleSheet.absoluteFill]}
					contentFit={contentFit}
					player={player}
					nativeControls={isFullscreen}
					onFullscreenExit={() => setIsFullscreen(false)}
					allowsFullscreen
					{...videoProps}
				/>
				<View className="flex-1 items-end">
					{fullscreen && (
						<View className="absolute top-2 right-2 z-50">
							<Pressable
								className="aspect-square items-center justify-center rounded-lg p-1.5"
								onPress={async () => {
									setIsFullscreen(true)
									setTimeout(
										() =>
											videoRef.current?.enterFullscreen(),
										0
									)
								}}
							>
								<BlurView
									style={[
										StyleSheet.absoluteFill,
										{
											borderRadius: 12,
											overflow: "hidden",
											// backgroundColor: "rgba(0,0,0,0.8)",
										},
									]}
									tint="dark"
									intensity={50}
								/>

								<ArrowsPointingOutIcon
									size={20}
									color="white"
								/>
							</Pressable>
						</View>
					)}
					<Pressable
						onPress={handleTogglePlay}
						className="w-full flex-1 items-center justify-center"
					>
						<VideoStatus isPlaying={isPlaying} status={status} />
					</Pressable>
				</View>
				{showProgress && <VideoProgress player={player} />}
			</>
		)
	}
)

const VideoStatus = ({
	isPlaying,
	status,
}: {
	isPlaying: boolean
	status: string
}) => {
	return status === "loading" ? (
		<ActivityIndicator />
	) : (
		status === "readyToPlay" && (
			<View className="absolute inset-0 items-center justify-center">
				<MotiView
					className="absolute inset-0 items-center justify-center"
					from={{
						opacity: 1,
						scale: 0.8,
					}}
					animate={{
						opacity: !isPlaying ? 1 : 0,
						scale: !isPlaying ? 1 : 0.8,
					}}
					transition={{
						type: "spring",
						stiffness: 200,
						damping: 20,
					}}
				>
					<View className="aspect-square items-center justify-center rounded-full p-4">
						<BlurView
							style={[
								StyleSheet.absoluteFill,
								{
									borderRadius: 100,
									overflow: "hidden",
									// backgroundColor: "rgba(0,0,0,0.8)",
								},
							]}
							tint="dark"
							intensity={100}
						/>
						<PlayIcon size={40} color="rgba(255, 255, 255, 0.6)" />
					</View>
				</MotiView>
			</View>
		)
	)
}

const VideoProgress = ({ player }: { player: VideoPlayer }) => {
	const { currentTime } = useEvent(player, "timeUpdate", {
		currentTime: player.currentTime ?? 0,
		currentLiveTimestamp: player.currentLiveTimestamp ?? null,
		currentOffsetFromLive: player.currentOffsetFromLive ?? 0,
		bufferedPosition: player.bufferedPosition ?? 0,
	})

	return (
		<Progress
			className="h-[3px] bg-transparent"
			value={(currentTime / (player.duration || 1)) * 100}
			progressClassName="bg-red-600"
			animationDuration={100}
		/>
	)
}
