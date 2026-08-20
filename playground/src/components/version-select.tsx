import type { Side, Align } from "@base-ui/react/internals/useAnchorPositioning";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import type * as config from "@/versions/config";



export interface VersionSelectProps {
	side?                : Side;
	align?               : Align;
	alignItemWithTrigger?: boolean;
	value                : config.VersionInfo;
	items                : config.VersionInfo[];
	onValueChange        : (value: config.VersionInfo) => void;
}

export function VersionSelect({
	side = "bottom",
	align = "end",
	alignItemWithTrigger = false,
	onValueChange,
	...props
}: VersionSelectProps) {
	const { items } = props;

	const handleValueChange = (val: config.VersionInfo | null) => {
		if (val) {
			onValueChange(val);
		}
	};

	return (
		<Select onValueChange={handleValueChange} {...props}>
			<SelectTrigger
				className="border-0 bg-transparent! gap-1 cursor-pointer not-disabled:hover:text-primary **:[svg]:text-inherit"
				disabled={items.length === 1}
			>
				<SelectValue/>
			</SelectTrigger>
			<SelectContent
				side={side}
				align={align}
				alignItemWithTrigger={alignItemWithTrigger}
			>
				<SelectGroup>
					{items.map(item => (
						<SelectItem key={item.value} value={item} className="cursor-pointer">
							{item.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
