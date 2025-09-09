import { differenceInMilliseconds, getTime } from "date-fns"
import { produce } from "immer"
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import RNPagerView, {
	PagerViewProps as RNPagerViewProps,
} from "react-native-pager-view"

interface PagerContextType<T = unknown> {
	currentPage: number
	progress: { position: number; offset: number }
	scrollState: string
	enabled: boolean
	viewPagerRef: React.MutableRefObject<RNPagerView | null>

	gotoPage: (page: number) => void
	pause: () => void
	resume: () => void
	finish: (index: number) => void
	durations: Record<number, number>
	totalPages: number
	finishedPages: Set<number>
	offscreenPageLimit: number
	metaProps: T
}

const PagerContext = createContext<PagerContextType | undefined>(undefined)

interface PagerViewProps<T = unknown> {
	children: React.ReactNode
	initialPage?: number
	onPageSelected?: ({ position }: { position: number }) => void
	onPageScroll?: ({
		position,
		offset,
	}: { position: number; offset: number }) => void
	onPageScrollStateChanged?: ({
		pageScrollState,
	}: { pageScrollState: string }) => void

	cumulativeDuration?: boolean
	pausable?: boolean
	onPageTransition?: ({
		from,
		to,
		fromFinished,
		autoFinishEnabled,
		toFinished,
		duration,
		isFirstPage,
		isLastPage,
	}: {
		from: number
		to: number
		fromFinished: boolean
		autoFinishEnabled: boolean
		toFinished: boolean
		duration: number
		isFirstPage: boolean
		isLastPage: boolean
	}) => void
	initialFinishedPages?: Set<number>
	metaProps?: T
	shouldAutoFinish?: (index: number) => boolean
	paginationThreshold?: number
	pageSize?: number
	onNearEnd?: () => void
	onNearStart?: () => void
	onEndReached?: () => void
	onStartReached?: () => void
}

const PagerView = React.forwardRef<
	RNPagerView,
	PagerViewProps & RNPagerViewProps & Partial<PagerContextType>
