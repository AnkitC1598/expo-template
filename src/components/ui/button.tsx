import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { Pressable, Text } from "react-native"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
	"inline-flex items-center justify-center transition-colors",
	{
		variants: {
			variant: {
				default:
					"bg-neutral-950 hover:bg-neutral-950/90 dark:bg-white dark:hover:bg-white/90",
				destructive:
					"bg-red-50 border border-red-600/10 dark:bg-red-400/10 dark:border-red-400/20",
				outline:
					"border border-neutral-200 bg-white hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800",
				secondary:
					"bg-neutral-100 hover:bg-neutral-100/80 dark:bg-neutral-800 dark:hover:bg-neutral-800/80",
				ghost: "hover:bg-neutral-100 dark:hover:bg-neutral-800",
				link: "",
			},
			size: {
				default: "h-10 px-4 py-2",
				xs: "h-7 px-2",
				sm: "h-9 px-3",
				lg: "h-12 px-8",
				icon: "h-10 w-10",
			},
			rounded: {
				true: "rounded-full",
				false: "",
			},
			disabled: {
				true: "cursor-not-allowed opacity-50",
				false: "cursor-pointer opacity-100",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			rounded: true,
			disabled: false,
		},
		compoundVariants: [
			{
				size: "icon",
				class: "p-0",
			},
		],
	}
)

const buttonTextVariants = cva(
	"whitespace-nowrap text-sm font-medium transition-colors",
	{
		variants: {
			variant: {
				default: "text-neutral-50 dark:text-neutral-900",
				destructive: "text-red-700 dark:text-red-400",
				outline: "hover:text-neutral-900 dark:hover:text-neutral-50",
				secondary: "text-neutral-900 dark:text-neutral-50",
				ghost: "hover:text-neutral-900 dark:hover:text-neutral-50",
				link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
)

interface ButtonProps
	extends React.ComponentPropsWithoutRef<typeof Pressable>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
	disabled?: boolean
	labelClassName?: string
	children: React.ReactNode | string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			labelClassName,
			asChild = false,
			children,
			className,
			variant,
			size,
			rounded,
			disabled,
			...props
		},
		_ref
	) => {
		return (
			<Pressable
				className={cn(
					buttonVariants({
						variant,
						size,
						rounded,
						disabled,
						className,
					})
				)}
				{...props}
			>
				{asChild || size === "icon" ? (
					children
				) : (
					<Text
						className={cn(
							buttonTextVariants({
								variant,
								className: labelClassName,
							})
						)}
					>
						{children}
					</Text>
				)}
			</Pressable>
		)
	}
)
Button.displayName = "Button"

export default Button
