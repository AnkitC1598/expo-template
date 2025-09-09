import * as React from "react"

import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { TextInput } from "react-native"

const inputVariants = cva(
	"flex h-10 w-full rounded-md border border-neutral-200 bg-white text-sm text-neutral-900"
)

export interface InputProps
	extends React.ComponentPropsWithRef<typeof TextInput> {}

const Input = React.forwardRef<TextInput, InputProps>(
	({ className, ...props }, ref) => {
		return (
			<TextInput
				ref={ref}
				className={cn("px-4", inputVariants(), className)}
				{...props}
			/>
		)
	}
)

export default Input
