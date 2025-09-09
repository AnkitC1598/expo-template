import { cn } from "@/lib/utils"
import { View } from "react-native"

const Separator = ({ className }: { className?: string }) => {
	return (
		<>
			<View
				className={cn(
					"h-px w-full bg-neutral-300 dark:bg-neutral-700",
					className
				)}
			/>
		</>
	)
}

export default Separator
