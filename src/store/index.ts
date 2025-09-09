import { initialAppState } from "@/constants/store";
import Storage from "@/services/storage";
import { create } from "zustand";
import {
	createJSONStorage,
	devtools,
	persist,
	redux,
} from "zustand/middleware";
import { reducer } from "./reducer";

const useAppStore = create(
	devtools(
		persist(redux(reducer, initialAppState), {
			name: "appStore",
			storage: createJSONStorage(() => Storage),
		}),
		{
			name: "AppStore",
		},
	),
);

export default useAppStore;
