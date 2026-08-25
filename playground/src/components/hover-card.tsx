import type { Side, Align } from "@base-ui/react/internals/useAnchorPositioning";

import { HoverCard as Base, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";



export interface HoverCardProps extends React.ComponentProps<typeof Base> {
	side?       : Side;
	align?      : Align;
	sideOffset? : number;
	alignOffset?: number;
	delay?      : number;
	closeDelay? : number;
	label       : React.ReactNode;
	className?  : string;
	children?   : React.ReactNode;
}

export function HoverCard({
	side,
	align,
	sideOffset,
	alignOffset,
	delay,
	closeDelay,
	label,
	className,
	children,
	...props
}: HoverCardProps) {
	return (
		<Base {...props}>
			<HoverCardTrigger
				delay={delay}
				closeDelay={closeDelay}
				className={className}
			>{label}</HoverCardTrigger>
			<HoverCardContent side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
				{children}
			</HoverCardContent>
		</Base>
	);
}
