import AxiosLogger from "@/loggers/axios"
import { getToken, setTokens } from "@/services/token"
import useAppStore from "@/store"
import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios"

const DEFAULT_TIMEOUT = 5000
const DEFAULT_TIMEOUT_ERROR_MESSAGE = "Oops! Network is unstable. Please retry."

const INSTANCE_CONFIGURATIONS = {
	basic: { suffix: "WithBasicToken", options: { withBasicToken: true } },
	token: { suffix: "WithToken", options: {} },
	default: {
		suffix: "WithoutToken",
		options: { withResponseInterceptors: true },
	},
}

export interface CreateInstanceConfig {
	name: string
	baseURL: string
	refreshTokenCallback?: (refreshToken: string) => Promise<any>
	accessPath?: string
	timeout?: number
	timeoutErrorMessage?: string
	token?: string | null
}

interface GetInstanceOptions {
	type?: "basic" | "token" | "default"
}

class AxiosManager {
	private logger = new AxiosLogger()
	private instances: Record<string, AxiosInstance> = {}
	private refreshTokenCallback?: (refreshToken: string) => Promise<any>
	private accessPath?: string
	private isRefreshing = false
	private refreshSubscribers: ((success: boolean) => void)[] = []
	private customTokens: Record<string, string | null> = {}

	createInstance({
		name,
		baseURL,
		refreshTokenCallback,
		accessPath,
		timeout = DEFAULT_TIMEOUT,
		timeoutErrorMessage = DEFAULT_TIMEOUT_ERROR_MESSAGE,
		token = null,
	}: CreateInstanceConfig): void {
		if (!name || typeof name !== "string" || name.trim().length === 0) {
			throw new Error("Instance name must be a non-empty string.")
		}
		if (
			!baseURL ||
			typeof baseURL !== "string" ||
			baseURL.trim().length === 0
		) {
			throw new Error("Base URL must be a non-empty string.")
		}

		this.accessPath = accessPath
		this.refreshTokenCallback = refreshTokenCallback
		this.customTokens[name] = token

		const axiosConfig: AxiosRequestConfig = {
			baseURL,
			headers: { "Content-Type": "application/json" },
			timeout,
			timeoutErrorMessage,
		}

		const createInstanceWithInterceptors = (
			config: AxiosRequestConfig,
			options: {
				withBasicToken?: boolean
				withResponseInterceptors?: boolean
			} = {}
		): AxiosInstance => {
			const { withBasicToken = false, withResponseInterceptors = true } =
				options
			const instance = axios.create(config)

			instance.interceptors.request.use(cfg =>
				this.requestInterceptor(cfg, withBasicToken, name)
			)

			if (withResponseInterceptors) {
				instance.interceptors.response.use(
					res => this.responseSuccessInterceptor(res, name),
					err => this.responseErrorInterceptor(err, name)
				)
			}

			return instance
		}

		Object.values(INSTANCE_CONFIGURATIONS).forEach(
			({ suffix, options }) => {
				this.instances[`${name}${suffix}`] =
					createInstanceWithInterceptors(axiosConfig, options)
			}
		)
	}

