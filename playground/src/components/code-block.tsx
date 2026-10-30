import { Fragment } from "react";
import {
	DownloadIcon,
	type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useHighlightedCode, type Language } from "@/hooks/use-highlighted-code";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	CodeBlock as Base,
	CodeBlockActions,
	CodeBlockContent,
	CodeBlockCopyButton,
	CodeBlockHeader,
	CodeBlockLine,
	CodeBlockTitle,
} from "@/components/ui/code-block";



function download(value: string, filename: string) {
	const url = URL.createObjectURL(new Blob([value], { type: "text/plain" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}



export interface CodeBlockProps extends React.ComponentProps<typeof Base> {
	icon?    : LucideIcon;
	label?   : React.ReactNode;
	source   : string | string[];
	language?: Language;
	download?: string;
}

export function CodeBlock({
	icon: Icon,
	label,
	source,
	language = "ansi",
	download: downloadFilename,
	className,
	children,
	...props
}: CodeBlockProps) {
	const code = Array.isArray(source) ? source.join("\n") : source;

	const lines = useHighlightedCode(code, language);

	const Header = (Icon ?? label) ? CodeBlockHeader : Fragment;

	return (
		<Base
			tabIndex={0}
			className={cn(
				"w-full min-h-0 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
				className,
			)}
			{...props}
		>
			<Header>
				{(Icon ?? label) && (
					<CodeBlockTitle>
						{Icon && <Icon/>}
						{label && label}
					</CodeBlockTitle>
				)}
				<CodeBlockActions>
					{downloadFilename && (
						<Button
							variant="ghost"
							size="icon-xs"
							aria-label="Download"
							onClick={() => download(code, downloadFilename)}
						>
							<DownloadIcon/>
						</Button>
					)}
					<CodeBlockCopyButton value={code}/>
				</CodeBlockActions>
			</Header>
			<ScrollArea
				className="flex flex-col min-h-0"
				viewportProps={{
					tabIndex : -1,
					className: "h-auto min-h-0",
				}}
			>
				<CodeBlockContent
					tabIndex={-1}
					lineNumbers
					className="overflow-visible"
				>
					{lines.map((line, index) => (
						<CodeBlockLine
							key={index}
						>
							{line}
						</CodeBlockLine>
					))}
				</CodeBlockContent>
				<ScrollBar orientation="horizontal"/>
			</ScrollArea>
		</Base>
	);
}
