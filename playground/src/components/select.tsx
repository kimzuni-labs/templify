import { cn } from "@/lib/utils";

import type * as Base from "@/components/ui/select";
import {
	SelectItem as BaseSelectItem,
	SelectTrigger as BaseSelectTrigger,
} from "@/components/ui/select";



export {
	Select,
	SelectContent,
	SelectGroup,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectValue,
} from "@/components/ui/select";

export interface SelectProps extends React.ComponentProps<typeof Base.Select> {}
export interface SelectContentProps extends React.ComponentProps<typeof Base.SelectContent> {}
export interface SelectGroupProps extends React.ComponentProps<typeof Base.SelectGroup> {}
export interface SelectLabelProps extends React.ComponentProps<typeof Base.SelectLabel> {}
export interface SelectScrollDownButtonProps extends React.ComponentProps<typeof Base.SelectScrollDownButton> {}
export interface SelectScrollUpButtonProps extends React.ComponentProps<typeof Base.SelectScrollUpButton> {}
export interface SelectSeparatorProps extends React.ComponentProps<typeof Base.SelectSeparator> {}
export interface SelectValueProps extends React.ComponentProps<typeof Base.SelectValue> {}



export interface SelectTriggerProps extends React.ComponentProps<typeof Base.SelectTrigger> {}

export function SelectTrigger({
	className,
	...props
}: SelectTriggerProps) {
	return (
		<BaseSelectTrigger
			className={cn(
				"cursor-pointer text-foreground aria-invalid:text-destructive",
				className,
			)}
			{...props}
		/>
	);
}



export interface SelectItemProps extends React.ComponentProps<typeof Base.SelectItem> {}

export function SelectItem({
	className,
	...props
}: SelectItemProps) {
	return (
		<BaseSelectItem
			className={cn(
				"cursor-pointer",
				className,
			)}
			{...props}
		/>
	);
}
