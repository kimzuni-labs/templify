import * as React from "react";
import { PlusIcon } from "lucide-react";

import type { LabeledValue } from "@/types/playground";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TabsContent as BaseTabsContent } from "@/components/ui/tabs";
import {
	FieldSet as BaseFieldSet,
	FieldLegend as BaseFieldLegend,
	FieldLabel as BaseFieldLabel,
	Field,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/select";
import { Input as BaseInput } from "@/components/input";
import { Tooltip as BaseTooltip, type TooltipProps as BaseTooltipProps } from "@/components/tooltip";



export interface InputProps extends React.ComponentProps<typeof BaseInput> {
}

export function Input({
	className,
	...props
}: InputProps) {
	return (
		<BaseInput
			className={cn("dark:disabled:bg-transparent!", className)}
			{...props}
		/>
	);
}



export interface TooltipProps extends Omit<BaseTooltipProps, "label"> {
}

export function Tooltip(props: TooltipProps) {
	return (
		<BaseTooltip
			className="absolute right-0 top-1"
			{...props}
		/>
	);
}



export interface FieldSetProps extends React.ComponentProps<typeof BaseFieldSet> {
}

export function FieldSet({
	className,
	...props
}: FieldSetProps) {
	return (
		<BaseFieldSet
			className={cn("relative w-full", className)}
			{...props}
		/>
	);
}



export interface FieldLegendProps extends React.ComponentProps<typeof BaseFieldLegend> {
	description?: React.ReactNode;
}

export function FieldLegend({
	description,
	children,
	...props
}: FieldLegendProps) {
	return (
		<BaseFieldLegend {...props}>
			{children}
			{description && <Tooltip>{description}</Tooltip>}
		</BaseFieldLegend>
	);
}



export interface FieldLabelProps extends React.ComponentProps<typeof BaseFieldLabel> {
	description?: React.ReactNode;
}

export function FieldLabel({
	description,
	className,
	children,
	...props
}: FieldLabelProps) {
	return (
		<BaseFieldLabel
			className={cn("relative empty:hidden", className)}
			{...props}
		>
			{children}
			{description && <Tooltip>{description}</Tooltip>}
		</BaseFieldLabel>
	);
}



interface OptionFieldProps {
	orientation?   : "horizontal" | "vertical";
	label          : string;
	invalid?       : boolean;
	fieldClassName?: string;
}



export interface OptionInputProps extends React.ComponentProps<typeof Input>, OptionFieldProps {
	description?: React.ReactNode;
}

export function OptionInput({
	label,
	description,
	orientation = "vertical",
	invalid,
	fieldClassName,
	className,
	...props
}: OptionInputProps) {
	return (
		<Field
			orientation={orientation}
			data-disabled={props.disabled}
			data-invalid={invalid}
			className={fieldClassName}
		>
			<FieldLabel htmlFor={props.id} description={description}>{label}</FieldLabel>
			<Input
				className={cn(
					"text-foreground",
					className,
				)}
				aria-invalid={invalid}
				{...props}
			/>
		</Field>
	);
}



export interface OptionSelectProps<
	Value extends LabeledValue,
> extends React.ComponentProps<typeof Select<Value, false>>, OptionFieldProps {
	items: Value[];
}

export function OptionSelect<Value extends LabeledValue>({
	label,
	orientation = "vertical",
	invalid,
	fieldClassName,
	...props
}: OptionSelectProps<Value>) {
	return (
		<Field
			orientation={orientation}
			data-disabled={props.disabled}
			data-invalid={invalid}
			className={fieldClassName}
		>
			<FieldLabel htmlFor={props.id} className="cursor-pointer">{label}</FieldLabel>
			<Select {...props}>
				<SelectTrigger aria-invalid={invalid}>
					<SelectValue/>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{props.items.map(item => (
							<SelectItem key={item.value} value={item}>{item.label}</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	);
}



export interface OptionCheckboxProps extends React.ComponentProps<typeof Checkbox>, OptionFieldProps {
	description?: string;
}

export function OptionCheckbox({
	label,
	description,
	orientation = "horizontal",
	invalid,
	fieldClassName,
	className,
	children,
	...props
}: OptionCheckboxProps) {
	return (
		<Field
			orientation={orientation}
			data-disabled={props.disabled}
			data-invalid={invalid}
			className={cn("flex items-center gap-2", fieldClassName)}
		>
			<Checkbox
				className={cn(
					"cursor-pointer data-disabled:cursor-not-allowed",
					className,
				)}
				aria-invalid={invalid}
				{...props}
			/>
			<FieldLabel
				htmlFor={props.id}
				description={description}
				className="cursor-pointer group-data-disabled/field:cursor-not-allowed"
			>
				{label}
			</FieldLabel>
			{children}
		</Field>
	);
}



export interface AddButtonProps extends React.ComponentProps<typeof Button> {
	label: string;
}

export function AddButton({
	label,
	className,
	...props
}: AddButtonProps) {
	return (
		<Button
			variant="outline"
			className={cn("text-xs cursor-pointer", className)}
			{...props}
		>
			<PlusIcon size={16}/>
			{label}
		</Button>
	);
}



export interface TabsContentProps extends React.ComponentProps<typeof BaseTabsContent> {
}

export function TabsContent({
	className,
	...props
}: TabsContentProps) {
	return (
		<BaseTabsContent
			className={cn(
				"bg-card p-4 rounded-xl ring-1 ring-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50",
				className,
			)}
			{...props}
		/>
	);
}
