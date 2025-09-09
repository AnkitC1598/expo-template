import RNRadioGroup, {
	RadioButtonProps,
} from "react-native-radio-buttons-group"

interface RadioGroupProps {
	radioButtons: RadioButtonProps[]
	selectedId?: string
	setSelectedId: (id?: string) => void
	layout?: "column" | "row"
}

const RadioGroup = ({
	radioButtons = [
		{
			id: "1",
			label: "Option 1",
			value: "option1",
		},
	],
	selectedId,
	setSelectedId,
	layout = "column",
	...props
}: RadioGroupProps) => {
	return (
		<RNRadioGroup
			radioButtons={radioButtons}
			selectedId={selectedId}
			onPress={setSelectedId}
			layout={layout}
			{...props}
		/>
	)
}

export default RadioGroup
