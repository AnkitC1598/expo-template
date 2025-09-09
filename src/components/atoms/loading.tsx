import { tailwindToHex } from "@/lib/tailwind"
import Svg, { Circle, Path } from "react-native-svg"

const Loading = ({ stroke = "text-purple-600" }: { stroke?: string }) => (
	<Svg
		fill="none"
		viewBox="0 0 24 24"
		style={{
			width: 24,
			height: 24,
		}}
		stroke={tailwindToHex(stroke)}
	>
		<Circle
			cx={12}
			cy={12}
			r={10}
			stroke={tailwindToHex(stroke)}
			strokeWidth={4}
			opacity={0.25}
		/>
		<Path
			fill={tailwindToHex(stroke)}
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			opacity={0.75}
		/>
	</Svg>
)

export default Loading
