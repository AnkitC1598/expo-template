import { useColorScheme } from "react-native";
import colors from "tailwindcss/colors";

type ColorName = keyof typeof colors;
type ColorShade = keyof (typeof colors)[ColorName];

export const tailwindToHex = (className: string): string => {
	const colorScheme = useColorScheme();

	const classParts = className.split(" ");
	const lightClass = classParts.find((c) => !c.startsWith("dark:"));
	const darkClass = classParts.find((c) => c.startsWith("dark:"));

	const getHexOpacity = (colorClass: string): string => {
		const opacityMatch = colorClass.match(/\/(\d+)/);
		const opacity = opacityMatch ? parseInt(opacityMatch[1], 10) : 100;
		if (opacity !== 100) {
			return Math.round((opacity / 100) * 255)
				.toString(16)
				.padStart(2, "0");
		}
		return "";
	};

	const parseColorFromClass = (
		colorClass: string,
	): { colorName?: ColorName; colorShade?: ColorShade } => {
		const colorMatch = colorClass.match(/(\w+)-(\w+)(?:-(\d+))?/);
		if (colorMatch) {
			const [, , color, shade] = colorMatch;
			return {
				colorName: color as ColorName,
				colorShade: shade as unknown as ColorShade,
			};
		}

		return {};
	};

	const parseColorClass = (colorClass: string): string => {
		const hexOpacity = getHexOpacity(colorClass);
		const { colorName, colorShade } = parseColorFromClass(colorClass);
		let finalColor = "#000000"; // Default color if parsing fails or color not found

		if (colorName) {
			if (colorShade && colors[colorName]?.[colorShade]) {
				finalColor = colors[colorName][colorShade];
			} else if (colors[colorName]) {
				finalColor = colors[colorName] as string;
			}
		}

		return finalColor + hexOpacity;
	};

	const lightColor = lightClass ? parseColorClass(lightClass) : "#000000";
	const darkColor = darkClass
		? parseColorClass(darkClass.replace("dark:", ""))
		: lightColor;

	return colorScheme === "dark" ? darkColor : lightColor;
};

export const hexToRgb = (hex: string): string => {
	// Remove the leading # if present
	hex = hex.replace(/^#/, "");

	// Parse the hex string to get the RGB values
	const bigint = parseInt(hex, 16);
	let r: number, g: number, b: number;

	if (hex.length === 3) {
		// Handle shorthand hex format (#fff)
		r = (bigint >> 8) & 0xf;
		g = (bigint >> 4) & 0xf;
		b = bigint & 0xf;

		// Convert to full 8-bit values
		r = (r << 4) | r;
		g = (g << 4) | g;
		b = (b << 4) | b;
	} else if (hex.length === 6) {
		// Handle full hex format (#ffffff)
		r = (bigint >> 16) & 0xff;
		g = (bigint >> 8) & 0xff;
		b = bigint & 0xff;
	} else {
		throw new Error(`Invalid hex color format: ${hex}`);
	}

	return [r, g, b].join(",");
};

export const rgbToRgba = (
	color: [number, number, number] | string,
	alpha: number,
): string => {
	// Ensure the alpha value is between 0 and 1
	if (alpha < 0) {
		alpha = 0;
	}
	if (alpha > 1) {
		alpha = 1;
	}

	const stringToRgbArray = (str: string): [number, number, number] =>
		str.split(",").map(Number) as [number, number, number];

	let rgbValues: [number, number, number];
	if (Array.isArray(color)) {
		rgbValues = color;
	} else if (color.startsWith("#")) {
		// Convert hex color to RGB
		rgbValues = stringToRgbArray(hexToRgb(color));
	} else if (
		/^(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5]),(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5]),(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])$/.test(
			color,
		)
	) {
		rgbValues = stringToRgbArray(color) as [number, number, number];
	} else {
		throw new Error(`Invalid color format: ${color}`);
	}

	// Return the RGBA color string
	return rgbValues.join(",") + `,${alpha}`;
};

export const tailwindToRgb = (className: string): string =>
	hexToRgb(tailwindToHex(className));

export const tailwindToRgba = (className: string, alpha: number): string =>
	rgbToRgba(hexToRgb(tailwindToHex(className)), alpha);

export const hexToRgba = (hex: string, alpha: number): string =>
	rgbToRgba(hexToRgb(hex), alpha);
