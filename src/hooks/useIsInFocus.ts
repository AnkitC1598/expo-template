import { useFocusEffect } from "@react-navigation/native"
import { useState } from "react"

const useIsInFocus = () => {
	const [isInFocus, setIsInFocus] = useState(false)

	useFocusEffect(() => {
		setIsInFocus(true)

		return () => {
			setIsInFocus(false)
		}
	})

	return { isInFocus }
}

export default useIsInFocus
