import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal,
} from "@gorhom/bottom-sheet"
import * as React from "react"

import { useColorScheme } from "@/hooks/useColorScheme"

const Sheet = React.forwardRef<
	BottomSheetModal,
	React.ComponentPropsWithoutRef<typeof BottomSheetModal> & {
		closable?: boolean
		hideHandle?: boolean
	}
>(
	(
		{
			index = 0,
			backgroundStyle,
			style,
			handleIndicatorStyle,
			closable = true,
			hideHandle = false,
			...props
		},
		ref
	) => {
		const { colors } = useColorScheme()

		const renderBackdrop = React.useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					disappearsOnIndex={-1}
					pressBehavior={closable ? "close" : "none"}
				/>
			),
			[]
		)
		return (
			<BottomSheetModal
				ref={ref}
				index={0}
				backgroundStyle={
					backgroundStyle ?? {
						backgroundColor: colors.card,
					}
				}
				style={
					style ?? {
						borderWidth: 1,
						borderColor: colors.grey5,
						borderTopStartRadius: 16,
						borderTopEndRadius: 16,
					}
				}
				handleStyle={!closable || hideHandle ? { display: "none" } : {}}
				handleIndicatorStyle={
					handleIndicatorStyle ?? {
						backgroundColor: colors.grey4,
					}
				}
				backdropComponent={renderBackdrop}
				{...props}
				{...(closable
					? {}
					: {
							enablePanDownToClose: false,
							enableDismissOnClose: false,
							enableHandlePanningGesture: false,
							enableContentPanningGesture: false,
						})}
			/>
		)
	}
)

function useSheetRef() {
	return React.useRef<BottomSheetModal>(null)
}

export { Sheet, useSheetRef }
