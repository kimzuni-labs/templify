export type DataType = "string" | "number" | "boolean" | "null" | "array" | "object" | "undefined";

export type PrimitiveDataType = Exclude<DataType, "array" | "object">;

export interface DataItem {
	id       : string;
	key      : string;
	type     : DataType;
	value?   : string;
	children?: DataItem[];
	values?  : Partial<Record<DataType, string>>;
}

export interface LabeledValue<V extends string = string> {
	label: string;
	value: V;
}
