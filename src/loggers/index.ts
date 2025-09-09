import * as Device from "expo-device";

declare global {
	interface Console {
		json(obj: unknown): void;
	}
}

export const initLogger = async () => {
	// If not in development, disable console output
	if (!__DEV__) {
		console.log = console.warn = console.error = () => {};
		console.json = () => {};
		return;
	}

	const deviceType = Device.DeviceType[Device.deviceType!] || "Unknown";

	const parts = [Device.manufacturer, Device.modelName]
		.filter(Boolean)
		.join("-");

	const tag = Device.isDevice
		? `[${deviceType}${parts ? ` ${parts}` : ""}]`
		: `[Simulator${parts ? ` ${parts}` : ""}]`;

	const tagify =
		(original: (...args: unknown[]) => void) =>
		(...args: unknown[]) =>
			args.includes(tag) ? original(...args) : original(tag, ...args);

	console.log = tagify(console.log);
	console.warn = tagify(console.warn);
	console.error = tagify(console.error);

	console.json = (obj: unknown) => {
		try {
			console.log(JSON.stringify(obj, null, 4));
		} catch {
			console.error(tag, "console.json failed to stringify value");
		}
	};
};

// ANSI color/style codes
const ANSI = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
	italic: "\x1b[3m",
	underline: "\x1b[4m",
	inverse: "\x1b[7m",
	hidden: "\x1b[8m",
	strikethrough: "\x1b[9m",

	// Foreground colors
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	gray: "\x1b[90m",

	// Background colors
	bgBlack: "\x1b[40m",
	bgRed: "\x1b[41m",
	bgGreen: "\x1b[42m",
	bgYellow: "\x1b[43m",
	bgBlue: "\x1b[44m",
	bgMagenta: "\x1b[45m",
	bgCyan: "\x1b[46m",
	bgWhite: "\x1b[47m",
};

// Function to wrap text with ANSI codes
const colorize =
	(open: string, close: string = ANSI.reset) =>
	(text: unknown) =>
		`${open}${String(text)}${close}`;

// Core color/styling functions
const baseColors = {
	reset: colorize(ANSI.reset),
	bold: colorize(ANSI.bold),
	dim: colorize(ANSI.dim),
	italic: colorize(ANSI.italic),
	underline: colorize(ANSI.underline),
	inverse: colorize(ANSI.inverse),
	hidden: colorize(ANSI.hidden),
	strikethrough: colorize(ANSI.strikethrough),

	black: colorize(ANSI.black),
	red: colorize(ANSI.red),
	green: colorize(ANSI.green),
	yellow: colorize(ANSI.yellow),
	blue: colorize(ANSI.blue),
	magenta: colorize(ANSI.magenta),
	cyan: colorize(ANSI.cyan),
	white: colorize(ANSI.white),
	gray: colorize(ANSI.gray),

	bgBlack: colorize(ANSI.bgBlack),
	bgRed: colorize(ANSI.bgRed),
	bgGreen: colorize(ANSI.bgGreen),
	bgYellow: colorize(ANSI.bgYellow),
	bgBlue: colorize(ANSI.bgBlue),
	bgMagenta: colorize(ANSI.bgMagenta),
	bgCyan: colorize(ANSI.bgCyan),
	bgWhite: colorize(ANSI.bgWhite),
};

export type LogColorizer = (text: unknown) => string & typeof baseColors;

export const logColor = Object.keys(baseColors).reduce(
	(acc, key) => {
		const fn = baseColors[key as keyof typeof baseColors];
		const wrapper = (text: unknown) => fn(text);

		// Attach other styles as properties
		Object.entries(baseColors).forEach(([styleKey, styleFn]) => {
			Object.defineProperty(wrapper, styleKey, {
				value: (text: unknown) => styleFn(fn(text)),
				enumerable: false,
			});
		});

		acc[key as keyof typeof baseColors] = wrapper as LogColorizer;
		return acc;
	},
	{} as { [K in keyof typeof baseColors]: LogColorizer },
);
