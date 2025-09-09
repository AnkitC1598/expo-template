import { type VariantProps, cva } from "class-variance-authority"
import { Text, View } from "react-native"

import { cn } from "@/lib/utils"

export const badgeVariants = cva(
	"items-center justify-center gap-1 rounded-full h-8 border px-3 py-1",
	{
		variants: {
			variant: {
				transparent:
					"bg-transparent border-transparent dark:bg-transparent",
				slate: "bg-slate-50 border-slate-500/10 dark:bg-slate-400/10 dark:border-slate-400/20",
				gray: "bg-gray-50 border-gray-500/10 dark:bg-gray-400/10 dark:border-gray-400/20",
				zinc: "bg-zinc-50 border-zinc-500/10 dark:bg-zinc-400/10 dark:border-zinc-400/20",
				neutral:
					"bg-white border-neutral-500/10 dark:bg-neutral-400/10 dark:border-neutral-400/20",
				stone: "bg-stone-50 border-stone-500/10 dark:bg-stone-400/10 dark:border-stone-400/20",
				red: "bg-red-50 border-red-600/10 dark:bg-red-400/10 dark:border-red-400/20",
				rose: "bg-rose-50 border-rose-600/10 dark:bg-rose-400/10 dark:border-rose-400/20",
				orange: "bg-orange-50 border-orange-600/20 dark:bg-orange-400/10 dark:border-orange-400/20",
				amber: "bg-amber-50 border-amber-600/20 dark:bg-amber-400/10 dark:border-amber-400/20",
				yellow: "bg-yellow-50 border-yellow-600/20 dark:bg-yellow-400/10 dark:border-yellow-400/20",
				lime: "bg-lime-50 border-lime-600/20 dark:bg-lime-500/10 dark:border-lime-500/20",
				green: "bg-green-50 border-green-600/20 dark:bg-green-500/10 dark:border-green-500/20",
				emerald:
					"bg-emerald-50 border-emerald-600/20 dark:bg-emerald-500/10 dark:border-emerald-500/20",
				teal: "bg-teal-50 border-teal-600/20 dark:bg-teal-500/10 dark:border-teal-500/20",
				cyan: "bg-cyan-50 border-cyan-700/10 dark:bg-cyan-400/10 dark:border-cyan-400/30",
				sky: "bg-sky-50 border-sky-700/10 dark:bg-sky-400/10 dark:border-sky-400/30",
				blue: "bg-blue-50 border-blue-700/10 dark:bg-blue-400/10 dark:border-blue-400/30",
				indigo: "bg-indigo-50 border-indigo-700/10 dark:bg-indigo-400/10 dark:border-indigo-400/30",
				violet: "bg-violet-50 border-violet-700/10 dark:bg-violet-400/10 dark:border-violet-400/30",
				purple: "bg-purple-50 border-purple-700/10 dark:bg-purple-400/10 dark:border-purple-400/30",
				fuchsia:
					"bg-fuchsia-50 border-fuchsia-700/10 dark:bg-fuchsia-400/10 dark:border-fuchsia-400/30",
				pink: "bg-pink-50 border-pink-700/10 dark:bg-pink-400/10 dark:border-pink-400/20",
				black: "bg-black border-black/10 dark:bg-black/20 dark:border-black/30",
				white: "bg-white border-white/10 dark:bg-white/20 dark:border-white/30",
			},
		},
		compoundVariants: [
			{
				variant: "transparent",
				class: "p-0",
			},
		],
		defaultVariants: {
			variant: "neutral",
		},
	}
)

export const badgeTextVariants = cva("font-medium whitespace-nowrap text-sm", {
	variants: {
		variant: {
			transparent: "text-neutral-600 dark:text-neutral-400",
			slate: "text-neutral-600 dark:text-neutral-400",
			gray: "text-neutral-600 dark:text-neutral-400",
			zinc: "text-zinc-600 dark:text-zinc-400",
			neutral: "text-neutral-600 dark:text-neutral-400",
			stone: "text-stone-600 dark:text-stone-400",
			red: "text-red-700 dark:text-red-400",
			rose: "text-rose-700 dark:text-rose-400",
			orange: "text-orange-800 dark:text-orange-500",
			amber: "text-amber-800 dark:text-amber-500",
			yellow: "text-yellow-800 dark:text-yellow-500",
			lime: "text-lime-700 dark:text-lime-400",
			green: "text-green-700 dark:text-green-400",
			emerald: "text-emerald-700 dark:text-emerald-400",
			teal: "text-teal-700 dark:text-teal-400",
			cyan: "text-cyan-700 dark:text-cyan-400",
			sky: "text-sky-700 dark:text-sky-400",
			blue: "text-blue-700 dark:text-blue-400",
			indigo: "text-indigo-700 dark:text-indigo-400",
			violet: "text-violet-700 dark:text-violet-400",
			purple: "text-purple-700 dark:text-purple-400",
			fuchsia: "text-fuchsia-700 dark:text-fuchsia-400",
			pink: "text-pink-700 dark:text-pink-400",
			black: "text-white dark:text-white",
			white: "text-black dark:text-black",
		},
	},
	defaultVariants: {
		variant: "neutral",
	},
})

export interface BadgeProps
	extends React.ComponentPropsWithoutRef<typeof View>,
		VariantProps<typeof badgeVariants> {
	label: string | number
	capitalize?: boolean
	labelClassName?: string
}

const Badge = ({
	label,
	variant,
	className,
	labelClassName,
	capitalize = true,
	children,
	...props
}: BadgeProps) => {
	return (
		<View className={cn(badgeVariants({ variant, className }))} {...props}>
			<Text
				className={cn(
					badgeTextVariants({ variant }),
					capitalize && "capitalize",
					labelClassName
				)}
			>
				{label}
			</Text>
		</View>
	)
}

export default Badge
