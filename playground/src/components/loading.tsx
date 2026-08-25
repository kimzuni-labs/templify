import { Loader2 } from "lucide-react";



export function Loading() {
	return (
		<div className="my-12 mx-auto w-fit">
			<Loader2 size={36} className="animate-spin"/>
		</div>
	);
}