>(
	(
		{
			children,
			initialPage = 0,
			onPageSelected,
			onPageScroll,
			onPageScrollStateChanged,
			cumulativeDuration = false,
			pausable = true,
			onPageTransition,
			initialFinishedPages = new Set(),
			metaProps = {},
			style = {},
			offscreenPageLimit = 1,
			orientation = "vertical",
			shouldAutoFinish,
			paginationThreshold = 2,
			pageSize = 5,
			onNearEnd,
			onNearStart,
			onEndReached,
			onStartReached,
			...pagerProps
		},
		ref
	) => {
		const [progress, setProgress] = useState<{
			position: number
			offset: number
		}>({ position: 0, offset: 0 })
		const [scrollState, setScrollState] = useState<string>("idle")
		const viewPagerRef = useRef<RNPagerView | null>(null)

		const [currentPage, setCurrentPage] = useState<number>(initialPage)
		const [durations, setDurations] = useState<Record<number, number>>({})
		const [finishedPages, setFinishedPages] =
			useState<Set<number>>(initialFinishedPages)
		const [enabled, setEnabled] = useState<boolean>(true)

		const pageStartTimeRef = useRef(getTime(new Date()))

		const pages = useMemo(
			() => React.Children.toArray(children).filter(React.isValidElement),
			[children]
		)
		const totalPages = useMemo(() => pages.length - 1, [pages])

		const finish = useCallback((index: number) => {
			return new Promise<Set<number>>(resolve => {
				setFinishedPages(prev => {
					const updatedSet = new Set([...prev, index]) // Create a new set
					resolve(updatedSet) // Resolve Promise with new state
					return updatedSet
				})
			})
		}, [])

		const resume = useCallback(() => {
			setEnabled(true)
		}, [])

		const pause = useCallback(() => {
			if (pausable) {
				setEnabled(false)
			}
		}, [pausable])

		const handlePageTransition = useCallback(
			async (nextIndex: number, prevIndex: number) => {
				const endTime = getTime(new Date())
				let updatedSet: Set<number> = finishedPages

				const pageDuration = differenceInMilliseconds(
					endTime,
					pageStartTimeRef.current
				)

				const updatedDuration =
					(cumulativeDuration ? (durations[prevIndex] ?? 0) : 0) +
					pageDuration

				const shouldFinish = shouldAutoFinish?.(prevIndex) ?? true

				const isFirstPage = nextIndex === 0
				const isLastPage = nextIndex === totalPages

				if (onEndReached && isLastPage) {
					onEndReached()
				}
				if (onStartReached && isFirstPage) {
					onStartReached()
				}

				if (
					!updatedSet.has(prevIndex) &&
					prevIndex < nextIndex &&
					shouldFinish
				) {
					updatedSet = await finish(prevIndex)
				}

				onPageTransition?.({
					from: prevIndex,
					to: nextIndex,
					fromFinished: finishedPages.has(prevIndex),
					toFinished: updatedSet.has(nextIndex),
					autoFinishEnabled: shouldFinish,
					duration: updatedDuration,
					isFirstPage,
					isLastPage,
				})

				setDurations(
					produce(draft => {
						draft[prevIndex] = updatedDuration
					})
				)

				pageStartTimeRef.current = endTime
			},
			[finishedPages, totalPages, onEndReached, onStartReached]
		)

		const gotoPage = (newPage: number): void => {
			viewPagerRef.current?.setPage(newPage)
		}

		// const gotoNextPage = (): void => {
		// 	gotoPage(Math.min(currentPage + 1, totalPages))
		// }

		const gotoPrevPage = (): void => {
			gotoPage(Math.max(currentPage - 1, 0))
		}

		const _onPageSelected = (e: {
			nativeEvent: { position: number }
		}): void => {
			const { position } = e.nativeEvent
			setCurrentPage(position)
			handlePageTransition(position, currentPage)
			onPageSelected?.({ position })
		}

		const _onPageScroll = (e: {
			nativeEvent: { position: number; offset: number }
		}): void => {
			const { position, offset } = e.nativeEvent
			setProgress({
				position: position,
				offset: offset,
			})
			onPageScroll?.({ position, offset })
		}

		const _onPageScrollStateChanged = (e: {
			nativeEvent: { pageScrollState: string }
		}): void => {
			const { pageScrollState } = e.nativeEvent
			setScrollState(pageScrollState)
			onPageScrollStateChanged?.({ pageScrollState })
		}

		const pan = Gesture.Pan()
			.enabled(!enabled)
			.onEnd(event => {
				const threshold = 5

				// Check swipe direction and threshold to decide if page should change
				if (event.translationY > threshold && currentPage > 0) {
					gotoPrevPage() // Swipe down, move to previous page
					setEnabled(true)
					return
				}
			})
			.runOnJS(true)

		useEffect(() => {
			if (typeof ref === "function") {
				ref(viewPagerRef.current)
			} else if (ref) {
				;(ref as React.RefObject<RNPagerView | null>).current =
					viewPagerRef.current
			}
		}, [ref])

		useEffect(() => {
			if (totalPages <= 0) {
				return
			}

			if (currentPage === totalPages - paginationThreshold) {
				onNearEnd?.()
				// setCurrentPaginationPage(prev => Math.min(prev + 1, totalPages))
				// setCurrentPage(prev => Math.min(prev - pageSize, prev))
			}

			if (currentPage === paginationThreshold) {
				onNearStart?.()
				// setCurrentPaginationPage(prev => Math.max(prev - 1, 1))
				// setCurrentPage(prev => Math.max(prev + pageSize, 0))
			}
		}, [
			currentPage,
			totalPages,
			paginationThreshold,
			pageSize,
			onNearEnd,
			onNearStart,
		])

		return (
			<PagerContext.Provider
				value={{
					viewPagerRef,
					progress,
					scrollState,
					gotoPage,
					pause,
					resume,
					finish,
					currentPage,
					enabled,
					durations,
					totalPages,
					finishedPages,
					offscreenPageLimit,
					metaProps,
				}}
			>
				<GestureDetector gesture={pan}>
					<RNPagerView
						initialPage={initialPage}
						{...pagerProps}
						ref={viewPagerRef}
						orientation={orientation}
						offscreenPageLimit={offscreenPageLimit}
						scrollEnabled={enabled}
						onPageSelected={_onPageSelected}
						// onPageScroll={_onPageScroll}
						// onPageScrollStateChanged={_onPageScrollStateChanged}
						style={[
							{
								height: "100%",
							},
							style,
						]}
					>
						{children}
					</RNPagerView>
				</GestureDetector>
			</PagerContext.Provider>
		)
	}
)

export default PagerView

interface UsePagerProps {
	index: number
}

type UsePagerReturn<T> = PagerContextType<T> & {
	inView: boolean
	duration: number
	isFirstPage: boolean
	isNextPage: boolean
	isPrevPage: boolean
	isLastPage: boolean
	isWithinOffscreenLimit: boolean
}

export const usePager = <T = unknown>({
	index,
}: UsePagerProps): UsePagerReturn<T> => {
	const context = useContext(PagerContext) as PagerContextType<T>
	if (!context) {
		throw new Error("usePager must be used within a PagerProvider")
	}

	const { currentPage, durations, totalPages, offscreenPageLimit, finish } =
		context

	return {
		...context,
		inView: currentPage === index,
		duration: durations[index],
		isFirstPage: index === 0,
		isNextPage: index === currentPage + 1,
		isPrevPage: index === currentPage - 1,
		isLastPage: index === totalPages,
		isWithinOffscreenLimit:
			index >= Math.max(0, currentPage - offscreenPageLimit) &&
			index <= Math.min(totalPages, currentPage + offscreenPageLimit),
		finish: () => finish?.(index),
	}
}

export const OffscreenLimitRenderer: React.FC<{
	children: React.ReactNode
	index: number
}> = ({ children, index }) => {
	const { isWithinOffscreenLimit } = usePager({ index })

	if (!isWithinOffscreenLimit) {
		return null
	}

	return <>{children}</>
}
