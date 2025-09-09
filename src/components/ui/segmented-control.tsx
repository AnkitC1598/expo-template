import RNSegmentedControl from "@react-native-segmented-control/segmented-control"

type SegmentControlProps = {
	enabled?: boolean
	onIndexChange?: (index: number) => void
	onValueChange?: (value: string) => void
	selectedIndex?: number
	values: string[]
	/**
	 * If true, then selecting a segment won't persist visually. The onValueChange callback will still work as expected.
	 */
	iosMomentary?: boolean
}

const SegmentedControl = ({
	values,
	selectedIndex,
	onIndexChange,
	onValueChange: onValueChangeProp,
	enabled = true,
	iosMomentary,
}: SegmentControlProps) => {
	const onChange = (event: {
		nativeEvent: { selectedSegmentIndex: number }
	}) => {
		onIndexChange?.(event.nativeEvent.selectedSegmentIndex)
	}

	const onValueChange = (value: string) => {
		onValueChangeProp?.(value)
	}

	return (
		<RNSegmentedControl
			enabled={enabled}
			values={values}
			selectedIndex={selectedIndex}
			onChange={onChange}
			onValueChange={onValueChange}
			momentary={iosMomentary}
		/>
	)
}

export default SegmentedControl
