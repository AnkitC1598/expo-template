import { useTrackingPermissions } from "expo-tracking-transparency"
import { useEffect } from "react"

const useGetTrackingPermissions = () => {
	const [status, requestPermission] = useTrackingPermissions()

	useEffect(() => {
		if (status && !status.granted && status.canAskAgain) {
			setTimeout(() => {
				requestPermission()
			}, 500)
		}
	}, [status])

	return null
}

export default useGetTrackingPermissions
