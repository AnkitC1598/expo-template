import { type ClassValue, clsx } from "clsx";
import { differenceInMonths, differenceInYears, startOfMonth } from "date-fns";
import { twMerge } from "tailwind-merge";

// Type for getType function
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const getType = (val: unknown): string =>
	Object.prototype.toString.call(val).slice(8, -1).toLowerCase();

export const getAcronym = (str: string) =>
	str
		.split(" ")
		.map((n) => n[0])
		.join("");

export const getProgress = (
	value: number | null | undefined,
	total: number | null | undefined,
) => {
	value = value ?? 0;
	total = total ?? 0;

	if (total) {
		return parseFloat(((value / total) * 100).toFixed(2));
	}
	return 0;
};

export const getPaddedValue = (
	val: number | string,
	size: number = 2,
): string => val?.toString().padStart(size, "0") ?? "0";

export const formatNumber = (num: string | number): string =>
	Number(parseInt(num.toString())).toLocaleString("en-IN");

export const compressNumber = (
	number: number = 0,
	precision: number = 1,
): string => {
	if (getType(number) !== "Number") {
		return number.toString();
	}

	const units = [
		{ value: 1e18, symbol: "E" },
		{ value: 1e15, symbol: "P" },
		{ value: 1e12, symbol: "T" },
		{ value: 1e9, symbol: "G" },
		{ value: 1e6, symbol: "M" },
		{ value: 1e3, symbol: "k" },
		{ value: 1, symbol: "" },
	];

	const match = units.find(({ value }) => number >= value);

	if (!match) {
		return "0";
	}

	const formatted = (number / match.value).toFixed(precision);
	return parseFloat(formatted).toString() + match.symbol;
};

export const formatAmount = (
	amount: number | string,
	decimal: number = 2,
): string => {
	if (amount === 0) {
		return "0";
	}
	const number = Number(amount);
	return number.toLocaleString("en-IN", {
		style: "currency",
		currency: "INR",
		minimumFractionDigits: decimal,
		maximumFractionDigits: decimal,
	});
};

export const formatDateDiff = ({
	startDate,
	endDate,
	full,
}: {
	startDate: string;
	endDate?: string;
	full?: boolean;
}) => {
	if (!startDate) {
		return "-";
	}

	const start = startOfMonth(new Date(startDate));
	const end = startOfMonth(endDate ? new Date(endDate) : new Date());

	const years = differenceInYears(end, start);
	const months = differenceInMonths(end, start) % 12;

	const yearLabel = full ? ` year${years !== 1 ? "s" : ""}` : "yr";
	const monthLabel = full ? ` month${months !== 1 ? "s" : ""}` : "m";

	const parts = [
		years > 0 ? `${years}${yearLabel}` : null,
		months > 0 ? `${months}${monthLabel}` : null,
	].filter(Boolean);

	if (parts.length === 0) {
		return null;
	}

	return parts.join(", ");
};

export const remove = (
	values: (string | number | { [key: string]: unknown })[],
	option: string | number | { [key: string]: unknown },
	key: string = "_id",
): (string | number | { [key: string]: unknown })[] => {
	const optionKey = typeof option === "object" ? option[key] : option;
	return values.filter(
		(val) => (typeof val === "object" ? val[key] : val) !== optionKey,
	);
};

export const addOrRemove = (
	values: (string | number | { [key: string]: unknown })[],
	option: string | number | { [key: string]: unknown },
	key: string = "_id",
): (string | number | { [key: string]: unknown })[] => {
	const optionKey = typeof option === "object" ? option[key] : option;
	const valueKeys = values.map((val) =>
		typeof val === "object" ? val[key] : val,
	);

	return valueKeys.includes(optionKey)
		? remove(values ?? [], option, key)
		: [...values, option];
};

export const extractUsername = (string: string): string => {
	const regexMap: { [key: string]: RegExp } = {
		facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9._]+)\/?/i,
		instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/i,
		linkedin:
			/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9._-]+)\/?/i,
		twitter: /(?:https?:\/\/)?(?:www\.)?x\.com\/([a-zA-Z0-9._]+)\/?/i,
		github: /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9._-]+)\/?/i,
	};

	for (const platform in regexMap) {
		const match = string.match(regexMap[platform]);
		if (match) {
			return match[1];
		}
	}

	return string;
};

