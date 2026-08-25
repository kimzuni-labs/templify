import { SiGithub, SiNpm } from "@icons-pack/react-simple-icons";

import { cn } from "@/lib/utils";

import { ModeToggle } from "@/components/mode-toggle";



function Link({
	href,
	children,
}: {
	href    : string;
	children: React.ReactNode;
}) {
	return (
		<a
			target="_blank"
			rel="noopener noreferrer"
			className="opacity-80 hover:opacity-100 transition-opacity *:[svg]:p-0.5"
			href={href}
		>{children}</a>
	);
}



export interface HeaderProps extends React.ComponentProps<"header"> {
	heading: string;
}

export function Header({
	heading,
	className,
	children,
	...props
}: HeaderProps) {
	return (
		<header
			className={cn(
				"flex items-center gap-2 h-16 px-6",
				className,
			)}
			{...props}
		>
			<h1 className="flex-1 font-semibold truncate">
				{heading}
			</h1>
			<div className="flex items-center gap-4">
				{children}
				<Link
					href="https://www.npmjs.com/package/@kimzuni/templify"
				>
					<SiNpm/>
				</Link>
				<Link
					href="https://github.com/kimzuni-labs/templify"
				>
					<SiGithub/>
				</Link>

				<ModeToggle/>
			</div>
		</header>
	);
}
