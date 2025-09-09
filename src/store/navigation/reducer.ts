import { initialNavigationState } from "@/constants/store"
import { NavigationStoreState } from "@/types/store"
import { produce } from "immer"

export const reducer = (
	state: NavigationStoreState,
	{ type, payload }: { type: string; payload?: unknown }
) => {
	switch (type) {
		case "SET_NAVIGATION_STATE":
			return produce(state, draft => {
				const { key, value } = payload as {
					key: string
					value: Record<string, unknown>
				}
				if (!draft[key]) {
					draft[key] = {}
				}
				Object.assign(draft[key], value)
			})
		case "REMOVE_NAVIGATION_STATE":
			return produce(state, draft => {
				const { key } = payload as { key: string }
				if (draft[key]) {
					delete draft[key]
				}
			})
		case "CLEAR_NAVIGATION_STATE":
			return initialNavigationState
		default:
			return state
	}
}
