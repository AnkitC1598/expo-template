// import { logout } from "@/actions/auth"
import { addMinutes, fromUnixTime, isBefore } from "date-fns";
import { jwtDecode } from "jwt-decode";
import Storage from "./storage";

// Token keys to manage the token-specific logic
export type TokenKey = "basicAccess" | "access" | "refresh";

// Token-specific cookie keys
const cookieKeys: Record<TokenKey, string> = {
	basicAccess: "basicAccess",
	access: "access",
	refresh: "refresh",
};

// Decode a JWT token to determine its expiration time
function getJwtExpiration(token: string): {
	exp: number | null;
	formatted: Date | null;
} {
	const decoded: { exp: number | null } = jwtDecode(token);
	return {
		exp: decoded.exp,
		formatted: decoded.exp ? fromUnixTime(decoded.exp) : null,
	};
}

// Check if a token is expiring soon (e.g., within 10 minutes)
async function isTokenExpiringSoon(
	token: string,
	minutes: number = 10,
): Promise<boolean> {
	try {
		const { exp } = getJwtExpiration(token);
		if (!exp) {
			return false;
		}

		const isExpiringSoon = isBefore(
			new Date(exp * 1000),
			addMinutes(new Date(), minutes),
		);

		if (isExpiringSoon) {
			await removeTokens();
		}
		return isExpiringSoon;
	} catch (error) {
		console.error("Invalid token:", error);
		await removeTokens();
		return true;
	}
}

// Update a specific token value and notify observers
async function updateToken(
	tokenType: TokenKey,
	token: string | null,
): Promise<void> {
	const key = cookieKeys[tokenType];

	try {
		if (token) {
			await Storage.setItem(key, token);
		} else {
			await Storage.removeItem(key);
		}
	} catch (error) {
		console.error(`Failed to update token (${key}):`, error);
	}
}

// Get a specific token by type
async function getToken(tokenType: TokenKey): Promise<string | null> {
	try {
		return await Storage.getItem(cookieKeys[tokenType]);
	} catch (error) {
		console.error(`Failed to get token (${tokenType}):`, error);
		return null;
	}
}

// Retrieve all managed tokens
async function getTokens(): Promise<Record<TokenKey, string | null>> {
	return {
		basicAccess: await getToken("basicAccess"),
		access: await getToken("access"),
		refresh: await getToken("refresh"),
	};
}

// Set multiple tokens at once
async function setTokens(
	tokens: Partial<Record<TokenKey, string | null>>,
): Promise<void> {
	await Promise.all([
		updateToken("basicAccess", tokens.basicAccess ?? null),
		updateToken("access", tokens.access ?? null),
		updateToken("refresh", tokens.refresh ?? null),
	]);
}

// Remove all tokens
async function removeTokens(): Promise<void> {
	await Promise.all(
		Object.keys(cookieKeys).map(async (key) =>
			updateToken(key as TokenKey, null),
		),
	);
}

// Export the functional API
export {
	getJwtExpiration,
	getToken,
	getTokens,
	isTokenExpiringSoon,
	removeTokens,
	setTokens,
	updateToken,
};
