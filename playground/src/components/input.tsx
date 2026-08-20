import { cn } from "@/lib/utils";

import { Input as Base } from "@/components/ui/input";



export interface InputProps extends React.ComponentProps<typeof Base> {
}

export function Input({
	className,
	...props
}: InputProps) {
	return (
		<Base
			className={cn("font-mono disabled:pointer-events-auto aria-invalid:text-destructive", className)}
			{...props}
		/>
	);
}
