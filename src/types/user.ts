import type { JwtPayload } from "jwt-decode"

export interface User {
	_id: string
	uid: string
	createdAt: string
	updatedAt: string
	fullname: string
	firstname: string
	lastname: string
	dob: string
	email: string
	username: string
	description: string
	profileImage: string
	gender: string
	mobile: {
		countryCode: string
		phoneNumber: string
		numberWithCountryCode: string
		isVerified: boolean
	}
	notificationsEnabled: boolean
}

export interface IToken extends JwtPayload {
	orgId: string
	uid: string
}

export interface IAccessToken extends IToken {
	email: string
	name: string
	roles: {
		_id: string
		id: string
		type: string
		permissions: string[]
	}[]
}
