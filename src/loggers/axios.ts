// import * as Sentry from "@sentry/react-native"
import { format } from "date-fns"
import { type LogColorizer, logColor } from "."

class AxiosLogger {
	private formatTimestamp(): string {
		return format(new Date(), "HH:mm:ss")
	}

	private formatTag(type: "request" | "response"): string {
		return `[${type === "request" ? "Request" : "Response"}]`.padEnd(12)
	}

	private formatMethod(method: string): string {
		return this.methodColor(method)(method.padEnd(6))
	}

	private formatStatus(statusCode: number | null): string {
		if (!statusCode) {
			return "-".padEnd(7)
		}
		return this.statusColor(statusCode)(
			String(statusCode).padEnd(3)
		).padEnd(15)
	}

	private formatDuration(duration: number | null): string {
		if (!duration) {
			return "-".padEnd(6)
		}
		return this.durationColor(duration)(`${duration}ms`.padEnd(7)).padEnd(7)
	}

	private methodColor(method: string): LogColorizer {
		switch (method.toUpperCase()) {
			case "GET":
				return logColor.cyan
			case "POST":
				return logColor.green
			case "PUT":
				return logColor.blue
			case "DELETE":
				return logColor.red
			case "PATCH":
				return logColor.yellow
			case "HEAD":
				return logColor.gray
			case "OPTIONS":
				return logColor.magenta
			default:
				return logColor.white
		}
	}

	private statusColor(status: number): LogColorizer {
		switch (true) {
			case status >= 100 && status < 200:
				return logColor.magenta
			case status >= 200 && status < 300:
				return logColor.green
			case status >= 300 && status < 400:
				return logColor.cyan
			case status >= 400 && status < 500:
				return logColor.yellow
			case status >= 500:
				return logColor.red
			default:
				return logColor.white
		}
	}

	private durationColor(ms: number): LogColorizer {
		switch (true) {
			case ms < 300:
				return logColor.green
			case ms < 800:
				return logColor.yellow
			case ms < 1500:
				return logColor.magenta
			default:
				return logColor.red
		}
	}

	logEvent(
		level: "info" | "success" | "error",
		context: {
			type: "request" | "response"
			status?: string | number
			method: string
			url: string
			duration?: number
			headers?: Record<string, string>
			error?: any
			body?: any
			instanceName?: string
		}
	) {
		const timestamp = this.formatTimestamp()
		const tag = this.formatTag(context.type)
		const rawMethod = context.method.toUpperCase()
		const statusCode =
			context.status !== undefined ? Number(context.status) : null
		const duration = context.duration ?? null

		const method = this.formatMethod(rawMethod)
		const status = this.formatStatus(statusCode)
		const time = this.formatDuration(duration)
		const message = `${timestamp} ${tag} ${method} ${status} ${time} ${context.url}`

		// this.logToSentry(context, level, rawMethod, statusCode, duration)

		console.log(
			level === "error" && context.error
				? `${message}\n${JSON.stringify(context.body, null, 4)}`
				: message
		)
	}

	// private logToSentry(
	// 	context: {
	// 		type: "request" | "response"
	// 		url: string
	// 		status?: string | number
	// 		error?: any
	// 		body?: any
	// 		instanceName?: string
	// 	},
	// 	level: "info" | "success" | "error",
	// 	method: string,
	// 	statusCode: number | null,
	// 	duration: number | null
	// ) {
	// 	const durationStr = duration ? `${duration}ms` : ""

	// 	Sentry.addBreadcrumb({
	// 		category: "http",
	// 		message: `[${context.type}] ${method} ${statusCode ?? ""} ${durationStr} ${context.url}`,
	// 		level: level === "error" ? "error" : "info",
	// 	})

	// 	if (level === "error" && context.error) {
	// 		Sentry.captureException(context.error, {
	// 			tags: {
	// 				api_instance: context.instanceName,
	// 				status: String(context.status),
	// 				method,
	// 			},
	// 			extra: context.body,
	// 		})
	// 	}
	// }
}

export default AxiosLogger
