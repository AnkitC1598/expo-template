// storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { KeyValuePair } from "@react-native-async-storage/async-storage/lib/typescript/types"
import { Platform } from "react-native"

const isWeb = Platform.OS === "web"
const hasLocalStorage =
	typeof window !== "undefined" && typeof window.localStorage !== "undefined"

const Storage = {
	async getItem(key: string): Promise<string | null> {
		if (isWeb) {
			if (!hasLocalStorage) {
				return null
			}
			try {
				return Promise.resolve(localStorage.getItem(key))
			} catch (error) {
				console.error(`localStorage.getItem error [${key}]`, error)
				return null
			}
		}
		return AsyncStorage.getItem(key)
	},

	async setItem(key: string, value: string): Promise<void> {
		if (isWeb) {
			if (!hasLocalStorage) {
				return
			}
			try {
				localStorage.setItem(key, value)
				return Promise.resolve()
			} catch (error) {
				console.error(`localStorage.setItem error [${key}]`, error)
				return Promise.reject(error)
			}
		}
		return AsyncStorage.setItem(key, value)
	},

	async removeItem(key: string): Promise<void> {
		if (isWeb) {
			if (!hasLocalStorage) {
				return
			}
			try {
				localStorage.removeItem(key)
				return Promise.resolve()
			} catch (error) {
				console.error(`localStorage.removeItem error [${key}]`, error)
				return Promise.reject(error)
			}
		}
		return AsyncStorage.removeItem(key)
	},

	async clear(): Promise<void> {
		if (isWeb) {
			if (!hasLocalStorage) {
				return
			}
			try {
				localStorage.clear()
				return Promise.resolve()
			} catch (error) {
				console.error("localStorage.clear error", error)
				return Promise.reject(error)
			}
		}
		return AsyncStorage.clear()
	},

	async getAllKeys(): Promise<readonly string[]> {
		if (isWeb) {
			if (!hasLocalStorage) {
				return []
			}
			try {
				const keys: readonly string[] = Object.keys(localStorage)
				return Promise.resolve(keys)
			} catch (error) {
				console.error("localStorage.getAllKeys error", error)
				return []
			}
		}
		return AsyncStorage.getAllKeys()
	},

	async multiRemove(keys: string[]): Promise<void> {
		if (isWeb) {
			if (!hasLocalStorage) {
				return
			}
			try {
				keys.forEach(key => localStorage.removeItem(key))
				return Promise.resolve()
			} catch (error) {
				console.error("localStorage.multiRemove error", error)
				return Promise.reject(error)
			}
		}
		return AsyncStorage.multiRemove(keys)
	},

	async multiSet(pairs: [string, string][]): Promise<void> {
		if (isWeb) {
			if (!hasLocalStorage) {
				return
			}
			try {
				pairs.forEach(([key, value]) =>
					localStorage.setItem(key, value)
				)
				return Promise.resolve()
			} catch (error) {
				console.error("localStorage.multiSet error", error)
				return Promise.reject(error)
			}
		}
		return AsyncStorage.multiSet(pairs)
	},

	async multiGet(keys: readonly string[]): Promise<readonly KeyValuePair[]> {
		if (isWeb) {
			if (!hasLocalStorage) {
				return []
			}
			try {
				const results: readonly KeyValuePair[] = keys.map(key => [
					key,
					localStorage.getItem(key),
				])
				return Promise.resolve(results)
			} catch (error) {
				console.error("localStorage.multiGet error", error)
				return []
			}
		}
		return AsyncStorage.multiGet(keys)
	},
}

export default Storage
