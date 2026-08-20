import { useEffect } from "react";
import { Trash2Icon } from "lucide-react";

import type { DataType, DataItem } from "@/types/playground";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Input, AddButton } from "./fields";
import { ValueSelect, ValueInput } from "./value-editor";



export interface DataItemRowProps {
	item       : DataItem;
	depth      : number;
	parentType?: DataType;
	index?     : number;
	onUpdate   : (id: string, updates: Partial<DataItem>) => void;
	onRemove   : (id: string) => void;
	onAddChild : (parentId: string, type: DataType) => void;
}

export function DataItemRow({
	item,
	depth,
	parentType,
	index,
	onUpdate,
	onRemove,
	onAddChild,
}: DataItemRowProps) {
	// if parentType is array, key should be index
	useEffect(() => {
		if (parentType === "array" && index !== undefined && item.key !== String(index)) {
			onUpdate(item.id, { key: String(index) });
		}
	}, [parentType, index, item.key, item.id, onUpdate]);

	const handleSelectChange = (
		nextType: DataType,
		nextValue: string | DataItem[] | undefined,
		nextValues: Partial<Record<DataType, string>>,
	) => {
		const updates: Partial<DataItem> = {
			type  : nextType,
			values: nextValues,
		};
		if (!nextValue || typeof nextValue === "string") {
			updates.children = undefined;
			updates.value = nextValue;
		} else {
			updates.children = nextValue;
			updates.value = undefined;
		}
		onUpdate(item.id, updates);
	};

	return (
		<div className="flex flex-col gap-2 w-full">
			<div className="flex items-center gap-2 p-2 border rounded-lg">
				<div className="flex-1 flex flex-wrap items-center gap-2">
					<Input
						value={parentType === "array" ? `[${index}]` : item.key}
						onChange={e => onUpdate(item.id, { key: e.target.value })}
						placeholder="key"
						className="flex-1"
						disabled={parentType === "array"}
					/>

					<ValueSelect
						type={item.type}
						items={["string", "number", "boolean", "null", "array", "object", "undefined"]}
						value={item.value}
						values={item.values}
						onValueChange={handleSelectChange}
						className="w-32"
					/>

					<ValueInput
						type={item.type}
						value={item.value}
						onValueChange={nextValue => onUpdate(item.id, { value: nextValue })}
						className="w-full"
					/>

					{(item.type === "array" || item.type === "object") && (
						<div className="w-full flex items-center-safe gap-2">
							<p className="flex-1 px-2 font-medium text-muted-foreground text-xs">
								Length: {item.children?.length ?? 0}
							</p>
							<AddButton
								className="w-32"
								label="Add Child"
								onClick={() => onAddChild(item.id, "string")}
							/>
						</div>
					)}
				</div>

				<Button
					variant="ghost"
					onClick={() => onRemove(item.id)}
					className="cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10!"
					aria-label="Delete data item"
				>
					<Trash2Icon size={16}/>
				</Button>
			</div>

			{(item.type === "array" || item.type === "object") && item.children && (
				<div className="flex flex-col gap-2 ml-2 pl-3 border-l-2 border-dashed">
					{item.children.map((child, idx) => (
						<DataItemRow
							key={child.id}
							item={child}
							depth={depth + 1}
							parentType={item.type}
							index={idx}
							onUpdate={onUpdate}
							onRemove={onRemove}
							onAddChild={onAddChild}
						/>
					))}
					{item.children.length === 0 && (
						<Alert className="border-0 italic">
							<AlertDescription>No child items.</AlertDescription>
						</Alert>
					)}
				</div>
			)}
		</div>
	);
}
