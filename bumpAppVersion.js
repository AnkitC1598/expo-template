const fs = require("fs")
const path = require("path")

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
const packageVersion = packageJson.version

// Helper function to check file existence
const fileExists = filename =>
	fs.existsSync(path.resolve(process.cwd(), filename))

// Update app.json
if (fileExists("app.json")) {
	const appJsonPath = path.resolve("app.json")
	const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"))
	if (!appJson.expo) {
		appJson.expo = {}
	}
	appJson.expo.version = packageVersion
	fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 4))
	console.log(`✅ Updated app.json to version ${packageVersion}`)

	// Update app.config.js or app.config.ts
} else if (fileExists("app.config.js") || fileExists("app.config.ts")) {
	const configFile = fileExists("app.config.js")
		? "app.config.js"
		: "app.config.ts"
	const configPath = path.resolve(configFile)
	const content = fs.readFileSync(configPath, "utf8")

	const updatedContent = content.replace(
		/version:\s*["']\d+\.\d+\.\d+["']/,
		`version: "${packageVersion}"`
	)

	fs.writeFileSync(configPath, updatedContent)
	console.log(`✅ Updated ${configFile} to version ${packageVersion}`)
} else {
	console.error(
		"❌ Error: No app.json, app.config.js, or app.config.ts found."
	)
	process.exit(1)
}
