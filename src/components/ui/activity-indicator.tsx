import { ActivityIndicator as RNActivityIndicator } from "react-native"

function ActivityIndicator(
	props: React.ComponentPropsWithoutRef<typeof RNActivityIndicator>
) {
	return <RNActivityIndicator color="black" {...props} />
}

export { ActivityIndicator }
