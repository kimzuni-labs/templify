export interface SectionProps extends React.ComponentProps<"section"> {
	heading: string;
}

export function Section({
	heading,
	children,
	...props
}: SectionProps) {
	return (
		<section {...props}>
			<h2 className="opacity-70 font-medium">{heading}</h2>
			<div>
				{children}
			</div>
		</section>
	);
}
