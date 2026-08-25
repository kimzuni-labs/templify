import { cn } from "@/lib/utils";

import { Alert } from "@/components/ui/alert";



export interface ErrorBoxProps extends React.ComponentProps<typeof Alert> {
	label  : string;
	message: string;
}

export function ErrorBox({
	label,
	message,
	className,
	children,
	...props
}: ErrorBoxProps) {
	return (
		<Alert
			variant="destructive"
			className={cn("mx-auto w-fit text-center", className)}
			{...props}
		>
			<h2 className="mb-2 text-base">{label}</h2>
			<p>{message}</p>
		</Alert>
	);
}
