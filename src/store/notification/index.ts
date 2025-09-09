import { initialNotificationStore } from "@/constants/store";
import Storage from "@/services/storage";
import { create } from "zustand";
import {
	createJSONStorage,
	devtools,
	persist,
	redux,
} from "zustand/middleware";
import { reducer } from "./reducer";

const useNotificationStore = create(
	devtools(
		persist(redux(reducer, initialNotificationStore), {
			name: "notificationStore",
			storage: createJSONStorage(() => Storage),
		}),
		{
			name: "NotificationStore",
		},
	),
);

export default useNotificationStore;
