import type { Primitive, Context, ContextValue } from "@kimzuni/templify";
import type { PrimitiveDataType, DataItem } from "@/types/playground";
import { generateUUID } from "./random";



export const resolveDataValue = (type: PrimitiveDataType, value: string | undefined): Primitive => {
	switch (type) {
		case "string":
			return value ?? "";
		case "number": {
			const num = Number(value);
			return isNaN(num) ? 0 : num;
		}
		case "boolean":
			return value === "true";
		case "null":
			return null;
		default:
			return undefined;
	}
};



export const stringToNumber = (value = "") => {
	return value.replace(/[^0-9]/g, "");
};



export const updateItemInTree = (list: DataItem[], id: string, updates: Partial<DataItem>): DataItem[] => {
	return list.map((item) => {
		if (item.id === id) {
			const updatedItem = { ...item, ...updates };
			const values = { ...(updatedItem.values ?? {}) };
			if ("value" in updates) {
				values[updatedItem.type] = updates.value;
			}
			updatedItem.values = values;
			return updatedItem;
		}
		if (item.children) {
			return { ...item, children: updateItemInTree(item.children, id, updates) };
		}
		return item;
	});
};



export const removeItemFromTree = (list: DataItem[], id: string): DataItem[] => {
	return list
		.filter(item => item.id !== id)
		.map((item) => {
			if (item.children) {
				return { ...item, children: removeItemFromTree(item.children, id) };
			}
			return item;
		});
};



export const addChildToItemInTree = (list: DataItem[], parentId: string, newItem: DataItem): DataItem[] => {
	return list.map((item) => {
		if (item.id === parentId) {
			return {
				...item,
				children: [...(item.children ?? []), newItem],
			};
		}
		if (item.children) {
			return { ...item, children: addChildToItemInTree(item.children, parentId, newItem) };
		}
		return item;
	});
};



export const buildContext = (items: DataItem[], rootType: "object" | "array" = "object") => {
	const resolveItem = (item: DataItem): ContextValue => {
		switch (item.type) {
			case "array": {
				if (!item.children) return [];
				return item.children
					.map(child => resolveItem(child))
					.filter(val => val !== undefined);
			}
			case "object": {
				if (!item.children) return {};
				const obj: Context = {};
				for (const child of item.children) {
					if (child.key) {
						const val = resolveItem(child);
						if (val !== undefined) {
							obj[child.key] = val;
						}
					}
				}
				return obj;
			}
			default:
				return resolveDataValue(item.type, item.value);
		}
	};

	if (rootType === "array") {
		return items
			.map(item => resolveItem(item))
			.filter(val => val !== undefined);
	}

	const ctx: Context = {};
	for (const item of items) {
		if (!item.key.trim()) continue;
		ctx[item.key] = resolveItem(item);
	}
	return ctx;
};



export const sanitizeDataItem = (item: DataItem): DataItem => {
	const cleanItem: DataItem = {
		id   : item.id,
		key  : item.key,
		type : item.type,
		value: item.value,
	};
	if (item.children) {
		cleanItem.children = item.children.map(sanitizeDataItem);
	}
	return cleanItem;
};

export const sanitizeDataItems = (items: DataItem[]): DataItem[] => {
	return items.map(sanitizeDataItem);
};



const valueToDataItem = (key: string, val: unknown): DataItem => {
	const id = generateUUID();

	if (val === null) {
		return { id, key, type: "null" };
	}
	if (val === undefined) {
		return { id, key, type: "undefined" };
	}
	if (typeof val === "boolean") {
		return { id, key, type: "boolean", value: val ? "true" : "false" };
	}
	if (typeof val === "number") {
		return { id, key, type: "number", value: String(val) };
	}
	if (typeof val === "string") {
		return { id, key, type: "string", value: val };
	}
	if (Array.isArray(val)) {
		return {
			id,
			key,
			type    : "array",
			children: val.map((item, idx) => valueToDataItem(String(idx), item)),
		};
	}
	if (typeof val === "object") {
		return {
			id,
			key,
			type    : "object",
			children: Object.entries(val).map(([k, v]) => valueToDataItem(k, v)),
		};
	}
	return { id, key, type: "undefined" };
};

export const parseContextToDataItems = (data: unknown): {
	rootType: "object" | "array";
	items   : DataItem[];
} => {
	if (typeof data !== "object" || data === null) {
		throw new Error("Root JSON value must be an object or an array.");
	}

	if (Array.isArray(data)) {
		return {
			rootType: "array",
			items   : data.map((item, idx) => valueToDataItem(String(idx), item)),
		};
	}

	return {
		rootType: "object",
		items   : Object.entries(data).map(([k, v]) => valueToDataItem(k, v)),
	};
};
