import { SvgProps } from "react-native-svg"

export interface HTMLStyle {
	[key: string]: string | number
}

export interface StyledSvgProp extends SvgProps {
	style?: HTMLStyle
	className?: string
	stroke?: string
	fill?: string
}

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export type Unique<T extends any[]> = T extends [infer F, ...infer R]
	? F extends R[number]
		? never
		: [F, ...Unique<R>]
	: T

export type DeepEqual<T> = T extends object
	? { [K in keyof T]: DeepEqual<T[K]> }
	: T
