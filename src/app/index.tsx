import Container from "@/atoms/container"
import { Text, View } from "react-native"

const Screen = () => {
	return (
		<Container id="BaseScreen">
			<View className="flex h-full items-center justify-center">
				<Text className="text-center text-4xl">Expo Template</Text>
			</View>
		</Container>
	)
}

export default Screen
