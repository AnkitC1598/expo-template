import { cn } from "@/lib/utils"
import React, { createContext, forwardRef, useContext } from "react"
import {
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
	FormProvider,
	useFormContext,
} from "react-hook-form"
import { Text, View } from "react-native"
import Label from "./label"

const Form = FormProvider

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName
}

const FormFieldContext = createContext<FormFieldContextValue>(
	{} as FormFieldContextValue
)

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	)
}

const useFormField = () => {
	const fieldContext = useContext(FormFieldContext)
	const itemContext = useContext(FormItemContext)
	const { getFieldState, formState } = useFormContext()

	const fieldState = getFieldState(fieldContext.name, formState)

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>")
	}

	const { id } = itemContext

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	}
}

type FormItemContextValue = {
	id: string
}

const FormItemContext = createContext<FormItemContextValue>(
	{} as FormItemContextValue
)

const FormItem = forwardRef<View, View["props"]>(
	({ className, ...props }, ref) => {
		const id = React.useId()

		return (
			<FormItemContext.Provider value={{ id }}>
				<View ref={ref} className={cn("gap-1", className)} {...props} />
			</FormItemContext.Provider>
		)
	}
)
FormItem.displayName = "FormItem"

const FormLabel = forwardRef<Text, Text["props"]>(
	({ className, ...props }, ref) => {
		const { error } = useFormField()

		return (
			<Label
				ref={ref}
				className={cn(className, error && "text-red-500")}
				{...props}
			/>
		)
	}
)
FormLabel.displayName = "FormLabel"

const FormControl = forwardRef<View, View["props"]>(
	({ children, ...props }, ref) => {
		const { error, formItemId, formDescriptionId, formMessageId } =
			useFormField()

		return (
			<View
				ref={ref}
				accessibilityLabel={formItemId}
				accessibilityHint={
					!error
						? formDescriptionId
						: `${formDescriptionId} ${formMessageId}`
				}
				{...props}
			>
				{children}
			</View>
		)
	}
)
FormControl.displayName = "FormControl"

const FormDescription = forwardRef<Text, Text["props"]>(
	({ className, ...props }, ref) => {
		const { formDescriptionId } = useFormField()

		return (
			<Text
				ref={ref}
				id={formDescriptionId}
				className={cn(
					"text-neutral-500 text-sm dark:text-neutral-400",
					className
				)}
				{...props}
			/>
		)
	}
)
FormDescription.displayName = "FormDescription"

const FormMessage = forwardRef<Text, Text["props"]>(
	({ className, children, ...props }, ref) => {
		const { error, formMessageId } = useFormField()
		const body = error
			? Array.isArray(error)
				? error.map(err => String(err?.message)).join(", ")
				: String(error?.message)
			: children

		if (!body) {
			return null
		}

		return (
			<Text
				ref={ref}
				id={formMessageId}
				className={cn("font-medium text-red-500 text-sm", className)}
				{...props}
			>
				{body}
			</Text>
		)
	}
)
FormMessage.displayName = "FormMessage"

export {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
}
