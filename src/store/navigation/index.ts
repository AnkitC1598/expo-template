import { initialNavigationState } from "@/constants/store"
import { create } from "zustand"
import { devtools, redux } from "zustand/middleware"
import { reducer } from "./reducer"

const useNavigationStore = create(
	devtools(redux(reducer, initialNavigationState), {
		name: "NavigationStore",
	})
)

export default useNavigationStore
