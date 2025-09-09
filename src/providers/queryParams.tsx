import useAppStore from "@/store"
import { useLocalSearchParams } from "expo-router"
import { useEffect } from "react"

const QueryParamsProvider = () => {
	const searchParams = useLocalSearchParams() as Record<string, string>

	const dispatch = useAppStore(store => store.dispatch)

	useEffect(() => {
		dispatch({
			type: "SET_STATE",
			payload: { queryParams: searchParams },
		})

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams])

	return null
}

export default QueryParamsProvider
