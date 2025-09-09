import Storage from "@/services/storage";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import {
	PersistQueryClientProvider,
	persistQueryClient,
} from "@tanstack/react-query-persist-client";
import { useEffect } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";

interface QueryProviderProps {
	children: React.ReactNode;
	defaultOptions?: QueryClientConfig["defaultOptions"];
}

export let queryClient: QueryClient;
export let asyncStoragePersister: ReturnType<
	typeof createAsyncStoragePersister
>;

const QueryProvider = ({ children, defaultOptions }: QueryProviderProps) => {
	queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				gcTime: 1000 * 60 * 60 * 24, // Default 24 hours
				staleTime: 1000 * 60, // Default 1 minute
				retry: 0,
				...defaultOptions?.queries,
			},
		},
	});

	asyncStoragePersister = createAsyncStoragePersister({
		storage: Storage,
	});

	useEffect(() => {
		const handleAppStateChange = (nextAppState: AppStateStatus) => {
			if (nextAppState === "inactive" || nextAppState === "background") {
				const [, persistPromise] = persistQueryClient({
					persister: asyncStoragePersister,
					queryClient,
				});

				persistPromise.catch((error) => {
					console.error("Failed to persist React Query cache:", error);
				});
			}
		};

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange,
		);
		return () => subscription.remove();
	}, []);

	return (
		<>
			{Platform.OS !== "web" && typeof window !== "undefined" && (
				<ReactQueryDevTools queryClient={queryClient} />
			)}
			<PersistQueryClientProvider
				client={queryClient}
				persistOptions={{ persister: asyncStoragePersister }}
				onSuccess={() => {
					queryClient
						.resumePausedMutations()
						.then(() => queryClient.invalidateQueries());
				}}
			>
				{children}
			</PersistQueryClientProvider>
		</>
	);
};

export default QueryProvider;

const ReactQueryDevTools = ({ queryClient }: { queryClient: QueryClient }) => {
	useReactQueryDevTools(queryClient);
	return null;
};
