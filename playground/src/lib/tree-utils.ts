import type { Primitive, Context, ContextValue } from "@kimzuni/templify";
import type { PrimitiveDataType, DataItem } from "@/types/playground";



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
