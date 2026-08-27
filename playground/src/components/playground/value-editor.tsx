import type { DataType } from "@/types/playground";
import { stringToNumber } from "@/lib/tree-utils";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/select";

import { Input } from "./fields";



export interface ValueSelectProps {
	type          : DataType;
	items         : DataType[];
	value?        : string | undefined;
	values?       : Partial<Record<DataType, string>>;
	onValueChange?: (
		nextType: DataType,
		nextValue: string | undefined,
		nextValues: Partial<Record<DataType, string>>,
	) => void;

	className?: string;
	invalid?  : boolean;
}

export function ValueSelect({
	type,
	items,
	value,
	values = {},
	onValueChange,
	className,
	invalid,
}: ValueSelectProps) {
	const handleValueChange = (val: DataType | null) => {
		if (!val) return;

		const nextValues = { ...values };
		nextValues[type] = value;
		const savedVal = nextValues[val];

		let nextValue: string | undefined;
		if (savedVal !== undefined) {
			nextValue = savedVal;
		} else {
			// initial default value for the new type
			switch (val) {
				case "boolean":
					nextValue = "false";
					break;
				case "null":
				case "undefined":
				case "array":
				case "object":
					nextValue = undefined;
					break;
				default:
					nextValue = "";
					break;
			}
		}
		onValueChange?.(val, nextValue, nextValues);
	};

	return (
		<Select
			value={type}
			onValueChange={handleValueChange}
		>
			<SelectTrigger
				className={className}
				aria-invalid={invalid}
			>
				<SelectValue/>
			</SelectTrigger>
			<SelectContent side="bottom" align="end">
				<SelectGroup>
					{items.map(item => (
						<SelectItem key={item} value={item}>{item}</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}



export interface ValueInputProps {
	type         : DataType;
	value        : string | undefined;
	onValueChange: (nextValue: string) => void;
	className?   : string;
	invalid?     : boolean;
}

export function ValueInput({
	type,
	value,
	onValueChange,
	className,
	invalid,
}: ValueInputProps) {
	let disabled: boolean;
	switch (type) {
		case "null":
		case "undefined":
		case "string":
			disabled = type !== "string";
			return (
				<Input
					type="text"
					value={disabled ? type : value}
					onChange={e => onValueChange(e.target.value)}
					placeholder="value"
					className={className}
					disabled={disabled}
					aria-invalid={invalid}
				/>
			);
		case "number":
			return (
				<Input
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					value={value}
					onChange={e => onValueChange(stringToNumber(e.target.value))}
					placeholder="0"
					className={className}
					aria-invalid={invalid}
				/>
			);
		case "boolean":
			return (
				<Select
					value={value ?? "false"}
					onValueChange={(val: string | null) => onValueChange(val ?? "false")}
				>
					<SelectTrigger
						className={className}
						aria-invalid={invalid}
					>
						<SelectValue/>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="true">true</SelectItem>
							<SelectItem value="false">false</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			);
	}

	return null;
}