	private async requestInterceptor(
		config: InternalAxiosRequestConfig<unknown>,
		withBasicToken = false,
		instanceName: string
	): Promise<InternalAxiosRequestConfig<unknown>> {
		const token = this.customTokens[instanceName]
			? this.customTokens[instanceName]
			: await getToken(withBasicToken ? "basicAccess" : "access")

		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`
		}
		;(config as any).metadata = { startTime: new Date() }

		this.logger.logEvent("info", {
			type: "request",
			method: config.method?.toUpperCase() ?? "UNKNOWN",
			url: config.url || "No URL",
		})

		return config
	}

	private responseSuccessInterceptor(
		response: AxiosResponse,
		instanceName: string
	): AxiosResponse {
		const metadata = (response.config as any).metadata
		const endTime = new Date()
		const duration =
			metadata && metadata.startTime
				? endTime.getTime() - new Date(metadata.startTime).getTime()
				: undefined
		this.logger.logEvent("success", {
			type: "response",
			status: response.status,
			method: response.config.method?.toUpperCase() ?? "UNKNOWN",
			url: response.config.url ?? "No URL",
			duration,
			instanceName,
		})

		return response
	}

	private async responseErrorInterceptor(
		error: any,
		instanceName: string
	): Promise<AxiosResponse> {
		const originalConfig = error.config as any
		const parsedBody = this.safeParseJSON(originalConfig?.data)

		const startTime = originalConfig?.metadata?.startTime
		const duration = startTime
			? new Date().getTime() - new Date(startTime).getTime()
			: undefined

		const sanitizedError = this.sanitizeErrorMessage(
			error,
			originalConfig,
			parsedBody
		)

		this.logger.logEvent("error", {
			type: "response",
			status: sanitizedError.status,
			method: sanitizedError.method,
			url: sanitizedError.url,
			duration,
			body: sanitizedError,
			error,
			instanceName,
		})

		if (originalConfig._retry) {
			return Promise.reject(error)
		}
		originalConfig._retry = true

		const isAccessPath = this.isAccessPath(originalConfig?.url)
		const isUnauthorized = error.response?.status === 401

		if (isAccessPath || !isUnauthorized) {
			return Promise.reject(error)
		}

		try {
			await this.queueTokenRefresh()
			return this.getInstance(instanceName).request(originalConfig)
		} catch (e) {
			return Promise.reject(e)
		}
	}

	private sanitizeErrorMessage(
		error: any,
		originalConfig: any,
		parsedBody: any
	): {
		message: string
		response: any
		name: string
		code: string
		status: string
		url: string
		method: string
		headers?: Record<string, unknown>
		body: any
	} {
		const safeGet = (path: any, fallback: any) => path ?? fallback

		const message = safeGet(
			error?.response?.data?.results?.data?.error,
			safeGet(
				error?.response?.data?.results?.data?.message,
				safeGet(
					error?.response?.data?.results?.message,
					safeGet(error?.message, "No message")
				)
			)
		)

		return {
			message,
			response: safeGet(error?.response?.data?.results, "No response"),
			name: safeGet(error?.name, "No name"),
			code: safeGet(error?.code, "No code"),
			status: safeGet(error?.response?.status, "No status"),
			url: `${safeGet(originalConfig?.baseURL, "")}${safeGet(originalConfig?.url, "No URL")}`,
			method: safeGet(originalConfig?.method?.toUpperCase(), "No method"),
			headers: safeGet(originalConfig?.headers, {}),
			body: safeGet(parsedBody, "No body"),
		}
	}

	private async queueTokenRefresh(): Promise<void> {
		if (this.isRefreshing) {
			return new Promise<void>((resolve, reject) => {
				this.refreshSubscribers.push((success: boolean) => {
					if (success) {
						resolve()
					} else {
						reject(new Error("Token refresh failed"))
					}
				})
			})
		}

		this.isRefreshing = true
		try {
			await this.refreshAccessToken()
			this.refreshSubscribers.forEach(callback => callback(true))
		} catch (err) {
			this.refreshSubscribers.forEach(callback => callback(false))
			throw err
		} finally {
			this.refreshSubscribers = []
			this.isRefreshing = false
		}
	}

	private async refreshAccessToken(): Promise<string> {
		if (!this.refreshTokenCallback) {
			this.handleLogout()
			throw new Error("refreshTokenCallback is missing.")
		}

		const refreshToken = await getToken("refresh")
		if (!refreshToken) {
			this.handleLogout()
			throw new Error("Refresh token is missing.")
		}

		try {
			const response = await this.refreshTokenCallback(refreshToken)
			const jwt = response?.data?.results?.data?.jwt
			const rToken = response?.data?.results?.data?.refreshToken

			if (!jwt || !rToken) {
				throw new Error("Invalid token response")
			}

			await setTokens({ access: jwt, refresh: rToken })
			return jwt
		} catch (err) {
			this.handleLogout()
			throw err
		}
	}

	private handleLogout(): void {
		useAppStore.getState().dispatch({ type: "RESET" })
	}

	private safeParseJSON(data: any): any {
		if (typeof data === "string") {
			try {
				return JSON.parse(data)
			} catch {
				return "Invalid JSON"
			}
		}
		return data ?? "No body"
	}

	private isAccessPath(url: string): boolean {
		if (!this.accessPath) {
			return false
		}

		try {
			const targetPath = new URL(this.accessPath).pathname
			const currentPath = new URL(url, "http://dummy-base").pathname

			return currentPath === targetPath
		} catch {
			return false
		}
	}

	getInstance(name: string, options: GetInstanceOptions = {}): AxiosInstance {
		const { type = "default" } = options
		const instanceKey = `${name}${INSTANCE_CONFIGURATIONS[type].suffix}`
		const instance = this.instances[instanceKey]

		if (!instance) {
			throw new Error(`Instance "${instanceKey}" does not exist.`)
		}

		return instance
	}
}

export default AxiosManager
