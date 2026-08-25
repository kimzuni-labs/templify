import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";



export interface SectionProps extends React.ComponentProps<"section"> {
	collapsible?        : boolean;
	heading?            : React.ReactNode;
	afterScrollArea?    : React.ReactNode;
	sectionContentProps?: React.ComponentProps<"div">;
	collapsibleProps?   : Omit<React.ComponentProps<typeof Collapsible>, "render">;
}

export function Section({
	collapsible,
	heading,
	className,
	children,
	afterScrollArea,
	collapsibleProps: {
		onOpenChange,
		...collapsibleProps
	} = {},
	sectionContentProps,
	...props
}: SectionProps) {
	const [open, setOpen] = useState(false);

	const handleOpenChange: typeof onOpenChange = (...args) => {
		const [open] = args;
		setOpen(open);
		onOpenChange?.(...args);
	};

	return (
		<section
			className={cn(
				"flex flex-col",
				className,
			)}
			{...props}
		>
			<Card className="flex-1 h-full">
				<Collapsible
					open={collapsible ? open : true}
					onOpenChange={handleOpenChange}
					{...collapsibleProps}
					className={cn(
						"flex flex-col h-full",
						collapsibleProps.className,
					)}
					render={<CardContent className="px-0">
						{
							collapsible
								? (
									<CollapsibleTrigger
										render={<Button
											variant="ghost"
											className="px-(--card-spacing) relative bg-transparent! justify-start capitalize pr-9"
										>
											{heading}
											<ChevronDownIcon className="absolute right-4 group-data-panel-open/button:rotate-180"/>
										</Button>}
									/>
								)
								: (
									<div className="px-(--card-spacing) relative bg-transparent! justify-start capitalize text-muted-foreground leading-8 font-medium">
										{heading}
									</div>
								)
						}
						<CollapsibleContent className="flex-1 flex flex-col gap-2 min-h-0">
							<ScrollArea
								className={cn(
									"min-h-0 rounded-xl",
									"px-[calc(var(--card-spacing)/2)] *:data-[slot=scroll-area-viewport]:px-[calc(var(--card-spacing)/2)]",
									"*:data-[slot=scroll-area-viewport]:pt-2 *:data-[slot=scroll-area-viewport]:pb-1",
								)}
							>
								<div
									data-slot="section-content"
									{...sectionContentProps}
									className={cn(
										"flex flex-col items-start gap-4",
										sectionContentProps?.className,
									)}
								>
									{children}
								</div>
							</ScrollArea>
							<div className="px-(--card-spacing) empty:hidden">
								{afterScrollArea}
							</div>
						</CollapsibleContent>
					</CardContent>}
				/>
			</Card>
		</section>
	);
}
