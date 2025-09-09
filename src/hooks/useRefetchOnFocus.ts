import { QueryKey, useQueryClient } from "@tanstack/react-query"
import { useFocusEffect } from "expo-router"
import { useCallback, useRef } from "react"

const useRefetchOnFocus = (queryKey: QueryKey) => {
	const queryClient = useQueryClient()
	const fetched = useRef(false)

	useFocusEffect(
		useCallback(() => {
			if (fetched.current) {
				queryClient.refetchQueries({ queryKey, exact: true })
			} else {
				fetched.current = true
			}
		}, [])
	)
}

export default useRefetchOnFocus
