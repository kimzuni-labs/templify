import { useState } from "react";
import { CopyIcon, CheckIcon, CircleXIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { InputGroup, InputGroupTextarea, InputGroupButton, InputGroupText } from "@/components/ui/input-group";
import {
	InputGroupAddon as BaseInputGroupAddon,
} from "@/components/ui/input-group";



export interface InputGroupAddonProps extends React.ComponentProps<typeof BaseInputGroupAddon> {
}

export function InputGroupAddon(props: InputGroupAddonProps) {
	return (
		<BaseInputGroupAddon
			onClick={(e) => {
				if ((e.target as HTMLElement).closest("button")) {
					return;
				}
				e.currentTarget.parentElement?.querySelector<HTMLElement>("input,textarea")?.focus();
			}}
			{...props}
		/>
	);
}



interface CopyButtonProps extends React.ComponentProps<typeof InputGroupButton> {
	onCopySuccess?: (value: string) => void;
	onCopyError?  : (err: Error) => void;
	value         : string;
}

function CopyButton({
	value,
	onCopySuccess,
	onCopyError,
	className,
	...props
}: CopyButtonProps) {
	const [copied, setCopied] = useState(false);
	const [copyingError, setCopyingError] = useState<Error | null>(null);

	const handleClick = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopyingError(null);
			setCopied(true);
			onCopySuccess?.(value);
		} catch (err: unknown) {
			setCopied(false);
			console.error("Failed to copy text: ", err);
			const error = err instanceof Error ? err : new Error(String(err));
			setCopyingError(error);
			onCopyError?.(error);
		} finally {
			setTimeout(() => {
				setCopied(false);
				setCopyingError(null);
			}, 2000);
		}
	};

	return (
		<InputGroupButton
			size="icon-xs"
			onClick={handleClick}
			data-copied-state={copyingError ? "error" : copied ? "success" : undefined}
			data-slot="copy-button"
			className={cn("cursor-pointer", className)}
			{...props}
		>
			<CopyIcon className="absolute transition-opacity opacity-100 group-data-copied-state/button:opacity-0"/>
			<CheckIcon className="absolute transition-opacity opacity-0 group-data-[copied-state=success]/button:opacity-100 text-primary"/>
			<CircleXIcon className="absolute transition-opacity opacity-0 group-data-[copied-state=error]/button:opacity-100 text-destructive"/>
		</InputGroupButton>
	);
}



export interface TextAreaProps extends React.ComponentProps<typeof InputGroupTextarea> {
	label?        : React.ReactNode;
	value?        : string;
	invalid?      : boolean;
	scrollAreaRef?: React.Ref<HTMLDivElement>;
	copyButton?   : boolean;
	onCopyError?  : (err: Error) => void;
	viewportProps?: React.ComponentProps<typeof ScrollArea>["viewportProps"];
}

export function TextArea({
	label,
	invalid,
	scrollAreaRef,
	copyButton = false,
	onCopyError,
	viewportProps,
	className,
	children,
	...props
}: TextAreaProps) {
	const { value = "" } = props;

	return (
		<InputGroup
			data-invalid={invalid}
			className={cn(
				"relative items-stretch overflow-hidden font-mono flex flex-col h-full!",
				className,
			)}
		>
			<ScrollArea
				className="flex-1 py-2 px-2.5 min-h-0 h-full cursor-text **:data-[slot=scroll-area-scrollbar]:cursor-default"
				viewportProps={{
					tabIndex: -1,
					...viewportProps,
				}}
				onClick={(e) => {
					if ((e.target as HTMLElement).closest("[data-slot=scroll-area-scrollbar]")) {
						return;
					}
					e.currentTarget.querySelector("textarea")?.focus();
				}}
			>
				<InputGroupTextarea
					className="p-0 min-h-16 min-w-full w-fit leading-6 text-nowrap aria-invalid:text-destructive aria-invalid:font-semibold"
					aria-invalid={invalid}
					{...props}
				/>
				<ScrollBar orientation="horizontal"/>
			</ScrollArea>

			{!!label && (
				<InputGroupAddon
					align="block-start"
					className="border-b has-[&_[data-slot=copy-button]]:pr-9"
				>
					<InputGroupText className="font-mono font-medium">
						{label}
						{copyButton && (
							<CopyButton value={value} className="absolute right-1.5"/>
						)}
					</InputGroupText>
				</InputGroupAddon>
			)}

			{children}

			{!label && copyButton && (
				<CopyButton value={value} className="absolute top-1.5 right-1.5 ml-auto"/>
			)}
		</InputGroup>
	);
}
