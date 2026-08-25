import { InfoIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { HoverCard, type HoverCardProps } from "@/components/hover-card";



export interface TooltipProps extends Partial<HoverCardProps> {
}

export function Tooltip({
	className,
	...props
}: TooltipProps) {
	return (
		<HoverCard
			side="top"
			align="center"
			sideOffset={8}
			alignOffset={0}
			delay={0}
			closeDelay={0}
			label={<InfoIcon className="opacity-70" size={12}/>}
			className={cn(
				"cursor-help",
				className,
			)}
			{...props}
		/>
	);
}
