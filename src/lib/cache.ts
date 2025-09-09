import * as FileSystem from "expo-file-system"

const MAX_CONCURRENT_DOWNLOADS = 3
const MAX_CACHE_FILES = 10
const MAX_CACHE_SIZE_MB = 150
const MAX_CACHE_SIZE_BYTES = MAX_CACHE_SIZE_MB * 1024 * 1024

let activeDownloads = 0
const downloadQueue: (() => Promise<void>)[] = []

export const appCachePath = FileSystem.cacheDirectory!

async function ensureDirExists() {
	const dirInfo = await FileSystem.getInfoAsync(appCachePath)
	if (!dirInfo.exists) {
		await FileSystem.makeDirectoryAsync(appCachePath, {
			intermediates: true,
		})
	}
}

async function getCacheSize(): Promise<{
	totalSize: number
	fileInfos: { path: string; size: number; modificationTime: number }[]
}> {
	const files = await FileSystem.readDirectoryAsync(appCachePath)
	let totalSize = 0

	const fileInfos = (
		await Promise.all(
			files.map(async file => {
				const path = `${appCachePath}/${file}`
				const fileInfo = await FileSystem.getInfoAsync(path)
				if (!fileInfo.exists) {
					return null
				} // Skip non-existing files

				totalSize += fileInfo.size

				return {
					path,
					size: fileInfo.size,
					modificationTime: fileInfo.modificationTime ?? 0, // Default to 0 if undefined
				}
			})
		)
	).filter(Boolean) as {
		path: string
		size: number
		modificationTime: number
	}[] // Remove null values

	return { totalSize, fileInfos }
}

async function enforceCacheLimitBySize() {
	let { totalSize, fileInfos } = await getCacheSize()

	if (totalSize < MAX_CACHE_SIZE_BYTES) {
		return
	}

	fileInfos.sort((a, b) => a.modificationTime - b.modificationTime)

	for (const { path, size } of fileInfos) {
		if (totalSize < MAX_CACHE_SIZE_BYTES) {
			break
		}

		await FileSystem.deleteAsync(path, { idempotent: true })
		totalSize -= size
	}
}

async function enforceCacheLimitByCount() {
	const { fileInfos } = await getCacheSize()

	if (fileInfos.length <= MAX_CACHE_FILES) {
		return
	}

	fileInfos.sort((a, b) => a.modificationTime - b.modificationTime)

	const filesToDelete = fileInfos.length - MAX_CACHE_FILES
	for (let i = 0; i < filesToDelete; i++) {
		await FileSystem.deleteAsync(fileInfos[i].path, { idempotent: true })
	}
}

const processQueue = async () => {
	if (
		activeDownloads >= MAX_CONCURRENT_DOWNLOADS ||
		downloadQueue.length === 0
	) {
		return
	}

	activeDownloads++
	const downloadTask = downloadQueue.shift()
	if (downloadTask) {
		await downloadTask()
	}
	activeDownloads--

	processQueue()
}

const queueDownload = (downloadTask: () => Promise<void>) => {
	downloadQueue.push(downloadTask)
	processQueue()
}

export const getCachedFile = async (
	url: string,
	enforceBy: "size" | "count" = "size"
): Promise<string | null> => {
	const filename = url.split("/").pop()

	await ensureDirExists()

	const fileUri = `${appCachePath.replace(/\/$/, "")}/${filename}`

	const fileInfo = await FileSystem.getInfoAsync(fileUri)
	if (fileInfo.exists) {
		return fileUri
	}

	queueDownload(async () => {
		try {
			if (enforceBy === "size") {
				await enforceCacheLimitBySize()
			} else {
				await enforceCacheLimitByCount()
			}
			await FileSystem.downloadAsync(url, fileUri)
		} catch (error) {
			console.warn(`Download failed: ${url}`, error)
		}
	})

	return url
}
