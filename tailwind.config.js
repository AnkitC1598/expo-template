const { hairlineWidth } = require("nativewind/theme")

/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			borderWidth: {
				hairline: hairlineWidth(),
			},
			fontSize: {
				"3xs": ["0.5rem", { lineHeight: "0.5rem" }],
				"2xs": ["0.625rem", { lineHeight: "0.75rem" }],
			},
		},
	},
	plugins: [],
}
