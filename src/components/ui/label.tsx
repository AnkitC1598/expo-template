"use client"

import { cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Text } from "react-native"

const labelVariants = cva(
	"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-600 dark:text-neutral-400"
)

interface LabelProps extends React.ComponentPropsWithoutRef<typeof Text> {
	className?: string
}

const Label = React.forwardRef<Text, LabelProps>(
	({ className, children, ...props }, _ref) => (
		<Text className={cn(labelVariants(), className)} {...props}>
			{children}
		</Text>
	)
)
Label.displayName = "Label"

export default Label