export const splitToChunks = (
	arr: unknown[],
	parts: number = 2,
	minItemsPerChunk: number = 4,
): unknown[][] => {
	const extendedArr = Array.from(
		{ length: parts * minItemsPerChunk },
		(_, i) => arr[i % arr.length],
	);
	return Array.from({ length: parts }, (_, i) =>
		extendedArr.slice(i * minItemsPerChunk, (i + 1) * minItemsPerChunk),
	);
};

export const sleep = (delay: number = 1000) =>
	new Promise((resolve) => setTimeout(resolve, delay));

export const removeEmojis = (string: string) => {
	const regex =
		/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
	return string.replace(regex, "");
};

export const paddedValue = ({
	string,
	length = 2,
	char = "0",
	pos = "start",
}: {
	string: string | number;
	length?: number;
	char?: string;
	pos?: "start" | "end";
}) => {
	const val: string = String(string);
	const padFn = pos === "start" ? "padStart" : "padEnd";

	return val[padFn](length, char);
};

export const mask = ({
	email,
	phone,
}: {
	email?: string;
	phone?: string;
}): string | undefined => {
	const value = email || phone;
	const type = email ? "email" : "phone";

	if (!value) {
		return value;
	}

	switch (type) {
		case "email": {
			const [name, domain] = value.split("@");
			const { length: len } = name;
			const maskedAddress = name[0] + "*".repeat(len - 2) + name[len - 1];
			return maskedAddress + "@" + domain;
		}
		case "phone": {
			const padStart = value.slice(0, -4).length;
			return "*".repeat(padStart) + value.slice(-4);
		}
		default:
			return value;
	}
};

export const parseMD = (md: string): string => md.replaceAll(/\\n/g, "\n");

export const generateRandomString = (
	length: number,
	format:
		| "uppercase"
		| "lowercase"
		| "number"
		| "alphanumeric" = "alphanumeric",
): string => {
	const charSets = {
		uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		lowercase: "abcdefghijklmnopqrstuvwxyz",
		number: "0123456789",
		alphanumeric:
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
	};

	const characters = charSets[format];
	return Array.from(
		{ length },
		() => characters[Math.floor(Math.random() * characters.length)],
	).join("");
};

export const getNestedValue = <T>(obj: T, keys: string[]): unknown =>
	keys.reduce(
		(acc, key) =>
			acc && typeof acc === "object"
				? (acc as Record<string, unknown>)[key]
				: undefined,
		obj as unknown,
	);

export const getDuration = (seconds: number) => {
	if (seconds < 60) {
		return `< ${Math.ceil(seconds / 60)}min`;
	}

	const h = Math.floor(seconds / 3600),
		m = Math.floor((seconds % 3600) / 60);
	return `${h ? `${h}hr ` : ""}${m ? `${m}min` : ""}`.trim();
};

export const generatePrompt = ({
	template,
	values,
}: {
	template: string;
	values: Record<string, unknown>;
}) =>
	template
		?.split("`")
		?.map((temp) => (temp.startsWith("$") ? values[temp.slice(1)] : temp))
		?.join("") ?? "";

export const humanFileSize = (bytes: number, decimalPoint: number = 2) => {
	if (bytes === 0) {
		return "0 B";
	}
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const size = parseFloat((bytes / k ** i).toFixed(decimalPoint));
	return `${size} ${sizes[i]}`;
};

export const getRandom = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomFromArray = <T>({
	arr,
	count = 1,
}: {
	arr: T[];
	count?: number;
}): T[] | [] => {
	if (!arr?.length) {
		return [];
	}

	const n = Math.min(Math.max(count, 1), arr.length);
	const items = Array.from(
		{ length: n },
		() => arr[Math.floor(Math.random() * arr.length)],
	);

	return items;
};

export const tryAsync = async (
	fn: () => Promise<void>,
	successMsg = "Success",
	errorMsg = "Error occurred:",
) => {
	try {
		await fn();
		console.log(successMsg);
	} catch (err) {
		console.error(errorMsg, err);
	}
};

export const IndexToAlphabet = (index: number): string =>
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ"[((index % 26) + 26) % 26];

export const chunkArray = <T = unknown>(arr: T[], groupSize = 4): T[][] =>
	arr.reduce((acc, curr, i) => {
		(acc[Math.floor(i / groupSize)] ??= []).push(curr);
		return acc;
	}, [] as T[][]);

export const splitArray = <T>(a: T[], n: number): T[][] => {
	let i = 0;
	return Array.from({ length: n }, (_, s) =>
		a.slice(i, (i += Math.floor(a.length / n) + (s < a.length % n ? 1 : 0))),
	);
};
